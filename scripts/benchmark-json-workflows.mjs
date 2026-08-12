import { performance } from "node:perf_hooks";

const targetSizesMb = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : [0.1, 1, 5, 20];

function buildJson(targetMb) {
  const targetBytes = Math.floor(targetMb * 1024 * 1024);
  const records = [];
  let bytes = 2;
  let id = 0;

  while (bytes < targetBytes) {
    const record = {
      id,
      active: id % 3 !== 0,
      profile: {
        name: `developer-${id}`,
        team: `team-${id % 17}`,
        tags: ["api", "json", `group-${id % 11}`]
      },
      metrics: [id, id % 97, id % 13]
    };
    const serialized = JSON.stringify(record);
    records.push(record);
    bytes += Buffer.byteLength(serialized) + 1;
    id += 1;
  }

  return JSON.stringify({ records });
}

function walkTree(value) {
  let nodes = 0;
  const stack = [value];
  while (stack.length) {
    const current = stack.pop();
    nodes += 1;
    if (current && typeof current === "object") {
      for (const child of Object.values(current)) stack.push(child);
    }
  }
  return nodes;
}

function searchTree(value, needle) {
  let matches = 0;
  const stack = [value];
  while (stack.length) {
    const current = stack.pop();
    if (current && typeof current === "object") {
      for (const [key, child] of Object.entries(current)) {
        if (key.includes(needle)) matches += 1;
        stack.push(child);
      }
    } else if (String(current).includes(needle)) {
      matches += 1;
    }
  }
  return matches;
}

function diffTrees(left, right) {
  let differences = 0;
  const stack = [[left, right]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (Object.is(a, b)) continue;
    if (!a || !b || typeof a !== "object" || typeof b !== "object") {
      differences += 1;
      continue;
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) stack.push([a[key], b[key]]);
  }
  return differences;
}

function inferTypeScript(value, name = "Root") {
  const sample = Array.isArray(value) ? value[0] : value;
  if (!sample || typeof sample !== "object") return `type ${name} = unknown;`;
  const lines = Object.entries(sample).map(([key, child]) => {
    const type = Array.isArray(child)
      ? `${typeof child[0]}[]`
      : child === null
      ? "null"
      : typeof child === "object"
      ? "Record<string, unknown>"
      : typeof child;
    return `  ${key}: ${type};`;
  });
  return `interface ${name} {\n${lines.join("\n")}\n}`;
}

function measure(operation, iterations = 3) {
  const samples = [];
  let result;
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    result = operation();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return {
    medianMs: Number(samples[Math.floor(samples.length / 2)].toFixed(2)),
    result
  };
}

const results = [];
for (const requestedMb of targetSizesMb) {
  const source = buildJson(requestedMb);
  const parsedMeasurement = measure(() => JSON.parse(source));
  const parsed = parsedMeasurement.result;
  const changed = JSON.parse(source);
  changed.records[changed.records.length - 1].active = "changed";

  results.push({
    requestedMb,
    actualMb: Number((Buffer.byteLength(source) / 1024 / 1024).toFixed(2)),
    records: parsed.records.length,
    parseMs: parsedMeasurement.medianMs,
    treeWalkMs: measure(() => walkTree(parsed)).medianMs,
    searchMs: measure(() => searchTree(parsed, "team-7")).medianMs,
    diffMs: measure(() => diffTrees(parsed, changed)).medianMs,
    generationMs: measure(() => inferTypeScript(parsed, "ApiPayload")).medianMs
  });
}

console.log(
  JSON.stringify(
    {
      runtime: `${process.release.name} ${process.version}`,
      platform: `${process.platform} ${process.arch}`,
      measuredAt: new Date().toISOString(),
      methodology:
        "Synthetic JSON; median of three runs; parsing, tree traversal, search, structural diff, and representative TypeScript generation.",
      results
    },
    null,
    2
  )
);
