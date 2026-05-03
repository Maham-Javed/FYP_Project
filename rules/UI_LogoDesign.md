# Brand Identity & Logo Design

This document details the brand identity and the SVG logo structure for the AI-Based Candidate Recruitment System. The logo emphasizes modern SaaS aesthetics, intelligence, and seamless matching.

---

## 1. Logo Concept
**Name:** Xenon (or "Xenon AI" depending on context).
**Concept:** A modern, geometric abstraction of a "Node" or "Connection" meeting a "Spark" of intelligence. It combines a stylized letter "X" (for Xenon) with interconnected dots, symbolizing the perfect match between a candidate and a recruiter driven by AI.

- **Iconography:** Two intersecting, fluid lines with a gradient spark at the center. It implies bridging the gap (recruiter to candidate) via artificial intelligence.
- **Vibe:** Clean, intelligent, trustworthy, and minimal. No complex illustrations or heavy 3D effects.

---

## 2. Style & Colors

- **Icon Colors:** 
  - Left arm of the "X": Deep Indigo (`#4F46E5`)
  - Right arm of the "X": Soft Purple (`#8B5CF6`)
  - Intersecting node: A subtle gradient blend between the two.
- **Text/Font Style:** 
  - **Font**: `Inter` (Sans-Serif), Extra Bold (800) for the primary mark, Medium (500) for the "AI" tag.
  - **Color**: Dark Gray (`#111827`) for light mode, Pure White (`#FFFFFF`) if placed on a dark background.
- **Sizing:** The icon and text should have a 1:1 visual weight to maintain balance in navigation bars.

---

## 3. SVG-Friendly Structure

Below is the production-ready SVG code for the logo. It is highly optimized, using basic geometric paths and an `<svg>` viewbox that scales perfectly without losing quality.

```xml
<!-- public/logo.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" width="200" height="48" fill="none">
  <!-- Gradient Definitions -->
  <defs>
    <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
  </defs>

  <!-- Abstract 'X' / Spark Icon -->
  <g transform="translate(4, 8)">
    <path d="M4 4 L28 28" stroke="#4F46E5" stroke-width="6" stroke-linecap="round" />
    <path d="M28 4 L4 28" stroke="url(#ai-gradient)" stroke-width="6" stroke-linecap="round" />
    <circle cx="16" cy="16" r="4" fill="#8B5CF6" />
  </g>

  <!-- 'Xenon' Typography -->
  <text x="44" y="32" font-family="'Inter', sans-serif" font-weight="800" font-size="24" fill="#111827" letter-spacing="-0.02em">
    Xenon
  </text>
  
  <!-- 'AI' Badge/Tag -->
  <text x="118" y="32" font-family="'Inter', sans-serif" font-weight="500" font-size="24" fill="#8B5CF6" letter-spacing="0.01em">
    AI
  </text>
</svg>
```

---

## 4. Integration & Placement

1. **Navbar (`components/Sidebar.jsx` or Top Nav)**:
   - **Height**: Restrict the SVG to `h-8` (32px) or `h-10` (40px) to maintain a sleek header.
   - **Positioning**: Top-left alignment with standard `24px` padding.
2. **Login/Register Pages**:
   - Use a larger version of the logo (e.g., `h-12` or 48px) centered above the authentication form container.
3. **Favicon (`public/favicon.ico` or `favicon.svg`)**:
   - Extract just the `<g>` abstract icon from the SVG above (the intersecting lines and node) without the text, setting the viewBox to `0 0 32 32` to serve as a clean tab icon.
