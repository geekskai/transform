import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, basename } from "path";

// ─── Site URL（与 lib/seo.ts SITE_CONFIG.baseUrl 对齐，无 TS 依赖）────────────
function getDefaultSiteUrl() {
  const raw = (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  ).trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://folioify.com";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_SITE_URL = getDefaultSiteUrl();
const DEFAULT_SITEMAP_PATH = `${DEFAULT_SITE_URL}/sitemap.xml`;
const DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow";
const DEFAULT_BATCH_SIZE = 200; // IndexNow 单次建议 ≤ 10 000，200 较保守
const DEFAULT_CONCURRENCY = 3; // 同时并发批次数
const DEFAULT_RETRY_TIMES = 3; // 失败重试次数
const DEFAULT_RETRY_DELAY_MS = 1000; // 重试初始等待（指数退避）
const INDEXNOW_MAX_URLS = 10_000; // 协议硬上限

// ─── CLI argument parser ───────────────────────────────────────────────────────
function parseArgs(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    const flagWithValue = (flag, key, transform = v => v) => {
      if (arg === flag && next) {
        options[key] = transform(next);
        i += 1;
        return true;
      }
      return false;
    };

    if (flagWithValue("--sitemap", "sitemapPath")) continue;
    if (flagWithValue("--key", "key")) continue;
    if (flagWithValue("--key-location", "keyLocation")) continue;
    if (flagWithValue("--endpoint", "endpoint")) continue;
    if (
      flagWithValue("--batch-size", "batchSize", v => {
        const n = Number.parseInt(v, 10);
        return !Number.isNaN(n) && n > 0
          ? Math.min(n, INDEXNOW_MAX_URLS)
          : undefined;
      })
    )
      continue;
    if (
      flagWithValue("--concurrency", "concurrency", v => {
        const n = Number.parseInt(v, 10);
        return !Number.isNaN(n) && n > 0 ? n : undefined;
      })
    )
      continue;
    if (
      flagWithValue("--retry", "retryTimes", v => {
        const n = Number.parseInt(v, 10);
        return !Number.isNaN(n) && n >= 0 ? n : undefined;
      })
    )
      continue;

    if (arg === "--dry-run") options.dryRun = true;
    if (arg === "--verbose") options.verbose = true;
    if (arg === "--help" || arg === "-h") options.help = true;
  }

  return options;
}

function printHelp() {
  console.log(`
IndexNow 批量提交 — scripts/submit-indexnow.mjs

用法:
  node ./scripts/submit-indexnow.mjs [选项]

常用:
  --dry-run          预演（不发送 IndexNow 请求）
  --verbose          打印 sitemap 解析过程

配置:
  --sitemap <url|path>   默认: ${DEFAULT_SITEMAP_PATH}
  --key <key>
  --key-location <url>
  --endpoint <url>       默认: ${DEFAULT_ENDPOINT}
  --batch-size <n>       默认: ${DEFAULT_BATCH_SIZE}
  --concurrency <n>      默认: ${DEFAULT_CONCURRENCY}
  --retry <n>            默认: ${DEFAULT_RETRY_TIMES}

环境变量:
  SITE_URL / NEXT_PUBLIC_SITE_URL  站点根 URL（默认 ${DEFAULT_SITE_URL}）
  SITEMAP_PATH, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION, INDEXNOW_ENDPOINT,
  INDEXNOW_BATCH_SIZE, INDEXNOW_CONCURRENCY, INDEXNOW_RETRY, INDEXNOW_VERBOSE=1
`);
}

// ─── Sitemap parsing ───────────────────────────────────────────────────────────
function extractLocValues(xml) {
  const urls = [];
  const locRegex = /<loc>([\s\S]*?)<\/loc>/g;
  let match = locRegex.exec(xml);
  while (match !== null) {
    let raw = match[1].trim();
    if (raw.startsWith("<![CDATA[") && raw.endsWith("]]>")) {
      raw = raw.slice(9, -3).trim();
    }
    const url = raw.trim();
    if (url && /^https?:\/\//.test(url)) urls.push(url);
    match = locRegex.exec(xml);
  }
  return urls;
}

/**
 * Extract <loc> entries from a sitemap index XML.
 * Returns an array of child sitemap URLs.
 */
function extractSitemapIndexEntries(xml) {
  return extractLocValues(xml).filter(url => /^https?:\/\//.test(url));
}

/**
 * Fetch text content from a URL with basic error handling.
 */
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`获取 ${url} 失败，状态码 ${res.status}`);
  }
  return res.text();
}

