# Humi Workbench Landing Revamp

Date: 2026-07-29

## Goal

Revamp the public Humi homepage into a modern, professional HRIS landing page that serves both HR teams and business owners or operations leaders. The conversion hierarchy is intentionally weighted toward a free trial (approximately 70% of CTA emphasis), with WhatsApp consultation as the secondary path (approximately 30%).

The page uses GajiHub only as a public structural reference: clear value proposition, product-led proof, scannable modules, pricing, and FAQ. It does not copy GajiHub's visual identity, wording, claims, customer proof, or assets.

## Scope

The implementation changes:

- `resources/js/pages/welcome.tsx`
- `tokens.css`
- `.hallmark/log.json`
- Landing-page assertions in `tests/Feature/LandingPageTest.php` only if the rendered-copy contract changes.

The implementation does not change:

- The `/` route or its Inertia props.
- Authentication, registration, billing, or WhatsApp behavior.
- Pricing values or feature availability already represented by the application.
- Industry landing routes, news, contact, careers, or authenticated application UI.
- Existing uncommitted work outside the files listed above.

No production file or component directory will be deleted.

## Design Direction

Hallmark configuration:

- Genre: modern-minimal.
- Macrostructure: Workbench.
- Theme: Quiet, adapted to the established Humi teal brand tokens.
- Navigation: N5 floating pill.
- Footer: Ft5 statement.
- Tone: composed, specific, professional, and operational.
- Enrichment: a product-proof composition built from Humi's own interface vocabulary; no fake browser frame and no copied external screenshot.
- Motion: limited to button press feedback, selected product-tour state, and subtle product-panel transitions. Reduced-motion users receive immediate state changes or short opacity-only transitions.

The existing Geist-based stack, four-point spacing rhythm, rounded controls, Humi teal, and light/dark logo assets remain part of the visual system.

## Content Architecture

### 1. Floating navigation

The navigation remains compact and detached from the viewport edge. It includes:

- Humi logo linked to `/`.
- Product destinations: Fitur, Solusi, Harga, and Berita.
- Login as a quiet text action.
- Trial or Dashboard as the primary action, depending on authentication state.

At mobile widths, nonessential navigation links collapse while the brand and primary action remain visible. Clickable labels must remain on one line.

### 2. Workbench hero

The hero uses a two-column layout:

- Left: concise operational promise, supporting copy, a primary trial CTA, and a secondary WhatsApp CTA.
- Right: a product workbench showing how attendance, employee data, approvals, and payroll connect in Humi.

Proposed headline:

> Kelola orang, waktu, dan payroll dalam satu sistem.

The primary CTA resolves to Dashboard for authenticated users, Register when registration is enabled, and Login when registration is unavailable. The secondary CTA opens the existing WhatsApp consultation URL in a new tab.

The hero does not include unverified efficiency, accuracy, customer-count, or productivity metrics.

### 3. Operational problem-to-flow section

A short section explains the product relationship instead of listing generic benefits:

1. Employee and schedule data become the source of truth.
2. Attendance, leave, overtime, and approvals feed daily operations.
3. Approved data flows into payroll and management reporting.

This section uses a connected workflow treatment suitable for both HR and operational decision-makers.

### 4. Interactive product tour

The main Workbench section presents a small set of product areas:

- Data karyawan.
- Absensi dan jadwal.
- Cuti, lembur, dan approval.
- Payroll dan slip gaji.

Selecting a product area updates the adjacent preview and supporting details. The first item is selected by default. Tabs use buttons with `aria-pressed`, visible focus treatment, and no scroll-jumping behavior.

The preview is constructed from product-relevant data and UI patterns already present in Humi. It must not imply features or metrics the application does not support.

### 5. Industry solutions

The three existing industry routes remain prominent:

- Outsourcing.
- Retail and F&B.
- Manufacturing shift.

Each solution card describes its operational context and links to its existing dedicated page. This section supports discovery but does not compete visually with the trial CTA.

### 6. Pricing

The existing Free Trial, Basic, and Plus pricing contracts remain unchanged. The presentation becomes more compact:

- Actual prices stay visible.
- Plus remains the recommended plan.
- Feature lists are reduced to the most decision-relevant items with a clear route to detailed comparison where available.
- Trial CTA remains the dominant action.

