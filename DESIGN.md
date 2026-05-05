# Matt Haynes Couture Design System

## Visual Direction
Volcanic couture editorial: blackened glass, ivory light, Costa Rica heat, thin metallic signal lines, cinematic video, and precise typographic staging. The experience should feel like a founder dossier projected through a luxury motion system.

## Color Strategy
Restrained with punctures of cyan and aged gold. Use OKLCH tokens and tinted neutrals; avoid pure black and pure white.

- Ink: deep volcanic charcoal with a slight cyan bias.
- Paper: warm ivory with low chroma.
- Cyan: active signal, under 10 percent of the surface.
- Gold: editorial emphasis and contact actions.
- Blood red: rare status accent only.

## Typography
Use three roles maximum:

- Display serif for hero/editorial headlines.
- Refined grotesk for body and navigation.
- Mono for labels, indices, counters, and command UI.

Headings use fluid clamp scales, body stays readable at 16px or above, and text containers stay under 75ch.

## Layout
Avoid cards as the default structure. Use full-bleed sections, asymmetric editorial grids, runway-style chapter indices, large type masks, image/video crops, and sparse panels only where framing is functional.

## Motion
Use GSAP ScrollTrigger for chapter choreography, SplitText-style masked reveals, Lenis for scroll feel, Motion for React island state transitions, and Three.js for WebGL shader/lens work. Easing should be quart/quint/expo; no bounce or elastic. Respect reduced motion.

## Effects
Preserve the four video assets:

- hero-header.mp4
- grok-abstract.mp4
- story-mid.mp4
- story-bottom.mp4

Replace old fog/cloud/firefly/rain layers with:

- A refractive shader lens over the video.
- Scroll-reactive color grading.
- A sparse 3D systems map.
- Thin chapter lines and tactile command controls.

## Quality Gates
- `npx impeccable detect --fast src` should report no serious AI-slop tells.
- No side stripes, gradient text, decorative glassmorphism, nested cards, or identical card grids.
- Every interactive target should be at least 44px on mobile.
- Mobile layout must be art-directed, not simply collapsed.
