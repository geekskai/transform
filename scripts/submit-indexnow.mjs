#!/usr/bin/env node
/**
 * IndexNow：拉取 sitemap → 去重 → 分批 POST 到 api.indexnow.org
 * Key：public/<key>.txt（文件名与内容均为 key）或环境变量 INDEXNOW_KEY
 *
 * 用法：
 *   yarn indexnow
 *   yarn indexnow -- --dry-run
 *   yarn indexnow -- --sitemap https://folioify.com/sitemap.xml
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, basename } from "path";

const SITE = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://folioify.com"
).replace(/\/$/, "");
const DEFAULT_SITEMAP = `${SITE}/sitemap.xml`;
const ENDPOINT =
  process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const BATCH_SIZE = Math.min(
  Number.parseInt(process.env.INDEXNOW_BATCH_SIZE || "200", 10) || 200,
  10_000
);

function parseArgv(argv) {
  let dryRun = false;
  let sitemap = process.env.SITEMAP_PATH || DEFAULT_SITEMAP;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--sitemap" && argv[i + 1]) {
      sitemap = argv[i + 1];
      i += 1;
    }
  }
  return { dryRun, sitemap };
}

function extractLocs(xml) {
  const urls = [];
  const re = /<loc>([\s\S]*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    let raw = m[1].trim();
    if (raw.startsWith("<![CDATA[") && raw.endsWith("]]>")) {
      raw = raw.slice(9, -3).trim();
    }
    if (/^https?:\/\//.test(raw)) urls.push(raw);
  }
  return urls;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`获取失败 ${url} → ${res.status}`);
  return res.text();
}

async function loadPageUrls(source) {
  const xml = /^https?:\/\//.test(source)
    ? await fetchText(source)
    : readFileSync(source, "utf-8");

  if (xml.includes("<sitemapindex")) {
    const subs = extractLocs(xml);
    const parts = await Promise.all(subs.map(s => loadPageUrls(s)));
    return parts.flat();
  }
  return extractLocs(xml);
}

function findKey(publicDir) {
  if (!existsSync(publicDir)) return null;
  for (const file of readdirSync(publicDir)) {
    if (!file.endsWith(".txt")) continue;
    const p = resolve(publicDir, file);
    const content = readFileSync(p, "utf-8").trim();
    const name = basename(file, ".txt");
    if (content === name) return content;
  }
  return null;
}

async function postOnce(body) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`${res.status} ${text}`);
    err.status = res.status;
    throw err;
  }
  return text;
}

async function postWithRetry(payload, retries = 3) {
  let last;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await postOnce(payload);
    } catch (e) {
      last = e;
      const st = e.status;
      if (st >= 400 && st < 500 && st !== 429) throw e;
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * 2 ** i));
      }
    }
  }
  throw last;
}

async function main() {
  const { dryRun, sitemap } = parseArgv(process.argv.slice(2));
  const root = process.cwd();
  const source = /^https?:\/\//.test(sitemap)
    ? sitemap
    : resolve(root, sitemap);

  console.log(`sitemap: ${source}`);
  const raw = await loadPageUrls(source);
  const urls = [...new Set(raw)];
  if (!urls.length) throw new Error("sitemap 中无有效 URL");

  const key = process.env.INDEXNOW_KEY || findKey(resolve(root, "public"));
  if (!key)
    throw new Error("缺少 key：设置 INDEXNOW_KEY 或放置 public/<key>.txt");

  const host = new URL(urls[0]).hostname;
  for (const u of urls) {
    if (new URL(u).hostname !== host) {
      throw new Error(`主机不一致：${u}`);
    }
  }
  const origin = new URL(urls[0]).origin;
  const keyLocation =
    process.env.INDEXNOW_KEY_LOCATION || `${origin}/${key}.txt`;

  if (dryRun) {
    console.log(
      `[dry-run] host=${host} keyLocation=${keyLocation} urls=${urls.length}`
    );
    urls.slice(0, 5).forEach(u => console.log(`  ${u}`));
    if (urls.length > 5) console.log(`  ... +${urls.length - 5}`);
    return;
  }

  const batches = [];
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE));
  }

  console.log(`提交 ${urls.length} 条，${batches.length} 批 → ${ENDPOINT}`);
  for (let i = 0; i < batches.length; i += 1) {
    const n = i + 1;
    const body = {
      host,
      key,
      keyLocation,
      urlList: batches[i]
    };
    const resp = await postWithRetry(body);
    console.log(
      `ok [${n}/${batches.length}] ${batches[i].length} urls`,
      resp || ""
    );
  }
  console.log("完成");
}

main().catch(e => {
  console.error(e.message || e);
  process.exit(1);
});
