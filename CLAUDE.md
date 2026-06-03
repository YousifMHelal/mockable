# Mockable

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/002-vapi-arabic-spike/plan.md`
<!-- SPECKIT END -->


## Design reference — source of truth
The app's visual design lives in `/design`. Match it; do not invent a different style.

- Design system & tokens: @design/README.md
- Screen mockups (visual reference): see `design/screens/`
- Stitch HTML/CSS exports (structure reference): see `design/exports/`

Rules:
- Before building or styling any page, read `design/README.md` and open the matching
  file in `design/screens/` for that page.
- Match the colors, spacing, typography, radius, and layout from these references.
- Reuse layout structure from the Stitch exports where sensible, adapted to our
  React + Tailwind stack.
- Light mode only — never a dark theme.
