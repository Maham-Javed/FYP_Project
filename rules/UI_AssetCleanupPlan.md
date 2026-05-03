# Asset Cleanup & Replacement Plan

To achieve the clean, professional, and minimal SaaS aesthetic, the project's static assets must be thoroughly audited. Unused, generic, or outdated assets detract from the "AI-driven" brand identity.

---

## 1. Deletion Strategy (What to Remove)

### From `src/assets/`
- **DELETE `react.svg` and `vite.svg`**: These are default scaffolding files from the Vite initialization and have no place in a production application.
- **AUDIT `hero.png`**: Evaluate if this image is a generic stock photo or overly complex. Modern SaaS landing pages avoid heavy stock photos. If it doesn't align with the clean Deep Indigo / Soft Purple aesthetic, remove it.

### From `public/`
- **DELETE existing `favicon.svg`**: This is likely the default Vite/React favicon. It will be replaced.
- **AUDIT `icons.svg`**: If this is an SVG sprite sheet, ensure it only contains icons actively used in the UI. Remove any unused bloated paths to reduce the file size. Consider migrating to a modern, tree-shakeable icon library like `lucide-react` instead of a static sprite sheet for easier maintenance.

---

## 2. Addition Strategy (What to Add)

### `public/favicon.svg`
- Replace the deleted favicon with the extracted "Spark Node" `<g>` element from the logo design (defined in `UI_LogoDesign.md`). 
- **Requirement**: Must be pure SVG, scaling cleanly to small tab sizes.

### `src/assets/logo.svg`
- Create this file using the full SVG code provided in `UI_LogoDesign.md`.
- Import this directly into the React `Sidebar` and `Navbar` components.

---

## 3. Illustration & Icon Guidelines

If you need to add new visual assets (e.g., empty state illustrations, landing page graphics) in the future:

1. **Format**: **Strictly SVG**. Do not use PNGs or JPEGs for UI elements. SVGs are resolution-independent and have a smaller footprint.
2. **Color Synchronization**: Instead of importing SVGs with hardcoded hex colors, edit the SVGs to use `currentColor` or CSS variables (`var(--color-primary)`). This ensures illustrations automatically match the Deep Indigo/Soft Purple theme.
3. **Style**: Use minimal line-art or subtle duotone styles. Avoid "corporate Memphis" (flat characters with exaggerated proportions) as it feels dated; lean towards geometric, abstract node/data representations.

---

## 4. Execution Steps for the Developer

1. Delete the files explicitly marked for deletion above.
2. Create `src/assets/logo.svg` using the provided code.
3. Replace all `<img src="/react.svg" />` or similar placeholders in your codebase with the new `logo.svg`.
4. Scan the UI for long, unnecessary descriptive text or "slogans" below heroes/headers and delete them to enforce the minimal UI rule. Replace them with brief, functional labels.