No new discount, tax, payment, or package claims are introduced.

### 7. FAQ

The FAQ answers practical buying questions in direct Indonesian:

- What can be tested during the trial?
- How long does implementation take?
- Can existing employee data be imported?
- Is Humi suitable for shift-based businesses?
- What happens after the trial?

Answers use only existing product and offer information. If a detail is not backed by the repository, the answer avoids making a precise guarantee.

### 8. Closing statement and footer

The final section uses one primary trial CTA and a short WhatsApp text link beneath it. The footer closes with a statement about connected HR operations, followed by restrained navigation and legal copyright text.

The floating WhatsApp shortcut remains available but becomes visually subordinate to the trial CTA.

## Component Boundaries

`welcome.tsx` remains the route-owned page. To keep the page understandable, repeated structures are represented by typed local data and small local components within the same file:

- `LandingNav`
- `ProductWorkbench`
- `WorkflowStep`
- `IndustrySolution`
- `PricingPlan`
- `FaqItem`

These components receive display data and resolved URLs through props. They do not fetch data or change application state outside the product-tour selection.

This keeps the redesign scoped to the landing route without creating a new shared public-site architecture.

## Data and Behavior

The page continues to consume:

- `auth.user` from shared Inertia props.
- `appUrl` for structured data.
- `canRegister` from the `/` route.

CTA resolution:

1. Authenticated user: Dashboard.
2. Guest with registration enabled: Register or start trial.
3. Guest with registration disabled: Login.

The WhatsApp URL remains the existing `wa.me` contact URL. External links use `target="_blank"` and `rel="noopener noreferrer"`.

SEO metadata and structured data remain in place. The organization logo URL is updated to the current light-mode public logo rather than the legacy `logo.png`.

## Design Tokens

All landing-specific colors, typography, spacing, radius, duration, and easing values are exposed through named custom properties in `tokens.css`. JSX consumes those tokens through Tailwind arbitrary-value syntax or focused landing utility classes.

No new inline hex, RGB, OKLCH, or font-family declarations are added to the landing page. Existing global application tokens remain compatible with authenticated pages.

The token set includes:

- Humi paper, ink, muted, line, accent, accent-hover, and focus colors.
- Geist display and body roles.
- Four-point semantic spacing.
- Compact and panel radii.
- Short and medium durations.
- Standard out, in, and in-out easings.

## Responsive Requirements

The completed page is verified at 320, 375, 414, and 768 pixels:

- No horizontal scrolling.
- Hero and section headers collapse to one column.
- Display headings use `overflow-wrap: anywhere` and `min-width: 0`.
- Image-bearing grids use `minmax(0, 1fr)`.
- CTA and navigation labels remain on one line.
- Product-tour controls wrap or stack without creating a horizontal scroll-jump.
- Pricing cards stack in reading order.
- Root overflow remains `clip`, not `hidden`.

Desktop verification covers at least 1280 pixels.

## Accessibility and Interaction States

Interactive elements cover:

- Default.
- Hover.
- Focus-visible.
- Active.
- Disabled when applicable.
- Loading when navigation is pending where already provided by Inertia.
- Error or success only where the interaction can produce those states.

Focus rings are visible and immediate. Icon-only controls have accessible labels. Content order remains logical without CSS. Color is not the only indicator of the active product-tour item.

## Verification

Implementation verification includes:

- `npm run types:check`
- `npm run lint:check`
- `npm run build`
- `php artisan test --filter=LandingPageTest`
- Browser checks at 320, 375, 414, 768, and 1280 pixels.
- Light and dark logo verification.
- Authenticated, registrable guest, and registration-disabled CTA resolution.
- WhatsApp links and section anchors.
- Hallmark 69-gate slop test.

## Acceptance Criteria

- The homepage clearly prioritizes a free trial and keeps WhatsApp secondary.
- The hero speaks to HR and business operations without generic AI-style copy.
- The product is visible and understandable above the fold.
- The Workbench tour explains at least four connected Humi product areas.
- Existing pricing, routes, authentication behavior, and structured-data intent are preserved.
- No fabricated metrics, testimonials, customer logos, certifications, or product guarantees are introduced.
- The page passes type-check, lint, production build, landing feature test, responsive checks, and the Hallmark slop test.
