# IndexNow 批量提交脚本

> `scripts/submit-indexnow.mjs` — 将站点 sitemap 中的所有 URL 批量提交到 [IndexNow](https://www.indexnow.org/) 协议，通知搜索引擎（Bing、Yandex 等）即时收录。

---

## 目录

- [工作原理](#工作原理)
- [前置准备](#前置准备)
- [快速开始](#快速开始)
- [全部命令](#全部命令)
- [CLI 参数](#cli-参数)
- [环境变量](#环境变量)
- [配置优先级](#配置优先级)
- [典型工作流](#典型工作流)
- [常见问题](#常见问题)

---

## 工作原理

```
sitemap.xml / sitemap index
        │
        ▼
  解析所有 URL（自动递归子 sitemap）
        │
        ▼
  去重 + 分批（默认每批 200 条）
        │
        ▼
  顺序 POST 到 IndexNow API
  ┌─────────────────────────────────┐
  │  5xx / 429 自动重试（指数退避）   │
  └─────────────────────────────────┘
        │
        ▼
  输出提交结果摘要
```

**支持的 sitemap 格式：**

- 单个 `urlset` 文件（标准 sitemap）
- `sitemapindex` 文件（脚本自动递归抓取所有子 sitemap）
- 本地文件路径 或 远程 HTTPS URL

---

## 前置准备

### 1. 获取 IndexNow Key

前往 [IndexNow Key 生成器](https://www.bing.com/indexnow/getstarted) 生成一个唯一 Key（形如 `319ccd32fd714727af6aea1835d9b02a`）。

### 2. 放置 Key 验证文件

将 Key 存放为 `public/<key>.txt`，文件内容与文件名（不含 `.txt`）完全相同：

```
public/
└── 319ccd32fd714727af6aea1835d9b02a.txt   ← 文件内容也是这串 key
```

> 脚本会自动扫描 `public/` 目录检测 key，**无需任何额外配置**。
> 也可通过环境变量或 CLI 参数手动指定（见下文）。

### 3. 确保网站线上运行正常

Next.js 通过 `next.config.js` 将 `/sitemap.xml` 重写到 `pages/api/sitemap.ts` 动态生成。
本脚本**默认直接请求线上的** `https://folioify.com/sitemap.xml`（由环境变量 `SITE_URL` / `NEXT_PUBLIC_SITE_URL` 推导，与 `lib/seo.ts` 的 `SITE_CONFIG.baseUrl` 一致）获取最新数据，无需手动维护本地文件。

---

## 快速开始

```bash
# 预演（只拉 sitemap、打印 host/key/条数，不 POST IndexNow）
yarn indexnow -- --dry-run

# 正式提交
yarn indexnow
```

（Yarn 1 下若需传参，使用 `yarn indexnow -- --dry-run`；npm 可用 `npm run indexnow -- --dry-run`。）

---

## 命令与参数

| 命令            | 说明                             |
| --------------- | -------------------------------- |
| `yarn indexnow` | 正式提交；可加 `--` 后接下方参数 |

| 参数                    | 说明                           |
| ----------------------- | ------------------------------ |
| `--dry-run`             | 预演，不调用 IndexNow API      |
| `--sitemap <path\|url>` | 覆盖 sitemap（默认见环境变量） |

其它（key、端点、每批条数等）通过**环境变量**配置，见下表。

**示例：**

```bash
yarn indexnow -- --sitemap https://folioify.com/sitemap.xml
INDEXNOW_ENDPOINT=https://www.bing.com/indexnow yarn indexnow
```

---

## 环境变量

适合在 CI/CD（GitHub Actions 等）中使用，避免将 Key 写入代码：

| 变量                                | 说明                                | 默认值                                         |
| ----------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | 站点根 URL（用于默认 sitemap 地址） | `https://folioify.com`                         |
| `INDEXNOW_KEY`                      | API Key                             | 自动从 `public/<key>.txt` 检测                 |
| `INDEXNOW_KEY_LOCATION`             | Key 验证文件完整 URL                | 根据 sitemap 中 URL 推导：`<origin>/<key>.txt` |
| `INDEXNOW_ENDPOINT`                 | API 端点                            | `https://api.indexnow.org/indexnow`            |
| `SITEMAP_PATH`                      | 本地 sitemap 路径或远程 URL         | `<siteUrl>/sitemap.xml`                        |
| `INDEXNOW_BATCH_SIZE`               | 每批 URL 数（≤10000）               | `200`                                          |

**GitHub Actions 示例：**

```yaml
- name: Submit IndexNow
  run: yarn indexnow
  env:
    INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
```

---

## 配置优先级

当同一项配置存在多个来源时，优先级从高到低为：

```
CLI（--sitemap / --dry-run）> 环境变量 > public/<key>.txt > 默认值
```

---

## 典型工作流

### 本地手动提交

```bash
# 先 build（生成最新 sitemap）
yarn build

# 预演
yarn indexnow -- --dry-run

# 正式提交
yarn indexnow
```

### CI 自动提交（推荐）

在 GitHub Actions 的 deploy job 末尾追加：

```yaml
jobs:
  deploy:
    steps:
      # ... 其他构建步骤 ...

      - name: Submit to IndexNow
        run: yarn indexnow
        env:
          INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
```

> 💡 将 Key 存储在 GitHub Secrets 中，不要硬编码。

---

## 常见问题

### Q: 提交后搜索引擎多久收录？

通常 Bing 在数小时内处理，Google 官方不声明时间但实测较快。IndexNow 只是**通知**，最终是否收录由搜索引擎决定。

### Q: API 响应 `202 Accepted` 是成功吗？

是的。IndexNow 响应码说明：

| 状态码 | 含义                                             |
| ------ | ------------------------------------------------ |
| `200`  | 成功处理                                         |
| `202`  | 已接受，稍后处理（正常）                         |
| `400`  | 请求格式错误                                     |
| `403`  | Key 验证失败，检查 `public/<key>.txt` 是否可访问 |
| `422`  | URL 不属于该 host                                |
| `429`  | 请求过于频繁，稍后再试（脚本会自动退避重试）     |

### Q: 遇到 "未找到 IndexNow key" 错误？

按优先级检查：

1. `public/` 下是否有 `<key>.txt`，且文件名与内容一致
2. 是否设置了环境变量 `INDEXNOW_KEY`

### Q: 能只提交部分 URL 吗？

目前脚本提交 sitemap 中所有 URL。如需过滤，可在调用前修改 sitemap，或 fork 脚本在 `uniqueUrls()` 后添加 `.filter()` 逻辑。
