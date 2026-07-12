# JSX Viewer Dependency Preservation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent Sandpack setup updates from overwriting JSX viewer source and removing source-referenced third-party dependencies.

**Architecture:** Keep the editor's current `/src/App.tsx` content as the canonical source file. `SandpackBridge` receives that canonical content, detects a reset to the original snapshot, and restores the canonical file instead of persisting the stale snapshot. Dependency changes explicitly trigger the same synchronization, while source-detected and manual dependencies remain separate inputs to the existing effective dependency map.

**Tech Stack:** Next.js 14, React 18, TypeScript, `@codesandbox/sandpack-react`, session storage, in-app browser verification.

## Global Constraints

- Preserve the existing Sandpack editor and preview experience.
- Do not introduce iframe/document-builder changes or remove the existing dependency panel.
- Source-referenced packages remain protected while their imports remain in the editor.
- Manual dependencies remain until explicitly removed or cleared.
- Preview install/compile failures must not mutate source or dependency state.
- Keep changes surgical to `components/jsx-viewer/SandpackJsxViewer.tsx` plus regression documentation.

### Task 1: Make the Sandpack bridge preserve canonical editor source

**Files:**

- Modify: `/Users/gankai/Desktop/geekskai/2026/folioify/components/jsx-viewer/SandpackJsxViewer.tsx:166-236`
- Test: in-app browser regression scenario for `/tools/jsx-viewer`

**Interfaces:**

- Consumes: `SandpackBridge`'s existing `actionRef`, `onCodeChange`, `sandpack.files[APP_FILE]`, and the generated `buildAppFile` output.
- Produces: `SandpackBridge` props `sourceCode`, `initialCode`, and `dependencyKey`; preserves the canonical App file through Sandpack setup changes.

- [ ] **Step 1: Capture the failing browser behavior**

  Open `http://localhost:3000/tools/jsx-viewer`, replace the App editor with:

  ```tsx
  import { format } from "date-fns";

  const App = () => <div>{format(new Date(2026, 0, 1), "yyyy-MM-dd")}</div>;

  export default App;
  ```

  Wait for the delayed compile/setup cycle. The current behavior is a failing reproduction when the dependency badge returns to `Dependencies 0` and the editor no longer contains the `date-fns` import.

- [ ] **Step 2: Add canonical source and reset inputs to `SandpackBridge`**

  Extend the props with:

  ```ts
  sourceCode: string;
  initialCode: string;
  dependencyKey: string;
  ```

  Add a `sourceCodeRef` initialized from `sourceCode`, and keep it synchronized whenever the parent canonical code changes. In the existing `updateAppCode` action, build the derived file once, store it in `sourceCodeRef`, persist it through `onCodeChange`, and send the same value to `sandpack.updateFile`.

- [ ] **Step 3: Restore the canonical file when Sandpack emits its initial snapshot**

  Replace the current delayed `activeCode` write-back effect with this behavior:

  ```ts
  if (!activeCode || activeCode === lastSyncedCodeRef.current) return;

  const wasSandboxReset =
    activeCode === initialCode && sourceCodeRef.current !== initialCode;

  if (wasSandboxReset) {
    lastSyncedCodeRef.current = sourceCodeRef.current;
    sandpack.updateFile(APP_FILE, sourceCodeRef.current, true);
    return;
  }

  lastSyncedCodeRef.current = activeCode;
  sourceCodeRef.current = activeCode;
  onCodeChange(activeCode);
  ```

  This accepts genuine editor edits but refuses to persist the known stale initial snapshot over canonical source.

- [ ] **Step 4: Resynchronize after dependency setup changes**

  Add an effect keyed by `dependencyKey` that writes `sourceCodeRef.current` back to `APP_FILE`, updates `lastSyncedCodeRef`, and does not call `onCodeChange`. This makes dependency changes restore the canonical file without creating a source-state feedback loop.

- [ ] **Step 5: Pass stable canonical values from `SandpackJsxViewer`**

  Compute the canonical derived editor file from the current `code`:

  ```ts
  const canonicalSourceCode = React.useMemo(
    () => buildAppFile(code || SAMPLE_JSX),
    [code]
  );
  ```

  Compute a deterministic dependency key from sorted `effectiveDependencies` entries, then pass `canonicalSourceCode`, `initialFilesRef.current[APP_FILE].code`, and the key to `SandpackBridge`.

- [ ] **Step 6: Run the focused browser regression**

  Repeat the `date-fns` scenario. Expected result: the editor retains the import and the dependency control reports `Dependencies 1` after the delayed setup cycle. Add a manual package through the dependency panel, change the source, and verify the manual package remains until explicitly cleared.

### Task 2: Verify source/manual dependency ownership and build integrity

**Files:**

- Modify: none beyond Task 1
- Test: `/Users/gankai/Desktop/geekskai/2026/folioify/components/jsx-viewer/SandpackJsxViewer.tsx`
- Test: project build/type-check commands

**Interfaces:**

- Consumes: `getDetectedDependencies`, `effectiveDependencies`, `manualDependencies`, and the synchronized bridge from Task 1.
- Produces: evidence that source imports are protected, manual packages are independent, and the application compiles.

- [ ] **Step 1: Verify source dependency removal semantics in the UI**

  With an automatically detected package visible, confirm its badge has no remove button. Remove the import from the editor and wait for the delayed update; confirm only the automatic badge disappears.

- [ ] **Step 2: Verify manual dependency persistence in the UI**

  Add `lodash@latest` through the dependency panel, remove the source import for another package, and confirm `lodash` remains. Use `Clear manual deps` or the manual badge remove action to confirm explicit removal still works.

- [ ] **Step 3: Run the repository verification commands**

  Run:

  ```bash
  npx tsc --noEmit
  npm run build
  ```

  Expected: both commands exit with status 0. If the build reports an unrelated existing issue, record the exact failure and do not broaden the patch.

- [ ] **Step 4: Review the final diff against the design**

  Run:

  ```bash
  git diff --check
  git diff -- components/jsx-viewer/SandpackJsxViewer.tsx
  git status --short
  ```

  Confirm that the only behavior change is canonical source preservation across Sandpack dependency/setup updates, and that no import-stripping or iframe-related code was introduced.
