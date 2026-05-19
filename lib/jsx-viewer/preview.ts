export const PREVIEW_COMPONENT_ERROR =
  "No previewable React component found. Define App/Preview/Component, declare a PascalCase component, or paste a JSX fragment.";

export const SAMPLE_JSX = `const ProductCard = ({ title, price, tags = [] }) => (
  <article className="rounded-2xl border border-slate-200 p-4 shadow-sm">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-2 text-slate-700">\${price}</p>
    <ul className="mt-3 flex gap-2">
      {tags.map(tag => (
        <li key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs">
          {tag}
        </li>
      ))}
    </ul>
  </article>
);

const App = () => (
  <ProductCard
    title="Starter Card"
    price={29}
    tags={["React", "JSX", "Preview"]}
  />
);
`;

export const JSX_SNIPPETS = [
  {
    id: "starter",
    label: "Starter card",
    description: "Component + App entry",
    code: SAMPLE_JSX
  },
  {
    id: "fragment",
    label: "JSX fragment",
    description: "Paste markup only",
    code: `<div className="space-y-3 p-6">
  <h1 className="text-2xl font-bold">Hello JSX</h1>
  <p className="text-slate-600">Edit this fragment and preview instantly.</p>
  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
    Click me
  </button>
</div>`
  },
  {
    id: "counter",
    label: "useState counter",
    description: "Interactive state demo",
    code: `const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="mx-auto max-w-sm rounded-2xl border p-6 text-center shadow-sm">
      <p className="text-5xl font-bold tabular-nums">{count}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
          onClick={() => setCount(count - 1)}
        >
          -
        </button>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};`
  },
  {
    id: "list",
    label: "List rendering",
    description: "map() over items",
    code: `const App = () => {
  const items = ["React", "JSX", "Preview"];

  return (
    <ul className="space-y-2 p-4">
      {items.map(item => (
        <li key={item} className="rounded-lg bg-slate-100 px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
};`
  }
] as const;

function getPreviewCandidateNames(source: string) {
  const firstComponentMatch = source.match(
    /\b(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)\b/
  );
  const firstComponentName = firstComponentMatch?.[1] || "";

  return Array.from(
    new Set(["App", "Preview", "Component", firstComponentName].filter(Boolean))
  );
}

export function normalizePreviewSource(source: string) {
  const trimmedSource = source.trim();
  return /^\s*</.test(trimmedSource)
    ? `const App = () => (${source});`
    : source;
}

function stripModuleSyntax(source: string) {
  return source
    .replace(/^\s*import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+(const|function|class)\s+/g, "$1 ");
}

function buildPreviewRuntime(source: string) {
  const normalizedSource = normalizePreviewSource(source);
  const previewCandidateNames = getPreviewCandidateNames(normalizedSource);

  return `${stripModuleSyntax(normalizedSource)}

const __previewCandidateNames = ${JSON.stringify(previewCandidateNames)};
let __PreviewComponent = null;

for (const __name of __previewCandidateNames) {
  try {
    const __candidate = eval(__name);
    if (__candidate) {
      __PreviewComponent = __candidate;
      break;
    }
  } catch (_) {}
}

if (!__PreviewComponent) {
  throw new Error(${JSON.stringify(PREVIEW_COMPONENT_ERROR)});
}

const __root = ReactDOM.createRoot(document.getElementById("root"));
__root.render(
  React.isValidElement(__PreviewComponent)
    ? __PreviewComponent
    : React.createElement(__PreviewComponent)
);`;
}

function sanitizeScriptContent(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

export function buildPreviewDocument(
  compiledRuntimeCode: string,
  includeTailwind: boolean
) {
  const safeCompiledRuntimeCode = sanitizeScriptContent(compiledRuntimeCode);

  const tailwindScript = includeTailwind
    ? `<script src="https://cdn.tailwindcss.com"></script>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${tailwindScript}
    <style>
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: #ffffff;
        color: #0f172a;
      }
      #root {
        min-height: 100vh;
        padding: 16px;
      }
      #error {
        margin: 16px;
        border-radius: 10px;
        border: 1px solid #fecaca;
        background: #fee2e2;
        color: #991b1b;
        padding: 10px 12px;
        font-size: 13px;
        white-space: pre-wrap;
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="error"></div>
    <div id="root"></div>

    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script>
      const showError = message => {
        const errorEl = document.getElementById("error");
        errorEl.style.display = "block";
        errorEl.textContent = message;
      };

      try {
${safeCompiledRuntimeCode
  .split("\n")
  .map(line => `        ${line}`)
  .join("\n")}
      } catch (error) {
        showError(error && error.message ? error.message : String(error));
      }
    </script>
  </body>
</html>`;
}

export type CompileResult =
  | { ok: true; previewRuntimeCode: string }
  | { ok: false; message: string; line?: number; column?: number };

/** Parse Babel / syntax error locations like `(12:5)` from the message. */
export function parseErrorLocation(message: string) {
  const match = message.match(/\((\d+):(\d+)\)/);
  if (!match) return {};

  return {
    line: Number(match[1]),
    column: Number(match[2])
  };
}

export function compileJsxInput(
  input: string,
  transform: (code: string, options: object) => { code?: string | null }
): CompileResult {
  if (!input.trim()) {
    return { ok: true, previewRuntimeCode: "" };
  }

  try {
    const normalizedInput = normalizePreviewSource(input);
    const previewRuntime = transform(buildPreviewRuntime(normalizedInput), {
      presets: ["react"],
      sourceType: "script",
      filename: "preview.jsx"
    });

    return { ok: true, previewRuntimeCode: previewRuntime.code || "" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to parse JSX input.";
    const { line, column } = parseErrorLocation(message);

    return { ok: false, message, line, column };
  }
}
