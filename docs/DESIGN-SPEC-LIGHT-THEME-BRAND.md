# Light Theme Design Spec — Brand #16F2B3 (AI-Ready)

> **Purpose**: Apply the same UI design language as the source project, but in **light theme** with **brand color #16F2B3**. Copy-paste the tokens and class strings below; no interpretation needed.

---

## 1. Design Tokens (Use Exactly)

### 1.1 Brand Color Palette

| Token         | Value     | Usage                                      |
| ------------- | --------- | ------------------------------------------ |
| `--brand`     | `#16F2B3` | Primary brand (buttons, links, accents)    |
| `--brand-50`  | `#E8FDF7` | Lightest tint (page bg tint, subtle fills) |
| `--brand-100` | `#B8FAE8` | Light tint (card bg, badge bg)             |
| `--brand-200` | `#7AF5D3` | Border, divider                            |
| `--brand-300` | `#3CEFBE` | Hover states, icons                        |
| `--brand-400` | `#1AE8B0` | Default interactive                        |
| `--brand-500` | `#16F2B3` | Base (same as --brand)                     |
| `--brand-600` | `#12C992` | Hover button, active link                  |
| `--brand-700` | `#0E9F72` | Pressed, dark text on light                |
| `--brand-800` | `#0A7552` | Headings accent                            |
| `--brand-900` | `#064A33` | Strong text accent                         |

### 1.2 Theme: Light

| Token               | Value                                   | Usage                           |
| ------------------- | --------------------------------------- | ------------------------------- |
| **Page background** | `#F8FAFA` or `gray-50`                  | Root / body                     |
| **Surface (card)**  | `#FFFFFF`                               | Card, modal, dropdown           |
| **Border default**  | `gray-200` / `#E5E7EB`                  | Dividers, card borders          |
| **Border brand**    | `--brand-200` or 20% opacity of #16F2B3 | Focus, selected, accent borders |
| **Text primary**    | `gray-900` / `#111827`                  | Headings, body                  |
| **Text secondary**  | `gray-600` / `#4B5563`                  | Descriptions, captions          |
| **Text muted**      | `gray-500` / `#6B7280`                  | Placeholders, hints             |

### 1.3 Tailwind Config Snippet (Copy Into `theme.extend.colors`)

```js
// tailwind.config.js - theme.extend.colors
brand: {
  50: "#E8FDF7",
  100: "#B8FAE8",
  200: "#7AF5D3",
  300: "#3CEFBE",
  400: "#1AE8B0",
  500: "#16F2B3",  // base
  600: "#12C992",
  700: "#0E9F72",
  800: "#0A7552",
  900: "#064A33",
}
```

If you cannot add custom colors, use **arbitrary values** everywhere:
`bg-[#16F2B3]`, `border-[#7AF5D3]`, `text-[#0A7552]`,
and for opacity: `bg-[#16F2B3]/10`, `border-[#16F2B3]/30`.

---

## 2. Direct Substitution Rules (Dark → Light)

When porting from the **dark** design system, apply these substitutions **literally**:

| Original (dark)                              | Replace with (light + brand)                   |
| -------------------------------------------- | ---------------------------------------------- |
| `bg-white/5`, `bg-white/10`                  | `bg-white` or `bg-brand-50`                    |
| `border-white/10`, `border-white/20`         | `border-gray-200` or `border-brand-200/50`     |
| `text-white`                                 | `text-gray-900`                                |
| `text-slate-300`, `text-gray-300`            | `text-gray-600`                                |
| `text-blue-300`, `text-purple-300`, etc.     | `text-brand-700` or `text-brand-800`           |
| `from-blue-500/15 to-cyan-500/10`            | `from-brand-100 to-brand-50`                   |
| `from-purple-500/10 to-pink-500/10`          | `from-brand-100 to-brand-50`                   |
| `border-blue-500/30`, `border-purple-500/30` | `border-brand-300` or `border-brand-500/30`    |
| `shadow-blue-500/25`, `shadow-purple-500/25` | `shadow-brand-500/20` or `shadow-brand-400/25` |
| `ring-blue-500/20`                           | `ring-brand-400/30`                            |
| `focus:ring-blue-500/20`                     | `focus:ring-brand-400/30`                      |
| `backdrop-blur-xl`                           | Keep (works on light)                          |
| `bg-slate-950`, `bg-gray-900` (page)         | `bg-gray-50` or `bg-[#F8FAFA]`                 |

---

## 3. Component Patterns (Copy-Paste Ready)

### 3.1 Page Container

```tsx
<div className="min-h-screen bg-gray-50">
  {/* or bg-[#F8FAFA] */}
```

### 3.2 Card Container (Main content card)

```tsx
<div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-brand-500/10">
  {/* Optional: decorative blob */}
  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br from-brand-200/40 to-brand-100/40 blur-3xl" />
  <div className="relative">{/* content */}</div>
</div>
```

### 3.3 Card (Secondary / list item)

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-brand-500/5 transition-all duration-300 hover:border-brand-300 hover:shadow-brand-500/15 md:p-5 lg:p-6">
  {/* content */}
</div>
```

### 3.4 Badge / Pill (section label)

```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-gradient-to-r from-brand-100 to-brand-50 px-4 py-2 md:gap-3 md:px-5 md:py-2.5">
  <span className="text-lg md:text-xl">✨</span>
  <span className="text-sm font-semibold text-brand-800 md:text-base">
    Label
  </span>
</div>
```

### 3.5 Primary Button

```tsx
<button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/30">
  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
  <span className="relative">Button Text</span>
