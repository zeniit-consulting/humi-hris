# Employee Portal Index Revamp Design

## Objective

Revamp the employee portal home page into a context-first mobile command center for employees who predominantly use the portal from a phone. The page must make the most relevant action for the current workday immediately obvious while preserving every existing portal route and API contract.

## Audience and Product Tone

- Primary audience: mobile workers who need fast, low-friction access during a workday.
- Primary job: show the next useful action based on today's attendance state.
- Tone: warm utilitarian; calm, direct, and operational rather than decorative.
- Language: concise Indonesian labels with existing business terminology retained.

## Information Architecture

The page is ordered by urgency rather than by feature category:

1. Compact identity header with employee name, position, profile entry point, and logout.
2. Contextual focus card containing today's date, shift, attendance status, clock-in/out values, and one primary action.
3. Attention queue shown only when announcements, surveys, assigned assets, or other follow-up items exist.
4. Work shortcuts for attendance, leave, overtime, kasbon, and payroll.
5. Compact personal summary for leave balance and latest available payroll state.
6. Short recent-activity timeline with a clear route to the full activity page.
7. Persistent bottom navigation.

## Contextual Attendance Behavior

The focus card derives its state from the existing `quick_action` payload:

- `can_clock_in`: emphasize the check-in route and label the action `Mulai kerja`.
- `can_clock_out`: emphasize the check-out route and label the action `Selesaikan kerja`.
- Neither: show a completed or unavailable state, keep attendance details visible, and offer the attendance history route as a secondary action.
- Shift day off: communicate that today is a day off and avoid presenting a misleading attendance action.

No attendance mutation occurs on the index page. The primary action continues to navigate to the existing check-in or check-out flow.

## Interaction Design

- Interactive targets are at least 44 by 44 pixels.
- Press feedback begins immediately with a restrained scale/opacity response.
- Motion uses only `transform` and `opacity` and stays interruptible because navigation is never locked during transition feedback.
- Bottom navigation uses a translucent material with sufficient contrast and a solid fallback for reduced transparency.
- `prefers-reduced-motion` replaces spatial movement with a short opacity response.
- Keyboard focus uses a persistent high-contrast `:focus-visible` ring.
- Horizontal scrolling is avoided for primary navigation and core actions at 320, 375, 414, and 768 pixel widths.

## Visual Direction

- Preserve the Humi teal identity and the portal's Manrope plus Plus Jakarta Sans type pairing.
- Use asymmetric hierarchy: one dominant contextual surface, quiet supporting rows, and fewer repeated bordered cards.
- Avoid decorative gradients, fabricated metrics, oversized marketing copy, floating icon grids, and excessive pills.
- Use named portal tokens for color, type, spacing, radius, duration, and easing values.
- The interface should feel calm and tactile without mimicking native iOS chrome.

## Component Boundaries

- `resources/js/pages/portal/index.tsx`: page composition, derived contextual state, attention queue, summaries, loading and empty states.
- `resources/js/pages/portal/navbar.tsx`: mobile navigation interaction and material treatment.
- `resources/css/app.css`: portal-scoped utility hooks and responsive/reduced-motion rules.
- `tokens.css`: prefixed portal design tokens, imported by the existing CSS entry point without replacing global tokens.
- `.hallmark/preflight.json` and `.hallmark/log.json`: Hallmark scan and diversification records.

No production routes, API controllers, or existing portal section pages are removed.

## Data Flow and Failure Handling

- Continue loading `/portal/api/summary` with the existing request helper.
- Derive display-only sections with memoized selectors; do not duplicate API state.
- Preserve the current toast error path when the summary cannot load.
- Replace blank loading space with meaningful skeletons matching the final hierarchy.
- When optional collections are empty, omit the attention queue and show a concise recent-activity empty state.
- All optional links fall back to their current portal routes.

## Validation

- TypeScript type check and production Vite build.
- Prettier and ESLint on the changed frontend files.
- Existing portal feature tests to confirm the summary contract and route remain intact.
- Browser interaction QA for the contextual action, shortcuts, logout sheet, and bottom navigation.
- Responsive browser verification at 320, 375, 414, and 768 pixels with no horizontal overflow.
- Reduced-motion and keyboard focus checks.

## Acceptance Criteria

- A mobile worker can identify the correct attendance action without scrolling.
- Only one primary action competes for attention above the fold.
- Follow-up items are visible when relevant and absent when empty.
- Existing portal destinations and logout behavior remain functional.
- The page has no invented business metrics or new backend dependencies.
- The implementation meets Hallmark's anti-pattern and responsive gates and Apple-style feedback/accessibility principles.
