# JSX Viewer Context

This context defines how source imports and the dependency panel relate in the JSX viewer.

## Language

**Code dependency**:
A package referenced by the user's JSX/TSX source through an external module import or require. It remains protected while the source still references it.
_Avoid_: Auto dependency, inferred package

**Manual dependency**:
A package explicitly added by the user through the dependency panel to supplement the packages detected from source code.
_Avoid_: Override dependency, temporary package

**User source**:
The JSX/TSX text entered or edited by the user and persisted by the viewer. It is the canonical source and must not be replaced by a generated sandbox file.
_Avoid_: App file, sandbox source

**Derived sandbox file**:
The Sandpack entry file generated from user source so the sandbox can compile and render it. It may add runtime scaffolding but must not become the canonical user source.
_Avoid_: User source, saved code
