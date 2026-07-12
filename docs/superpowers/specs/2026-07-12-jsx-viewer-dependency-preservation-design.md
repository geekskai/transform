# JSX Viewer Dependency Preservation

## Problem

When JSX/TSX source imports a third-party package, a Sandpack setup update can restore the derived `/src/App.tsx` file from its initial snapshot. The bridge may then persist that stale file back into the viewer state, making the user's import and dependency appear to be deleted.

## Design

- Treat the user source as the canonical state.
- Treat `/src/App.tsx` as a derived Sandpack file generated from the canonical source.
- Keep source-detected dependencies and manually added dependencies as separate inputs.
- A package still referenced by source remains in the effective dependency set and cannot be removed through the manual dependency controls.
- Manual dependencies remain until explicitly removed or cleared, even after their package is no longer imported by source.
- When Sandpack setup or dependency installation changes, synchronize the derived file from canonical source and never persist a stale sandbox snapshot over it.
- Installation or compilation failures affect only the preview; source and dependency state remain unchanged.

## Verification

- A source import such as `import { format } from "date-fns"` remains in the editor after dependency detection and Sandpack setup updates.
- Removing the source import removes only its automatic dependency entry.
- A manually added dependency survives source edits and remains removable explicitly.
- The project type-check/build succeeds.
