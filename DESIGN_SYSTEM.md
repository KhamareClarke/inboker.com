# Unified UI Design System (UAE Template)

This project uses a shared design system based on the **UAE Private Investor** structural template. Layout, spacing, typography, and component structure are standardized; **brand colors remain per-platform**.

## Design Tokens

**File:** `app/design-tokens.css`

- **Spacing:** `--space-1` (8px) through `--space-6` (64px)
- **Typography:** H1 (hero), H2 (section), H3 (subsection), body – via `--font-size-h1`, `--font-weight-h1`, etc.
- **Border radius:** `--radius-default` (12px), `--radius-lg`, `--radius-xl`
- **Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- **Containers:** `--container-main` (1200px), `--container-wide` (1400px), `--container-narrow` (896px)

Tokens are imported in `app/globals.css`. Tailwind theme extends: `max-w-content`, `max-w-content-wide`, `rounded-ds`, `shadow-ds-*`, `py-ds-*`, etc.

## UI Components (`components/ui/`)

| Component | Purpose |
|-----------|--------|
| **Section** | Page section with consistent vertical rhythm (`size="default"` \| `"large"`). |
| **Container** | Max-width + horizontal padding (`size="main"` \| `"wide"` \| `"narrow"` \| `"content"`). |
| **Card** | Uses design-system radius and shadow. |
| **Button** | Uses `rounded-ds`, min-height 44px, design-system shadows. |
| **Input** | Uses `rounded-ds`, min-height 44px. |
| **NavbarWrapper** | Wraps navbar content with design-system container. |
| **DashboardLayout** | Sidebar + main area; main uses wide container. |
| **PageLayout** | Optional header + main content in a design-system container. |

## Layout Structure (UAE Template)

1. **Navbar** (when shown)
2. **Page header / hero** (optional)
3. **Main content** inside a **Container**
4. **Sections** and **Cards**
5. **Footer** (when shown)

Use **Section** for each major block; use **Container** to wrap content width. Use **PageLayout** when you want the full page structure with an optional header.

## Pilot Page

**Admin Login** (`app/(auth)/admin-login/page.tsx`) is the pilot:

- Outer: **Section** (full-height, centered).
- Inner: **Container** (narrow, max-width for form).
- **Card**, **Button**, **Input** use design tokens.

## Gradual Migration

For other pages:

- Replace generic `div` wrappers with **Section** and **Container**.
- Use **Card** for panels and content blocks.
- Use **Button** and **Input** from `@/components/ui` (they already use tokens).
- Use **DashboardLayout** for dashboard pages with sidebar + main.
- Use **NavbarWrapper** inside navbar for consistent inner width.

**Do not change:** backend logic, API calls, Supabase, auth, routing, state, or file structure. Only layout, spacing, typography, and UI styling.
