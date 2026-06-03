---
name: Vibrant AI Interviewer
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0ede9'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#494454'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#7b7486'
  outline-variant: '#cbc3d7'
  surface-tint: '#6d3bd7'
  primary: '#6b38d4'
  on-primary: '#ffffff'
  primary-container: '#8455ef'
  on-primary-container: '#fffbff'
  inverse-primary: '#d0bcff'
  secondary: '#b90538'
  on-secondary: '#ffffff'
  secondary-container: '#dc2c4f'
  on-secondary-container: '#fffbff'
  tertiary: '#3f6700'
  on-tertiary: '#ffffff'
  tertiary-container: '#518200'
  on-tertiary-container: '#f9ffea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#acf847'
  tertiary-fixed-dim: '#91db2a'
  on-tertiary-fixed: '#102000'
  on-tertiary-fixed-variant: '#304f00'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is built to bridge the gap between high-stakes career preparation and a welcoming, supportive learning environment. It targets modern job seekers who value efficiency but need a low-pressure space to practice. 

The aesthetic is **Vibrant and Playful**, leaning heavily into modern SaaS trends with a touch of "soft tech." It utilizes a warm, organic base palette to avoid the sterile feel of typical corporate platforms. Key visual pillars include large-scale rounded geometry, multi-color gradients that suggest energy and movement, and a "bubbly" but structured layout. The UI should feel approachable, encouraging, and highly interactive.

## Colors

The palette is anchored by a warm cream background (#FCF9F5) to maintain high legibility without the harshness of pure white. 

- **Primary (Electric Violet):** Used for main actions, active states, and primary brand markers.
- **Secondary (Coral Pink):** Used for accents, secondary buttons, and decorative elements.
- **Accent (Lime):** Reserved for success states, progress indicators, and "positive" AI feedback.
- **Gradients:** Use a linear gradient (135deg) from Primary to Secondary for high-impact surfaces like hero sections, call-to-action cards, and progress bars.

## Typography

This design system uses **Plus Jakarta Sans** for headlines to provide a geometric, optimistic, and contemporary feel. Its wide apertures and modern curves reinforce the playful brand personality.

**Inter** is used for all body text and UI labels to ensure maximum readability and a professional balance. Line heights are intentionally generous to improve the "airy" feel of the platform. For data-heavy labels or secondary navigation, use semi-bold Inter with slight letter-spacing to maintain hierarchy without needing excessive color changes.

## Layout & Spacing

The layout philosophy follows a **fluid grid** model with significant breathing room. 

- **Grid:** Use a 12-column grid for desktop with 24px gutters. For mobile, collapse to a single column with 16px side margins.
- **Rhythm:** Spacing follows an 8px scale. Use `lg` (48px) and `xl` (80px) padding for container sections to emphasize the playful, spacious aesthetic.
- **Alignment:** Content should be centered or grouped in large cards to avoid a cluttered "dashboard" look. Every interactive section must have at least 24px of internal padding.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and tonal layering. 

- **Shadows:** Use deep, soft, multi-layered shadows rather than hard borders. For primary cards, use a shadow with a large blur (30px-50px) at low opacity (8-10%) tinted with the Primary color (#8B5CF6) to give the appearance of floating.
- **Layers:** 
  1. **Base:** Warm cream (#FCF9F5).
  2. **Surface:** Pure white cards with subtle 1px borders in a slightly darker cream or very light violet.
  3. **Elevated:** Elements like active buttons or focused inputs should use a secondary, tighter shadow to indicate "pressability."
- **Glassmorphism:** Use subtle backdrop blurs (12px) on floating navigation bars or modal overlays to maintain context with the vibrant background elements.

## Shapes

The shape language is extremely soft and approachable. 

- **Radius:** A standard radius of 24px is applied to all cards and major containers. 
- **Pill-shapes:** Buttons, tags, and progress bar containers must be fully rounded (pill-shaped) to reinforce the friendly, non-intimidating nature of the interview tool.
- **Consistency:** Avoid mixing sharp corners with rounded ones. Even small elements like checkboxes or tooltips should carry a minimum 8px radius.

## Components

- **Buttons:** Large, pill-shaped, and high-contrast. The primary button uses the Violet-to-Coral gradient with white text. Hover states should include a subtle scale-up effect (1.02x) and an increased shadow spread.
- **Cards:** White backgrounds, 24px corner radius, and deep soft shadows. Use a 1px border (#F1F5F9) to define edges against the cream background.
- **Input Fields:** Generous padding (16px vertically), 16px radius, and a subtle light-violet border that becomes vibrant and thicker on focus.
- **Progress Indicators:** Thick, pill-shaped tracks using the Lime (#84CC16) accent color for the fill. Use a subtle pulse animation for "active" states.
- **Chips/Badges:** Small, pill-shaped labels with low-opacity versions of the brand colors (e.g., 10% opacity Lime background with 100% Lime text).
- **Voice Visualizers:** Use rounded vertical bars that animate with varying heights, utilizing the Primary-to-Secondary gradient to represent AI or user speech.