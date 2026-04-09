---
name: Webflow Client-First Framework
description: Rules and guidelines for generating HTML/CSS code tailored for flawless injection into Webflow using the Finsweet Client-First framework. STRICTLY NO TAILWIND OR CSS FRAMEWORKS.
---

# Webflow Client-First Integration Guidelines

When creating HTML and CSS meant to be imported or injected into Webflow via our code-to-webflow parser, it is **MANDATORY** to follow these rules based strictly on the official *Finsweet Client-First* documentation.

## 🚫 1. THE ABSOLUTE BANS
- **NO TAILWIND CSS**: Do not use Tailwind classes or the Tailwind compiler.
- **NO CSS FRAMEWORKS**: No Bootstrap, Bulma, Foundation, or any other utility/UI framework.
- **NO CSS-IN-JS / STYLED COMPONENTS**: Output must be standard HTML files and raw `.css` files.
- **NO INLINE STYLES**: Do not use `style="..."` on HTML elements.
- **NO STYLE TAGS IN BODY**: No `<style>` tags are allowed inside the `<body>`.
- **NO PX UNITS**: Always write CSS in `rem` or `clamp()` using `rem`/`vw`, never `px`. (Base: 1rem = 16px).
- **FLUID HEADINGS**: All headings (H1-H6) must use fluid `clamp()` values for font-size.
- **NO CSS CHILD SELECTORS**: Do not use selectors like `.parent .child` or `.parent > .child`. Every element must have its own descriptive class (e.g., `.nav_link` instead of `.nav a`).
- **NO COMBO CLASS OVERLOAD**: Never "deep stack" classes. If an element requires more than a base class + one combo class, merge them into a single custom class.

## 🏛️ 2. FINSWEET CLIENT-FIRST METHODOLOGY

### Core Structure Wrappers
Every page MUST follow this exact nesting structure.
*(Updated to Client-First v2.1: `padding-section-[size]` is now applied combining with `padding-global` to reduce nesting)*:

1. **`.page-wrapper`**: Outermost parent of all elements on the page.
2. **`.main-wrapper`**: Wraps the main `<main>` content area.
3. **`.section_[name]`**: Wraps a specific section using the `<section>` HTML tag (e.g., `.section_hero`).
4. **`.padding-global`**: Handles global left/right padding across all breakpoints.
5. **`.padding-section-[size]`**: Handles top and bottom padding for the section globally. Combine this on the same div as `.padding-global`. Sizes: `small` (3rem), `medium` (5rem), `large` (8rem).
6. **`.container-[size]`**: Handles the max-width and centering of the content (e.g., `.container-small`, `.container-medium`, `.container-large`).

**Example Structure:**
```html
<main class="main-wrapper">
  <section class="section_hero">
    <div class="padding-global padding-section-large">
      <div class="container-large">
        <!-- Component goes here -->
      </div>
    </div>
  </section>
</main>
```

### Class Naming Types & Folders
Webflow organizes rules natively using these conventions:
- **Utility Classes**: Use dashes (`-`) only (e.g., `.text-size-large`). Global by nature.
- **Global Classes**: Can use `-` or `_`. Categorize repeating elements (e.g., `.faq_item`).
- **Custom Classes (Folders)**: Use **exactly one underscore (`_`)**. The first word before the underscore forms the Webflow Folder. E.g., `.folder-name_element-name`.
- **Combo Classes**: Variant wrappers. Must use the prefix `is-` (e.g., `.button.is-brand`).

### Component Naming Convention & Constraints
Custom components must be tied functionally to their parent section and placed in folders:
- **Section-Based Prefixing**: If a component is inside `.section_hero`, all children classes MUST start with `hero_` to place them in the Hero folder.
    - ✅ `.hero_component`, `.hero_wrapper`, `.hero_title`
- **Dash for Modifiers**: Use a single dash for word separation within the element name after the folder prefix (e.g., `.team-list_headshot-wrapper`).
- **Strict Rule**: No CSS child selectors. Assign classes directly to tags.

### 🔘 Buttons & CTA Standards
All buttons must follow the modular combo-class system:
- **Base Class**: `.button`
- **Combo Classes**: `.button.is-secondary`, `.button.is-alternate`, `.button.is-icon`.
- **Text Link**: `.button-text`
- **Icon Sizing**: `.icon-small`, `.icon-medium`, `.icon-[size]`.

### 📝 Typography System
- **Hierarchy is King**: Always respect SEO `H1-H6` tag order. 
- **Style Overrides**: Use `.heading-style-h1`, `.heading-style-h2` if an `H3` needs to visually look like an `H1`.
- **Text Utilities**: Use `.text-size-[size]` (`large`, `medium`, `regular`, `small`, `tiny`).
- **Text Color**: `.text-color-primary`, `.text-color-secondary`, `.text-color-neutral`.
- **Text Weight**: `.text-weight-light`, `.text-weight-normal`, `.text-weight-semibold`, `.text-weight-bold`, `.text-weight-xbold`.
- **Text Alignment**: `.text-align-left`, `.text-align-center`, `.text-align-right`.

### 📏 Spacing & Sizing Strategies
- **Spacing Wrappers**: Apply `padding-[direction] padding-[size]` or `margin-[direction] margin-[size]` natively on elements. Sizes range from `tiny` to `xxhuge` and `0`. 
- **Spacer Blocks**: Instead of margins on components, use an empty div with `.spacer-[size]` to separate vertical elements cleanly. 
- **Max Widths**: `.max-width-[size]` (e.g., `max-width-large`, `max-width-full`).
- **Visibility Checks**: `.hide`, `.hide-tablet`, `.hide-mobile-[orientation]`.

## 🎨 3. CSS VARIABLES & ARCHITECTURE
Ensure CSS is completely fluid and natively defined at `:root` in `index.css`:

```css
:root {
  /* Typography Sizes - FLUID CLAMP */
  --font-size-base: 1rem;
  --font-size-h1: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  --font-size-h2: clamp(2rem, 4vw + 1rem, 3.5rem);
  --font-size-h3: clamp(1.75rem, 3vw + 1rem, 2.75rem);
  
  /* Spacing - ALWAYS IN REM */
  --space-small: 0.5rem;
  --space-medium: 1rem;
  --space-large: 2rem;
  --space-xlarge: 4rem;
}
```

## 🚀 4. INSTRUCTION CHECKLIST FOR AI AGENT
Before generating output:
- [ ] Are all Tailwind classes completely removed?
- [ ] Are `px` values strictly replaced with `rem` / `clamp() / vw`?
- [ ] Does the page use the v2.1 structure: `.page-wrapper` > `.main-wrapper` > `.section_*` > `.padding-global.padding-section-*` > `.container-*`?
- [ ] Do custom classes contain **only one** underscore to create a Webflow Folder?
- [ ] Do child classes start with the section prefix (e.g., `.section_hero` -> `.hero_wrapper`)?
- [ ] Are combo classes exclusively using the `is-` prefix (e.g., `.is-secondary`)?
- [ ] Do all buttons follow the `.button` base class pattern?
- [ ] Is SEO heading hierarchy preserved, overriding visual styles ONLY with `.heading-style-h*`?
- [ ] Are spacing constraints resolved using `spacer-[size]` blocks or `margin/padding` utilities?
- [ ] Are semantic HTML tags being used correctly?
