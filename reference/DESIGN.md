---
name: Fidelity Modern
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fc'
  surface-container: '#ebedf7'
  surface-container-high: '#e6e8f1'
  surface-container-highest: '#e0e2eb'
  on-surface: '#181c22'
  on-surface-variant: '#414753'
  inverse-surface: '#2d3037'
  inverse-on-surface: '#eef0fa'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#005cb8'
  on-primary: '#ffffff'
  primary-container: '#1275e2'
  on-primary-container: '#000512'
  inverse-primary: '#aac7ff'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#9a4600'
  on-tertiary: '#ffffff'
  tertiary-container: '#c05900'
  on-tertiary-container: '#0d0300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f7'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#763400'
  background: '#f9f9ff'
  on-background: '#181c22'
  surface-variant: '#e0e2eb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Design System

## Brand & Style
The design system adopts a **Corporate / Modern** style, characterized by a reliable, balanced, and professional aesthetic inspired by modern enterprise design principles. The tone is clean, efficient, and trustworthy, aimed at professional workflows and clear information hierarchy.

## Colors
The color palette is built for clarity and professional contrast in a light color mode:
- **Primary Color (`#1275e2`)**: A vibrant, dependable blue used for primary actions, active states, and key interactive elements.
- **Secondary Color (`#5f78a3`)**: A slate blue-gray providing balanced support for secondary elements and borders.
- **Tertiary Color (`#c55b00`)**: A warm accent color used sparingly to draw attention to critical calls to action or notifications.
- **Neutral Color (`#74777f`)**: A versatile cool neutral used for text, backgrounds, and structural dividers.

## Typography
The typography stack is set entirely in **Inter**, providing crisp legibility across all screen sizes and densities.
- **Headlines**: Semi-bold (`600`) weights create strong, readable structural headers.
- **Body**: Regular (`400`) weights ensure optimal readability for dense data and long-form content.
- **Labels**: Medium (`500`) weights give UI controls and captions clear distinctiveness.

## Layout & Spacing
The layout relies on a predictable, structured grid system with standard 1rem gutters and 1.5rem outer margins. The scaling rhythm (`space-xs` through `space-xl`) guarantees consistent padding and structural gaps across all form factors, adapting smoothly from mobile to desktop environments.

## Elevation & Depth
Elevation is achieved primarily through tonal surface layering and low-contrast outlines, avoiding heavy drop shadows in favor of clean, flat corporate structuring with subtle border delineation.

## Shapes
With a roundedness level of `2` (Rounded), UI elements feature a friendly yet professional 0.5rem base radius, with larger containers scaling up to 1rem and 1.5rem for cards and modals.

## Components
- **Buttons**: Feature solid primary fills in `#1275e2` with rounded corners (0.5rem) and clear hover states.
- **Inputs**: Clean borders using the neutral tone (`#74777f`) with focused states highlighting the primary blue.
- **Cards**: Surface containers utilizing subtle borders and generous internal padding matching the layout spacing scale.