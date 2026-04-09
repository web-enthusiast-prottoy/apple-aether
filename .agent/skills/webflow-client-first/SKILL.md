---
name: Webflow Client-First Framework
description: Rules and guidelines for generating HTML/CSS code tailored for flawless injection into Webflow using the Finsweet Client-First framework. STRICTLY NO TAILWIND OR CSS FRAMEWORKS.
---

# Webflow Client-First Integration Guidelines

When creating HTML and CSS meant to be imported or injected into Webflow via our code-to-webflow parser, it is **MANDATORY** to follow these rules.

## 🚫 1. THE ABSOLUTE BANS

- **NO TAILWIND CSS**: Do not use Tailwind classes or the Tailwind compiler.
- **NO CSS FRAMEWORKS**: No Bootstrap, Bulma, Foundation, or any other utility/UI framework.
- **NO CSS-IN-JS / STYLED COMPONENTS**: Output must be standard HTML files and raw `.css` files.
- **NO INLINE STYLES**: Do not use `style="..."` on HTML elements. All styling must remain in CSS files.
- **NO STYLE TAGS IN BODY**: No `<style>` tags are allowed inside the `<body>`. All styles must strictly reside in the `index.css` file.
- **ALL SCRIPTS IN INDEX.JS**: All JavaScript must strictly reside in the `index.js` file. No `<script>` tags or inline scripts are allowed inside the HTML or `<body>` (except for the external link to `index.js`).
- **NO PX UNITS**: Always write CSS in `rem` or `clamp()` using `rem`/`vw`, never `px`. (Base: 1rem = 16px).
- **FLUID HEADINGS**: All headings (H1-H6) must use fluid `clamp()` values for font-size to ensure responsiveness without media queries.
- **NO CSS CHILD SELECTORS**: Do not use selectors like `.parent .child` or `.parent > .child`. Every element must have its own descriptive class (e.g., `.nav_link` instead of `.nav a`).
- **NO COMBO CLASS OVERLOAD**: Never use more than two combo classes on a single element. If it needs more, create a new specific class.

## 🏛️ 2. FINSWEET CLIENT-FIRST METHODOLOGY

You must style elements using **pure Vanilla CSS** following the **Finsweet Client-First** naming convention. This guarantees the structure will map correctly to Webflow's class system.

### Core Structure Wrappers

Every page or section you build MUST follow this exact nesting structure, and you must use these exact class names:

1. **`.page-wrapper`**: Wraps the entire visible page content.
2. **`.main-wrapper`**: Wraps the main `<main>` content area (excluding fixed navs/footers).
3. **`.section_[name]`**: Wraps a specific section (e.g., `.section_hero`, `.section_features`).
4. **`.padding-global`**: Handles global left/right padding across all breakpoints.
5. **`.container-[size]`**: Handles the max-width and centering of the content (e.g., `.container-large`).
6. **`.padding-section-[size]`**: Handles the top/bottom padding for the section (e.g., `.padding-section-large`).

**Example Structure:**

```html
<main class="main-wrapper">
    <section class="section_hero">
        <div class="padding-global">
            <div class="container-large">
                <div class="padding-section-large">
                    <!-- Component goes here -->
                </div>
            </div>
        </div>
    </section>
</main>
```

### Component Naming Convention & Constraints

Custom components should be named intelligently:

- Use **dash-case** or **lowercase** for the main component name (e.g., `.header_component`, `.slider`).
- Children elements of the component are joined by an **underscore (`_`)** (e.g., `.header_title-wrapper`, `.slider_card`).
- **Strict Rule**: No CSS child selectors. Every tag must have its own class.
    - ❌ `nav_links a { ... }`
    - ✅ `.nav_links-link { ... }` (Class assigned directly to the `<a>` tag).

### Utility & Spacing Classes

Use standard Client-First utility classes for margins, padding, and text.

- **Spacing Add-ons**: `.margin-bottom`, `.margin-top`, `.padding-bottom`. Combine with size classes: `.margin-small`, `.margin-medium`, `.margin-large`.
    - E.g., `<div class="margin-bottom margin-medium">...</div>`