/**
 * Recursively resolve a sitemap URL / local file path into an array of page URLs.
 * Handles both sitemap index and urlset types.
 */
async function resolveUrls(source, { verbose = false } = {}) {
  let xml;

  if (/^https?:\/\//.test(source)) {
    if (verbose) console.log(`  ↳ 获取远程 sitemap：${source}`);
    xml = await fetchText(source);
  } else {
    if (!existsSync(source)) throw new Error(`Sitemap 文件不存在：${source}`);
    if (verbose) console.log(`  ↳ 读取本地 sitemap：${source}`);
    xml = readFileSync(source, "utf-8");
  }

  if (xml.includes("<sitemapindex")) {
    const childUrls = extractSitemapIndexEntries(xml);
    if (verbose) {
      console.log(`  ↳ Sitemap index，包含 ${childUrls.length} 个子 sitemap`);
    }
    // Recursively resolve all child sitemaps in parallel
    const nested = await Promise.all(
      childUrls.map(u => resolveUrls(u, { verbose }))
    );
    return nested.flat();
  }

  // Regular urlset
  return extractLocValues(xml).filter(url => /^https?:\/\//.test(url));
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function uniqueUrls(urls) {
  return [...new Set(urls)];
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function detectKeyFromPublic(publicDir) {
  if (!existsSync(publicDir)) return null;
  const files = readdirSync(publicDir).filter(f => f.endsWith(".txt"));
  for (const file of files) {
    const filepath = resolve(publicDir, file);
    const content = readFileSync(filepath, "utf-8").trim();
    const nameWithoutExt = basename(file, ".txt");
    if (content && content === nameWithoutExt) return content;
  }
  return null;
}

// ─── Concurrency pool ──────────────────────────────────────────────────────────
/**
 * Run an array of async task factories with a bounded concurrency limit.
 *
 * @param {Array<() => Promise<void>>} tasks
 * @param {number} concurrency
 */
async function pool(tasks, concurrency) {
  const results = [];
  const queue = [...tasks];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        results.push(await task());
      }
    }
  );
  await Promise.all(workers);
  return results;
}

