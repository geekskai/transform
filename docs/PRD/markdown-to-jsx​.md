# PRD: Interactive Markdown to JSX Transformer

**Keywords:** Markdown to JSX, MD to React Component, MDX Generator, Convert MD to JSX Online, Markdown Code Snippet Converter.

## 1. Product Overview

### 1.1 Objective

To provide a seamless, instant conversion utility that transforms standard Markdown syntax into clean, production-ready React (JSX) code. This helps developers migrate content into React-based frameworks like Next.js, Gatsby, or Remix.

### 1.2 Target Audience

* **Technical Writers:** Migrating blogs from Jekyll/Hugo to React-based stacks.
* **Frontend Developers:** Turning README files or documentation into UI components.
* **Product Managers:** Drafting content in Markdown and handing it off to devs as code.

---

## 2. Core Features (Functional Requirements)

### 2.1 Dual-Engine Conversion

* **Standard Mode:** Converts MD to standard HTML-based JSX tags (e.g., `#` becomes `<h1>`).
* **Component Mapping Mode:** Allows users to define custom mappings (e.g., transform `###` into a `<SubHeading />` custom component).

### 2.2 Live Transformation Suite

* **Side-by-Side View:** Input (Markdown) on the left, Output (JSX Code) on the right.
* **The "Visual Preview" Tab:** A third tab to see how the JSX actually renders in a browser.
* **Frontmatter Support:** Ability to parse and convert YAML frontmatter into React props.

### 2.3 Developer Experience (DX) Features

* **Tailwind Integration:** Option to "Inject Tailwind Classes" (e.g., automatically add `className="text-2xl font-bold"` to headers).
* **Img to Next/Image:** An optional toggle to convert standard `<img>` tags into Next.js `<Image />` components.
* **Code Highlighting:** Automatically wraps code blocks in `<Prism />` or `<SyntaxHighlighter />` components.

---

## 3. SEO & Growth Strategy

### 3.1 Content Clusters

To capture organic search, the landing page will feature a "Library" section:

* **"Markdown vs. MDX: What's the difference?"**
* **"How to render Markdown in React efficiently."**
* **"Common JSX pitfalls when converting from HTML."**

### 3.2 Lead Generation (The "Upsell")

* **The "One-Click Blog" Button:** A prominent CTA: *"Love this layout? Deploy this Markdown as a live blog in 60 seconds with our Website Builder."*
* **Export to GitHub:** Allow users to push the converted `.jsx` file directly to a repo, requiring a simple sign-up.

---

## 4. Technical Specifications

| Feature | Technology Recommendation |
| --- | --- |
| **Parser** | **Remark** or **Unified.js** (The industry standard for MD processing). |
| **Compiler** | **rehype-react** to transform the HAST (HTML Abstract Syntax Tree) into JSX. |
| **State Mgmt** | **Zustand** for managing real-time sync between the three panels. |
| **Styling** | **PostCSS** for on-the-fly class injection. |

---

## 5. User Interface (UI) Layout

1. **Top Navigation:** Breadcrumbs (Tools > Content > MD to JSX) and a "Dark/Light Mode" toggle.
2. **Configuration Sidebar:**
* Dropdown: "Output Style" (Functional Component vs. Class Component).
* Checkbox: "Include Tailwind CSS".
* Checkbox: "Add 'use client' directive" (for Next.js 13+ support).


3. **The Canvas:** A synchronized scrolling workspace for Input, Code, and Preview.

---

## 6. Comparison for User Clarity

To help users decide between formats, we include this table on the landing page:

| Feature | Markdown | JSX | MDX |
| --- | --- | --- | --- |
| **Readability** | High (Human friendly) | Low (Code heavy) | Balanced |
| **Interactivity** | None (Static) | High (Dynamic) | High (Components in MD) |
| **Use Case** | Writing Content | Building UI | Tech Documentation |

---

**PM's Tactical Advice:**
Unlike the "JSX Viewer," the **"Markdown to JSX"** tool should emphasize **customization**. Most developers don't just want `<h1>`; they want their *own* `<Heading>` component. If our tool allows them to input a JSON mapping for custom components, it will become the "gold standard" tool that they bookmark and share.

Does this "Workflow Bridge" approach align with your vision for the site's lead generation?