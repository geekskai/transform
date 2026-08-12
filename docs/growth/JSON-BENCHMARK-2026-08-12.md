# JSON workflow engineering benchmark

Measured: 2026-08-12
Runtime: Node v24.16.0, macOS x64
Method: synthetic JSON, median of three runs

| Payload | Records |     Parse | Tree walk |    Search | Structural diff | Representative generation |
| ------- | ------: | --------: | --------: | --------: | --------------: | ------------------------: |
| 0.1 MB  |     810 |   1.05 ms |   1.38 ms |   3.08 ms |         3.96 ms |                   0.01 ms |
| 1 MB    |   7,912 |   9.08 ms |   3.24 ms |  10.19 ms |        26.52 ms |                  <0.01 ms |
| 5 MB    |  38,807 |  43.07 ms |  38.84 ms |  61.99 ms |        96.18 ms |                   0.01 ms |
| 20 MB   | 153,313 | 185.82 ms |  71.02 ms | 206.35 ms |       401.61 ms |                  <0.01 ms |

## Interpretation

The Node baseline shows that full structural diff is the first representative operation to exceed 400 ms at 20 MB. Parsing and search also cross the 100 ms interaction threshold. A future large-file mode should therefore move parsing, indexing, search, and diff off the main UI thread and avoid rendering every tree node.

This is not a supported-file-size promise. The generation measurement inspects only the top-level representative shape and does not measure the production WebAssembly TypeScript generator. The harness measures algorithms outside the final UI and does not cover DOM rendering, Monaco, worker transfer cost, peak memory, mobile hardware, or browser termination behavior.

## Release gate before publishing a size limit

- Run the final Workbench in current Chrome, Edge, Firefox, and Safari.
- Test desktop and at least one representative mid-range mobile device.
- Record p50/p95 completion time, main-thread blocking, peak memory, failure rate, and cancellation recovery.
- Test valid JSON, JSONL, malformed JSON, wide objects, deep nesting, and large strings.
- Publish only the lowest payload size that passes all supported-browser and recovery criteria.

Reproduce with:

```bash
node scripts/benchmark-json-workflows.mjs 0.1 1 5 20
```