// ─── HTTP submission ───────────────────────────────────────────────────────────
async function submitBatch({
  endpoint,
  host,
  key,
  keyLocation,
  urls,
  batchIndex,
  totalBatches,
  retryTimes,
  retryDelayMs
}) {
  const label = `[${batchIndex}/${totalBatches}]`;
  const payload = { host, key, keyLocation, urlList: urls };

  let lastError;
  for (let attempt = 1; attempt <= retryTimes + 1; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const bodyText = await res.text();

      if (!res.ok) {
        throw new Error(`状态码 ${res.status}，响应：${bodyText}`);
      }

      const suffix = attempt > 1 ? `（第 ${attempt} 次尝试）` : "";
      console.log(`✅ 提交成功 ${label} — ${urls.length} 条 URL${suffix}`);
      if (bodyText) console.log(`   响应：${bodyText}`);
      return;
    } catch (err) {
      lastError = err;
      if (attempt <= retryTimes) {
        const delay = retryDelayMs * 2 ** (attempt - 1); // exponential back-off
        console.warn(
          `⚠️  提交失败 ${label}（第 ${attempt} 次），${delay}ms 后重试…`
        );
        await sleep(delay);
      }
    }
  }

  throw new Error(`IndexNow 提交失败 ${label}：${lastError.message}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const sitemapSource =
    options.sitemapPath || process.env.SITEMAP_PATH || DEFAULT_SITEMAP_PATH;
  const endpoint =
    options.endpoint || process.env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT;
  const batchSize = Math.min(
    options.batchSize ||
      Number.parseInt(process.env.INDEXNOW_BATCH_SIZE || "", 10) ||
      DEFAULT_BATCH_SIZE,
    INDEXNOW_MAX_URLS
  );
  const concurrency =
    options.concurrency ||
    Number.parseInt(process.env.INDEXNOW_CONCURRENCY || "", 10) ||
    DEFAULT_CONCURRENCY;
  const envRetry = process.env.INDEXNOW_RETRY;
  const retryTimes =
    options.retryTimes != null
      ? options.retryTimes
      : envRetry !== undefined && envRetry !== ""
      ? (() => {
          const n = Number.parseInt(envRetry, 10);
          return Number.isNaN(n) ? DEFAULT_RETRY_TIMES : n;
        })()
      : DEFAULT_RETRY_TIMES;
  const retryDelayMs = DEFAULT_RETRY_DELAY_MS;
  const verbose = options.verbose || process.env.INDEXNOW_VERBOSE === "1";

  const projectRoot = process.cwd();

  // Resolve sitemap source: absolute URL or relative local path
  const resolvedSource = /^https?:\/\//.test(sitemapSource)
    ? sitemapSource
    : resolve(projectRoot, sitemapSource);

  console.log(`\n🗺  解析 sitemap：${resolvedSource}`);
  const rawUrls = await resolveUrls(resolvedSource, { verbose });
  const urls = uniqueUrls(rawUrls);

  if (urls.length === 0) {
    throw new Error("未在 sitemap 中解析到任何 URL。");
  }

  const key =
    options.key ||
    process.env.INDEXNOW_KEY ||
    detectKeyFromPublic(resolve(projectRoot, "public"));

  if (!key) {
    throw new Error(
      "未找到 IndexNow key。\n" +
        "请通过以下任一方式提供：\n" +
        "  1. --key <your-key>\n" +
        "  2. 环境变量 INDEXNOW_KEY=<your-key>\n" +
        "  3. 在 public/ 下放置 <key>.txt（文件名与内容相同）"
    );
  }

  const firstOrigin = new URL(urls[0]).origin;
  const host = new URL(urls[0]).hostname;
  for (const u of urls) {
    if (new URL(u).hostname !== host) {
      throw new Error(
        `IndexNow 要求同一批 URL 属于同一主机。发现不一致：${u}（期望 host: ${host}）`
      );
    }
  }

  const keyLocation =
    options.keyLocation ||
    process.env.INDEXNOW_KEY_LOCATION ||
    `${firstOrigin}/${key}.txt`;

  // ── Dry-run ────────────────────────────────────────────────────────────────
  if (options.dryRun) {
    console.log("\n🔍 Dry-run 模式（不发送实际请求）");
    console.log(`   endpoint   : ${endpoint}`);
    console.log(`   host       : ${host}`);
    console.log(`   key        : ${key}`);
    console.log(`   keyLocation: ${keyLocation}`);
    console.log(`   batch-size : ${batchSize}`);
    console.log(`   concurrency: ${concurrency}`);
    console.log(`   retry      : ${retryTimes}`);
    console.log(`   URL 总数   : ${urls.length}`);
    console.log(`   预计批次   : ${Math.ceil(urls.length / batchSize)}`);
    console.log("\n  前 10 条 URL：");
    urls.slice(0, 10).forEach(url => console.log(`   - ${url}`));
    if (urls.length > 10) console.log(`   ... 等共 ${urls.length} 条`);
    return;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const batches = chunkArray(urls, batchSize);
  const totalBatches = batches.length;
  console.log(
    `\n🚀 开始提交：${urls.length} 条 URL，分 ${totalBatches} 批，并发 ${concurrency}，每批 ≤${batchSize} 条\n`
  );

  const startTime = Date.now();

  const tasks = batches.map((batchUrls, idx) => async () => {
    await submitBatch({
      endpoint,
      host,
      key,
      keyLocation,
      urls: batchUrls,
      batchIndex: idx + 1,
      totalBatches,
      retryTimes,
      retryDelayMs
    });
  });

  await pool(tasks, concurrency);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✨ 全部 ${urls.length} 条 URL 已成功提交（耗时 ${elapsed}s）`);
}

main().catch(error => {
  console.error(`\n❌ ${error.message || error}`);
  process.exit(1);
});
