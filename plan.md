# Portfolio upgrade plan

## Scope
Upgrade the existing React + Vite portfolio without adding paid services or generated assets. Preserve the existing identity, interactive sections, contact tools, and `/experience` route while improving first-load speed, cinematic polish, responsive behavior, accessibility, and search metadata.

## Design direction
- **Style options:** editorial data-lab (0.04), cinematic terminal dossier (0.06), gallery-like brutalist portfolio (0.03).
- **Selected movement:** cinematic terminal dossier with editorial typography.
- **Core principles:** fast reveal instead of waiting; strong visual hierarchy; tactile but restrained motion; every decorative element must support content.
- **Color philosophy:** keep the warm black and signal-orange system so the brand remains recognizable, using contrast and spacing rather than more effects.
- **Layout paradigm:** chapter-based narrative with asymmetric editorial columns and full-width work rows, not a generic centered card grid.
- **Signature elements:** orange signal line, ghost chapter numerals, monospace system labels.
- **Interaction philosophy:** motion should orient the visitor, not block reading; hover effects become progressive enhancement and touch layouts remain complete without them.
- **Animation:** shorten the entrance sequence, respect `prefers-reduced-motion`, use opacity/transform only for reveals, and avoid layout-shifting effects.
- **Typography:** retain Harsh for display, Instrument Serif for body/editorial copy, JetBrains Mono for metadata.
- **Brand essence:** a data/AI builder who turns messy information into useful decisions and leads teams to ship; curious, decisive, human.
- **Brand voice:** direct, thoughtful, slightly experimental. Example: “I turn raw signals into useful direction.” / “Build the model. Explain the why.”
- **Wordmark:** preserve the compact `H.` mark and use the orange dot as the brand signal.
- **Signature brand color:** signal orange `#ff3d00`.

## Implementation
- Keep the current Vite/React architecture and components.
- Reduce loader blocking time and make it safe for reduced-motion users.
- Improve semantic controls and mobile navigation behavior.
- Add concise project outcome copy and clearer visual affordances without inventing external project URLs.
- Add route manifest and align public SEO documents with the current deployment origin.
- Validate with lint, production build, and raw HTTP checks for metadata and SEO files.
