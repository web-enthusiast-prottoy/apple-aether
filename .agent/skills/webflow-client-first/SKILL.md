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
- **NO INLINE STYLES**: Do not use `style="..."` on HTML elements unless absolutely necessary for dynamic JavaScript interactions (like follow-mouse animations). All styling must remain in CSS files.

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

### Component Naming Convention
Custom components should be named intelligently:
- Use **dash-case** or **lowercase** for the main component name (e.g., `.header_component`, `.slider`).
- Children elements of the component are joined by an **underscore (`_`)** (e.g., `.header_title-wrapper`, `.slider_card`).
- Example: `.feature-grid`, `.feature-grid_item`, `.feature-grid_icon-wrapper`.

### Utility & Spacing Classes
Use standard Client-First utility classes for margins, padding, and text.
- **Spacing Add-ons**: `.margin-bottom`, `.margin-top`, `.padding-bottom`. Combine with size classes: `.margin-small`, `.margin-medium`, `.margin-large`.
    - E.g., `<div class="margin-bottom margin-medium">...</div>`
- **Text Styles**: `.text-size-medium`, `.text-style-muted`, `.text-weight-bold`.

## 🎨 3. CSS VARIABLES & ARCHITECTURE

You must declare a comprehensive CSS Variable block in the `:root` to map cleanly to Webflow's variable system.

```css
:root {
  /* Colors */
  --color-primary: #000000;
  --color-secondary: #ffffff;
  --color-brand: #ff0000;
  
  /* Typography */
  --font-family-sans: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --font-size-h1: 3.5rem;
  
  /* Spacing */
  --space-small: 1rem;
  --space-medium: 2rem;
  --space-large: 4rem;
}
```

Apply these variables inside your Client-First global and component classes.

```css
/* Core Client-First Global Rules */
.padding-global {
  padding-left: var(--space-medium);
  padding-right: var(--space-medium);
}
.container-large {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
.padding-section-large {
  padding-top: var(--space-large);
  padding-bottom: var(--space-large);
}

/* Component Rules */
.hero_title {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-h1);
  color: var(--color-primary);
}
```

## 🚀 4. INSTRUCTION CHECKLIST FOR AI AGENT
Before generating output:
- [ ] Are all Tailwind classes completely removed?
- [ ] Is every class strictly vanilla CSS?
- [ ] Does the page use the `.page-wrapper` > `.main-wrapper` > `.section_*` > `.padding-global` > `.container-*` structure?
- [ ] Are elements using Client-First `_` notation for nesting?
- [ ] Are there semantic HTML tags being used correctly?

Doing this ensures smooth mapping when the Webflow API injects our CSS rules and DOM elements into the Designer.