</button>
```

If button text on #16F2B3 has low contrast, use **white text** and darker gradient:

```tsx
<button className="... from-brand-600 via-brand-500 to-brand-600 ... text-white ...">
```

### 3.6 Secondary Button

```tsx
<button className="group relative overflow-hidden rounded-2xl border border-brand-300 bg-gradient-to-br from-brand-50 to-brand-100/50 px-6 py-4 text-brand-800 font-semibold transition-all duration-300 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/20">
  <div className="absolute inset-0 bg-gradient-to-br from-brand-200/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  <span className="relative">Button Text</span>
</button>
```

### 3.7 Input Field (brand-themed)

```tsx
<div className="relative">
  <input
    className="w-full rounded-2xl border border-brand-200 bg-brand-50/50 py-4 pl-12 pr-4 text-lg text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-400/20"
    placeholder="Placeholder"
  />
  <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-lg bg-brand-200/50 p-2">
    {/* icon */}
  </div>
</div>
```

### 3.8 Section Title (with gradient text optional)

```tsx
<h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
  Section Title
</h2>
<!-- Or gradient brand text -->
<h2 className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
  Section Title
</h2>
```

### 3.9 Section Description

```tsx
<p className="mt-2 text-sm leading-relaxed text-gray-600 md:mt-3 md:text-base">
  Description text.
</p>
```

### 3.10 Feature / Info Card (grid item)

```tsx
<div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-brand-50/80 via-white to-brand-50/50 p-4 transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/15 md:rounded-2xl md:p-5 lg:p-6">
  <div className="mb-2.5 text-2xl md:mb-3 md:text-3xl">{/* icon */}</div>
  <h3 className="mb-1.5 text-sm font-bold text-gray-900 md:text-base lg:text-xl">
    {/* title */}
  </h3>
  <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
    {/* description */}
  </p>
</div>
```

### 3.11 Numbered Step Card

```tsx
<div className="flex items-center gap-3 md:gap-4">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-sm font-bold text-gray-900 md:h-12 md:w-12 md:text-base">
    {stepNumber}
  </div>
  <h3 className="text-sm font-bold text-gray-900 md:text-base lg:text-xl">
    {/* title */}
  </h3>
</div>
```

### 3.12 Decorative Background Blobs (light theme)

```tsx
<div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br from-brand-200/40 to-brand-100/40 blur-3xl" />
<div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-brand-100/50 to-brand-50 blur-3xl" />
<div className="absolute right-1/4 top-1/3 h-20 w-20 rounded-full bg-gradient-to-br from-brand-100/40 to-brand-200/30 blur-2xl" />
```

---

## 4. Animation & Interaction (Unchanged)

- **Fast**: `duration-300` (buttons, hovers)
- **Standard**: `duration-500` (cards, layout)
- **Shine**: `duration-700` (button shine overlay)
- **Transitions**: Always `transition-all duration-{n}` on interactive elements.
- **Hover**: Prefer border + shadow: `hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/20`.

---

## 5. Typography Scale (Unchanged)

- **Hero**: `text-5xl font-bold` (+ optional `bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent`)
- **Section**: `text-3xl font-bold` / `text-2xl font-bold`
- **Subsection**: `text-xl font-semibold`
- **Body**: `text-base` (primary), `text-sm` (secondary)
- **Small**: `text-xs` (captions, badges)

---

## 6. Spacing (Unchanged)

- **Section**: `mb-12`, `mt-16`
- **Block**: `mb-8`, `mt-8`
- **Card**: `p-4 md:p-5 lg:p-6` or `p-8`
- **Gap**: `gap-4 md:gap-5 lg:gap-6` for grids.

---

## 7. Responsive Breakpoints (Unchanged)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Use same patterns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, `flex-col lg:flex-row`, `px-4 sm:px-6 lg:px-8`.

---

## 8. Checklist for AI Implementation

1. [ ] Add `brand` palette to `tailwind.config.js` (or use arbitrary values `#16F2B3`, etc.).
2. [ ] Set page root to `bg-gray-50` (or `bg-[#F8FAFA]`).
3. [ ] Replace all dark backgrounds with `bg-white` or `bg-brand-50`; replace `border-white/*` with `border-gray-200` or `border-brand-200`.
4. [ ] Replace all light text (`text-white`, `text-slate-300`) with `text-gray-900` and `text-gray-600`.
5. [ ] Replace all colored accents (blue/purple/pink/emerald) with `brand-*` tokens using the table in §2.
6. [ ] Use §3 component patterns for cards, badges, buttons, inputs.
7. [ ] Keep `rounded-2xl` / `rounded-3xl`, `backdrop-blur-xl`, and animation durations as in source.
8. [ ] Add decorative blobs with `from-brand-200/40` / `to-brand-100/40` (no dark colors).

---

## 9. One-File Reference (Tailwind + CSS Vars)

If you use CSS variables in the other project:

```css
:root {
  --brand: #16f2b3;
  --brand-50: #e8fdf7;
  --brand-100: #b8fae8;
  --brand-200: #7af5d3;
  --brand-300: #3cefbe;
  --brand-400: #1ae8b0;
  --brand-500: #16f2b3;
  --brand-600: #12c992;
  --brand-700: #0e9f72;
  --brand-800: #0a7552;
  --brand-900: #064a33;
  --page-bg: #f8fafa;
  --surface: #ffffff;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --border: #e5e7eb;
  --border-brand: #7af5d3;
}
```

Then in Tailwind `theme.extend`:
`brand: { 50: 'var(--brand-50)', ..., 500: 'var(--brand)', ... }`.

---

**End of spec.** Apply §1–§3 and §8 first; the rest is optional refinement.
