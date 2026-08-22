# Folioify Context

This context defines Folioify's product language and how source imports and the dependency panel relate in the JSX viewer.

## Language

### Product and growth

**Free Tool**:
A focused developer utility that delivers a complete useful result without payment and introduces users to Folioify.
_Avoid_: Lead magnet, free tier

**Workbench**:
A cohesive product experience that combines related developer tasks around the same input and workflow.
_Avoid_: Tool collection, tool directory

**Paid Workflow**:
Capabilities users pay for because they add scale, continuity, or automation beyond a Free Tool's complete result.
_Avoid_: Paid tool, locked basic feature

**Product Revenue**:
Revenue earned when users pay for a Paid Workflow. It is Folioify's primary revenue objective.
_Avoid_: Ad revenue, monetization

**Ad-supported Revenue**:
Supplementary revenue from advertising on mature, original content. It is not Folioify's primary growth objective.
_Avoid_: Primary revenue, core business model

**JSON Workbench**:
Folioify's primary Workbench for understanding, repairing, comparing, querying, and transforming real JSON data in one continuous experience.
_Avoid_: JSON tool collection, API monitoring

**Workbench Session**:
The locally held input, output, selected operation, and navigation state for one user's continuous Workbench experience.
_Avoid_: Project, cloud workspace

**Transformation Pipeline**:
An ordered, reusable sequence of JSON operations that produces a final result from one input.
_Avoid_: Converter chain, automation script

**Local History**:
Workbench Sessions retained on the user's device and controlled by that user, without becoming cloud data.
_Avoid_: Account history, cloud history

### JSX viewer

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

**Preview update**:
The lifecycle from a preview-affecting change until the corresponding sandbox either renders successfully or produces a compilation or runtime failure. A newer source, dependency, Tailwind, or restart change supersedes any unfinished update, and a previously rendered preview does not complete the latest update.
_Avoid_: File update, loading cycle
