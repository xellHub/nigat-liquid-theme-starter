# Contact form

## Anatomy

A fine-grained 5-layer contact layout composed of independent child theme blocks:

- **Section Shell (`sticky-aside.liquid`)**: Full-bleed layout container providing universal color scheme context, padding tokens, and container-aware 30:70 grid layout.
- **Aside Column (`_contact-form-aside.liquid`)**: Sticky 30% guidance column hosting independent `heading`, `text`, `icon-with-text`, and `button`/`link` blocks.
- **Form Column (`_contact-form-content.liquid`)**: 70% inquiry form rendering `{% form 'contact' %}` and hosting selectable `input`, `select`, `textarea`, and `button` theme blocks.

## Responsive behavior

The section uses container-aware layout rules (`3fr 7fr` split on viewports >= 750px) and collapses smoothly to a single logical reading order on narrow containers.

Vertical spacing follows the theme's responsive `--section-flow-gap` token. When the contact section is first in the main content, its outer wrapper adds top spacing so the global canvas padding reset cannot remove the gap below the header. Spacing is controlled by foundation tokens rather than per-section pixel settings.

## Accessibility

- Semantic `<form>`, `<aside>`, `<label>`, `<input>`, `<select>`, `<textarea>`, and `<button>` elements.
- Accessible focus rings, `aria-required`, and validation error summaries.
- Programmatic associations between input labels, helper text, and error notifications.
- Theme-level reduced-motion behavior.
