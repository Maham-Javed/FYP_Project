# Page-Level UI Enhancements

This document describes the structural and layout improvements for the core pages of the Xenon AI Recruitment System. The goal is to enhance alignment, visual clarity, and hierarchy without rebuilding the existing React components from scratch.

---

## 1. Dashboard (Recruiter & Candidate)

**Current Issue:** Dashboards often feel cluttered if all information is presented with the same visual weight.
**Enhancements:**
- **Layout Structure:** Implement a distinct Page Header area with a gray background spanning the full width, containing the Welcome message and high-level stats. Below it, the main content area will sit on the white or off-white background.
- **Top Metric Cards:** Use a CSS Grid to display 3-4 key metrics (e.g., "Active Jobs", "New Applications", "Interviews Pending") horizontally at the top. Give these cards the `Shadow Medium` and `12px` border radius.
- **Visual Hierarchy:** Ensure the section titles (e.g., "Recent Applications") use the H2 typography style (`24px`, Bold, Dark Gray) and have at least `32px` of margin above them to separate them from the metrics.
- **Empty States:** If a recruiter has no jobs or a candidate has no applications, display a beautifully aligned empty state: A subtle, desaturated SVG icon in the center, a brief message ("No active applications yet."), and a Primary Button ("Explore Jobs").

---

## 2. Job Listing Page

**Current Issue:** Job feeds can be overwhelming to scroll through. Lack of clear distinction between job attributes.
**Enhancements:**
- **Grid vs. List:** Ensure jobs are displayed in a clean responsive grid (1 column on mobile, 2 or 3 columns on desktop) using CSS Grid (`gap: 24px`).
- **Card Alignment:**
  - Top Left: Job Title (H3).
  - Top Right: "Posted 2d ago" (Muted Text).
  - Middle: Experience Level and Location presented as inline flex items separated by a bullet point (`•`) or small icons.
  - Bottom: Primary "Apply" or "View Details" button strictly aligned to the bottom right.
- **Search & Filters:** Move filters to a sticky left sidebar (for desktop) or a clean, single-row horizontal filter bar just below the page title. Use the standardized dropdown and input component styles.

---

## 3. Candidate Profile / Application View

**Current Issue:** Reading a candidate's profile can be difficult if the AI match score and the raw resume text clash visually.
**Enhancements:**
- **Two-Column Layout (Desktop):**
  - **Left Column (1/3 width):** The "Summary Card". Contains the Candidate's Name, Contact Info, and the prominent **AI Match Percentage Indicator** (the pill badge). Include quick AI feedback summaries here.
  - **Right Column (2/3 width):** The "Details Card". Contains tabbed navigation (e.g., "Resume Data", "Interview Results").
- **Spacing:** Use `24px` padding inside both columns. Ensure the gap between the two columns is `32px`.
- **Match Focus:** The AI Match Score must be the highest-contrast element on this page, drawing the recruiter's eye immediately.

---

## 4. Interview Interface

**Current Issue:** Candidates taking an automated interview need absolute focus. Cluttered sidebars or navbars cause distraction.
**Enhancements:**
- **Immersive Mode:** Hide the standard sidebar and top navigation during an active interview. 
- **Center Alignment:** Wrap the interview content in a max-width container (`max-w-3xl`) and center it horizontally on the screen to simulate a focused reading environment.
- **Header:**
  - Left: The Xenon Logo (small).
  - Center: The continuous Progress Bar spanning the exact width of the content container.
  - Right: The countdown Timer.
- **Typography Focus:** The Question text must be large and highly legible (`24px`, `#111827`, line-height `1.5`). 
- **TextArea Expansion:** The answer input area should automatically resize vertically as the candidate types, ensuring they don't have to scroll within a tiny text box. Use `box-shadow` to highlight focus.

---

## 5. Global Alignment Rules

- **Max Width:** Constrain the main content area to a sensible max width (e.g., `1280px` or `max-w-7xl` in Tailwind terms) and center it (`margin: 0 auto`). Do not let tables or grids stretch infinitely on ultra-wide monitors.
- **Consistent Page Padding:** Every page must have standard padding (e.g., `padding: 32px 24px` on desktop, `16px` on mobile) to ensure content never touches the edge of the screen.
