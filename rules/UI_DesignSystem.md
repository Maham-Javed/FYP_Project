# UI/UX Design System

This document outlines the standardized design principles, tokens, and CSS conventions for the AI-Based Recruitment System. It serves as the single source of truth for the frontend UI, heavily inspired by modern, clean SaaS aesthetics (like Bohrium).

---

## 1. Color System & Usage

The application uses a restrained, professional color palette emphasizing clarity, trust (blue/indigo), and intelligence (subtle purple/violet).

### Brand Colors
- **Primary**: Deep Indigo (`#4F46E5`)
  - *Usage*: Primary action buttons, active states, active tab underlines, primary icons, and focused input borders.
- **Secondary Accent**: Soft Purple / Violet (`#8B5CF6`)
  - *Usage*: Used strictly for AI-related elements (e.g., "AI Match Score", "Generate AI Questions") or as a subtle gradient transition (`linear-gradient(135deg, #4F46E5, #8B5CF6)`).

### Backgrounds & Surfaces
- **App Background**: Very Light Gray / Off-White (`#F9FAFB`)
  - *Usage*: The main `<body>` background. Provides contrast so white cards pop out.
- **Surface**: Pure White (`#FFFFFF`)
  - *Usage*: Job cards, candidate cards, modals, sidebars, and form containers.

### Typography Colors
- **Text Primary**: Dark Gray (`#111827`)
  - *Usage*: All major headings (H1, H2, H3) and primary data points (Job titles, Candidate names).
- **Text Secondary**: Medium Gray (`#6B7280`)
  - *Usage*: Body text, descriptions, table headers, subtitles, and placeholder text.
- **Text Muted**: Light Gray (`#9CA3AF`)
  - *Usage*: Disabled states, subtle timestamps.

### Utility / Status Colors
- **Success**: Subtle Green (`#10B981` text, `#D1FAE5` background)
  - *Usage*: "Accepted" application states, high match scores (>80%), success toasts.
- **Warning**: Amber (`#F59E0B` text, `#FEF3C7` background)
  - *Usage*: "Pending" states, medium match scores (50-79%), missing resume warnings.
- **Error/Destructive**: Subtle Red (`#EF4444` text, `#FEE2E2` background)
  - *Usage*: "Rejected" states, delete buttons, form validation errors.

### Borders
- **Standard Border**: Light Gray (`#E5E7EB`)
  - *Usage*: Default borders for cards, inputs, and table rows.

---

## 2. Typography

We will use a clean, modern sans-serif font like **Inter** or **Roboto**.

- **Font Family**: `'Inter', system-ui, -apple-system, sans-serif`
- **Headings (H1)**: `2.25rem` (36px), Font Weight: `700`, Color: `#111827`
  - *Usage*: Page Titles (e.g., "Recruiter Dashboard")
- **Headings (H2)**: `1.5rem` (24px), Font Weight: `600`, Color: `#111827`
  - *Usage*: Section titles, Modal headers.
- **Subheadings / Titles (H3)**: `1.125rem` (18px), Font Weight: `600`, Color: `#111827`
  - *Usage*: Job card titles, Candidate names.
- **Body Text**: `0.875rem` (14px) or `1rem` (16px), Font Weight: `400`, Color: `#6B7280`
  - *Usage*: General descriptions, table data.
- **Small / Labels**: `0.75rem` (12px), Font Weight: `500`, Color: `#6B7280`, Uppercase (Optional tracking `0.05em`)
  - *Usage*: Input labels, status pill text, table headers.

---

## 3. Spacing System

Maintain strict adherence to an 8px base grid. Do not use arbitrary spacing values (e.g., `11px`, `17px`).

- **Base Unit**: `8px` (`0.5rem`)
- **Spacing Scale**:
  - `4px` (`0.25rem`) - Tight gap (e.g., between an icon and text).
  - `8px` (`0.5rem`) - Inner element spacing (e.g., gap inside a button).
  - `16px` (`1rem`) - Standard padding for small cards, inputs, and table cells.
  - `24px` (`1.5rem`) - Standard padding for main cards, modals, and section margins.
  - `32px` (`2rem`) - Spacing between major page sections.
  - `48px` (`3rem`) - Top/bottom page padding.

---

## 4. Border Radius & Shadows

To achieve the "modern SaaS" look, corners should be slightly rounded, and shadows should be soft and diffuse, not harsh.

### Border Radius
- **Small (`4px`)**: Checkboxes, small badges/tags.
- **Medium (`8px`)**: Buttons, input fields, dropdown menus.
- **Large (`12px` - `16px`)**: Main job cards, candidate profile cards, modals.

### Box Shadows (Subtle Depth)
- **Shadow Small**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - *Usage*: Default state for buttons and inputs.
- **Shadow Medium**: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`
  - *Usage*: Default state for cards, dropdown menus.
- **Shadow Large / Hover**: `0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)`
  - *Usage*: Hover state for interactive cards (e.g., hovering over a Job Card to indicate clickability), Modal containers.

### Transitions
- **Hover/Focus Transitions**: `transition: all 0.2s ease-in-out;`
  - *Usage*: Apply to all buttons, links, and cards for a fluid, responsive feel.