- **Text Styles**: `.text-size-medium`, `.text-style-muted`, `.text-weight-bold`.
- **Max 2 Classes**: An element can have at most one utility + one combo class, or two combo classes.

## 🎨 3. CSS VARIABLES & ARCHITECTURE

You must declare a comprehensive CSS Variable block in the `:root` to map cleanly to Webflow's variable system.

```css
:root {
    /* Core Finsweet Variables - STRICTLY FOLLOW THIS STRUCTURE */
    /* Background Colors */
    --background-color-main: #ffffff;
    --background-color-secondary: #f4f4f4;

    /* Text Colors */
    --text-color-main: #000000;
    --text-color-secondary: #666666;

    /* Border Colors */
    --border-color-main: #e0e0e0;

    /* Typography Sizes - FLUID CLAMP (Min, Preferred, Max) */
    --font-size-base: 1rem;
    --font-size-h1: clamp(2.5rem, 5vw + 1rem, 4.5rem);
    --font-size-h2: clamp(2rem, 4vw + 1rem, 3.5rem);
    --font-size-h3: clamp(1.75rem, 3vw + 1rem, 2.75rem);
    --font-size-h4: clamp(1.5rem, 2vw + 1rem, 2.25rem);
    --font-size-h5: clamp(1.25rem, 1vw + 1rem, 1.75rem);
    --font-size-h6: clamp(1rem, 0.5vw + 1rem, 1.5rem);

    /* Spacing - ALWAYS IN REM */
    --space-small: 0.5rem;
    --space-medium: 1rem;
    --space-large: 2rem;
    --space-xlarge: 4rem;

    /* Repeated Styles - Use variables for EVERYTHING repeated */
    --border-radius-main: 0.5rem;
    --transition-main: all 200ms ease;
}
```

Apply these variables inside your Client-First global and component classes. **Never use hardcoded px values.**

```css
/* Core Client-First Global Rules */
.padding-global {
    padding-left: var(--padding-global-horizontal); /* Defined in variables */
    padding-right: var(--padding-global-horizontal);
}
.container-large {
    max-width: 80rem; /* 1280px */
    margin-left: auto;
    margin-right: auto;
}
.padding-section-large {
    padding-top: var(--space-xlarge);
    padding-bottom: var(--space-xlarge);
}

/* Component Rules */
.hero_title {
    font-size: var(--font-size-h1);
    color: var(--text-color-main);
}
```

## 🚀 4. REACT + VITE BUILD CONFIGURATION
| Element | Requirement | Why |
|---------|-------------|-----|
| **Vite Plugin** | `vite-plugin-singlefile` (Optional) | Can merge CSS/JS into HTML for easier copy-paste. |
| **Asset URLs** | Relative or absolute CDN links | Webflow cannot host dynamic assets from `dist/` without upload. |
| **Entry Point** | `main.tsx` → `index.js` | Ensure the build output matches the expected single JS file. |

### Recommended `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
```

## 🚀 5. INSTRUCTION CHECKLIST FOR AI AGENT

Before generating output:

- [ ] Are all Tailwind classes completely removed?
- [ ] Are they built using **React + Vite** for the final output?
- [ ] Are there **ZERO** `<style>` tags anywhere in the body? Are all styles in `index.css`?
- [ ] Are there **ZERO** `<script>` tags anywhere in the body (except for the src link)? Are all scripts in `index.js`?
- [ ] Are fixed `px` values replaced with `rem`? (1rem = 16px base)
- [ ] Do all headings (H1-H6) use fluid `clamp()` typography variables?
- [ ] Does the page use the `.page-wrapper` > `.main-wrapper` > `.section_*` > `.padding-global` > `.container-*` structure?
- [ ] Is every element given its own class (NO child selectors like `.nav a`)?
- [ ] Are combo classes limited to a maximum of two?
- [ ] Are all colors, spacings, and repeated styles mapped to CSS variables?
- [ ] Are semantic HTML tags being used correctly?
- [ ] Does `npm run build` generate clean, standard HTML/JS/CSS files?
