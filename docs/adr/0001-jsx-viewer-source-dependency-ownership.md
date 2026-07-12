# Preserve user source while Sandpack derives the preview file

The JSX viewer treats user source as the canonical state and `/src/App.tsx` as a derived Sandpack file. Source-referenced packages are protected automatic dependencies, while manually added packages are independent and can only be removed explicitly. This avoids losing imports when Sandpack rebuilds its setup and restores an initial file snapshot.

## Consequences

- Sandpack setup changes must resynchronize from canonical source rather than persisting its file snapshot.
- Preview installation or compilation errors must not mutate source or dependency state.
