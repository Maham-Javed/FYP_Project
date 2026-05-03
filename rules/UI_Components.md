# UI Component Standardization

This document details the standardized design patterns for all major UI components in the AI-Based Recruitment System. It builds directly upon the foundational rules laid out in `UI_DesignSystem.md`.

---

## 1. Buttons

All buttons should have a `border-radius: 8px` (medium), strict internal padding, and fluid transition effects on hover.

- **Primary Button**:
  - **Background**: Deep Indigo (`#4F46E5`).
  - **Text**: Pure White (`#FFFFFF`), `font-weight: 500`.
  - **Padding**: `10px` vertical, `20px` horizontal.
  - **Hover State**: Darken background slightly (e.g., `#4338CA`), apply `Shadow Small`.
  - **Usage**: Main actions like "Post Job", "Apply Now", "Start Interview".

- **Secondary / Outline Button**:
  - **Background**: Transparent.
  - **Border**: `1px solid #E5E7EB` (Light Gray).
  - **Text**: Dark Gray (`#111827`).
  - **Hover State**: Background shifts to Very Light Gray (`#F9FAFB`).
  - **Usage**: "Cancel", "View Details", "Back".

- **Disabled Button**:
  - **Background**: Light Gray (`#E5E7EB`).
  - **Text**: Muted Gray (`#9CA3AF`).
  - **Interaction**: `cursor-not-allowed`, no hover effects.

---

## 2. Forms (Inputs & Dropdowns)

Clean, readable inputs reduce user friction during signup and job posting.

- **Structure**:
  - **Label**: Above the input, `12px`, uppercase, medium gray (`#6B7280`), `4px` margin-bottom.
  - **Input Box**: `border-radius: 8px`, border `1px solid #E5E7EB`, padding `12px 16px`.
  - **Text**: `14px` or `16px`, Dark Gray (`#111827`).
  - **Focus State**: Border changes to Deep Indigo (`#4F46E5`), subtle outer glow or shadow (`box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2)`).
  - **Error State**: Border changes to Red (`#EF4444`), small red error text directly below.

---

## 3. Cards (Job Listings & Candidates)

Cards are the primary container for data. They must look elevated but clean.

- **Container**:
  - **Background**: Pure White (`#FFFFFF`).
  - **Border**: `1px solid #E5E7EB`.
  - **Border Radius**: `12px` or `16px`.
  - **Padding**: `24px` internal padding.
  - **Shadow**: `Shadow Medium` (default), transitioning to `Shadow Large` on hover (if clickable).
- **Internal Layout**:
  - Header: Title (Job Role/Candidate Name) on the left, Status Pill or Match Score on the right.
  - Body: Muted text description, separated by a `16px` gap.
  - Footer: Action buttons right-aligned, bordered off by a subtle top border inside the card if necessary.

---

## 4. Match Percentage Indicator (AI Feature)

This is a critical visual component for the application. It needs to feel intelligent and instantly recognizable.

- **Visual Style**: Circular progress ring or a stylized pill badge.
- **Pill Badge Variation**:
  - **High Match (80-100%)**: Background `#D1FAE5`, Text `#10B981` (Green).
  - **Medium Match (50-79%)**: Background `#FEF3C7`, Text `#F59E0B` (Amber).
  - **Low Match (< 50%)**: Background `#F3F4F6`, Text `#6B7280` (Gray - indicating not a strong fit, avoiding aggressive red unless rejected).
- **Typography**: Show exact percentage (e.g., `92% Match`) with `font-weight: 600`. Add a small 'Spark' SVG icon next to the text to reinforce the AI aspect.

---

## 5. Tables (Recruiter Dashboard)

Used for displaying lists of candidates or job postings.

- **Header Row**: 
  - Background: Very Light Gray (`#F9FAFB`).
  - Text: `12px`, uppercase, muted gray.
- **Data Rows**:
  - Background: White (`#FFFFFF`).
  - Bottom Border: `1px solid #E5E7EB`.
  - Hover: Entire row shifts to `#F9FAFB` on hover.
- **Alignment**: Text left-aligned, numbers/scores center-aligned, Action buttons right-aligned.

---

## 6. Interview UI Components

The AI interview interface must be distraction-free.

- **Question Container**: Centered prominently. `24px` text size, `1.5` line height.
- **Timer Component**: Placed top-right. Changes color from Indigo to Amber at 60 seconds, and Red at 15 seconds remaining.
- **Response Area**: A clean, auto-expanding `<textarea>` mimicking the standard Form Input design.
- **Progress Bar**: A thin, continuous progress bar at the very top of the screen (`height: 4px`, color: Deep Indigo) to show interview progression (e.g., Question 3 of 10).

---

## 7. Modals

Used for confirmations or quick edits without leaving the page.

- **Overlay**: Dark overlay (`rgba(17, 24, 39, 0.5)`) with backdrop blur if supported (`backdrop-filter: blur(4px)`).
- **Container**: White surface, `16px` border radius, `Shadow Large`, centered.
- **Header/Footer**: Clear dividers (`border-bottom` for header, `border-top` for footer). Actions always in the footer (Secondary on left, Primary on right).
