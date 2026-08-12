const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textContent(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
if (!sitemapResponse.ok) {
  throw new Error(`sitemap.xml returned ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match =>
  decodeHtml(match[1])
);
const failures = [];
const titles = new Map();

for (const location of locations) {
  const pathname = new URL(location).pathname;
  const localUrl = `${baseUrl}${pathname}`;
  const response = await fetch(localUrl);
  const html = await response.text();
  const title = decodeHtml(
    html.match(/<title>(.*?)<\/title>/i)?.[1] || ""
  ).trim();
  const canonical = html.match(
    /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i
  )?.[1];
  const h1 = html.match(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i)?.[0];
  const body = textContent(html);

  if (response.status !== 200)
    failures.push(`${pathname}: HTTP ${response.status}`);
  if (!title) failures.push(`${pathname}: missing title`);
  if (!h1) failures.push(`${pathname}: missing <h1>`);
  if (!canonical || new URL(canonical).pathname !== pathname) {
    failures.push(
      `${pathname}: canonical mismatch (${canonical || "missing"})`
    );
  }
  if (/name="robots" content="[^"]*noindex/i.test(html)) {
    failures.push(`${pathname}: sitemap URL is noindex`);
  }
  if (body.length < 500)
    failures.push(`${pathname}: rendered text is too short (${body.length})`);

  const previous = titles.get(title);
  if (title && previous)
    failures.push(`${pathname}: duplicate title with ${previous}`);
  if (title) titles.set(title, pathname);
}

if (failures.length) {
  console.error(
    JSON.stringify({ baseUrl, checked: locations.length, failures }, null, 2)
  );
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        baseUrl,
        checked: locations.length,
        result: "pass",
        checks: [
          "HTTP 200",
          "unique title",
          "<h1>",
          "self-referencing canonical",
          "indexable",
          "substantive rendered text"
        ]
      },
      null,
      2
    )
  );
}
