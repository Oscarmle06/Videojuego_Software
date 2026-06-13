# Accessibility Report — Velocity Draft
**Authors:** Oscar Lara, Emilio Lara, Aixa Mendoza  
**Date:** June 2026  

---

## Overview

This report documents the accessibility improvement implemented in the Velocity Draft web platform. The change focuses on adapting the visual interface for users with **color vision deficiency (CVD)**, commonly known as color blindness, which affects approximately **8% of men and 0.5% of women** of northern European descent.

---

## Problem

The Velocity Draft interface relies heavily on color to communicate information:

- **Cyan (#00e5ff)** identifies the primary player, win stats, and active UI elements.
- **Magenta (#ff2d75)** is used for racing accents, hover states, and chart highlights.
- **Amber (#ffe600)** marks top-ranked leaderboard entries.
- **Green (#00ffcc)** highlights the player's own row in the leaderboard.
- **Red (#ff4060)** indicates error states and admin badges.

Users with red-green color blindness (the most common type) cannot reliably distinguish several of these colors from each other, making the interface harder to use.

---

## Solution Implemented

A **real-time colorblind simulation filter** was added to the navigation bar, accessible from every page of the web application.

### How it works

A transparent, full-screen `<div>` overlay is injected into the page via JavaScript. When a colorblind mode is selected, a `backdrop-filter` CSS property is applied to this overlay. Because `backdrop-filter` operates at the **GPU compositor layer** — after all page content has been painted — it affects every visible pixel on screen: text, images, charts, canvas elements, and the embedded game iframe alike. No external library or backend change is required.

Each colorblind mode uses standard CSS filter functions (`hue-rotate`, `saturate`, `sepia`, `grayscale`) which are universally supported in all modern browsers and work reliably within `backdrop-filter`.

### Files modified

| File | Change |
|------|--------|
| `Code/Web/frontend/js/auth.js` | Added `injectColorblindFilters()`, `setColorblindMode()`, `getCbMode()` and a `CB_FILTERS` map; updated `setupNav()` to render the toggle; added `DOMContentLoaded` listener to persist mode across page navigation |
| `Code/Web/frontend/css/style.css` | Added `#cb-filter-overlay` styles (fixed, full-screen, pointer-events none) and `.cb-toggle` / `.cb-btn` / `.cb-btn.cb-active` styles for the navbar toggle |

No HTML files were modified. The overlay is injected into the DOM at runtime by `auth.js`.

---

## UI: Colorblind Mode Toggle

A compact button group appears in the top navigation bar on all authenticated pages (Stats, Home, Tutorial, Play):

```
[N]  [P]  [D]  [T]  [A]
```

| Button | Mode | Type of Color Blindness |
|--------|------|-------------------------|
| N | Normal | Default — no filter applied |
| P | Protanopia | Red-blind (~1% of men). Reds appear dark or brownish. |
| D | Deuteranopia | Green-blind (~5% of men). Most common type. Reds and greens merge. |
| T | Tritanopia | Blue-blind (~0.01% of population). Blues and greens look alike. |
| A | Achromatopsia | Complete color blindness — full grayscale. |

The selected mode is highlighted with a cyan background on its button and **persists across all pages** using `localStorage`, so a user does not need to re-select it when navigating between pages.

---

## Filter Values

Each mode uses CSS filter functions applied via `backdrop-filter`:

| Mode | Filter |
|------|--------|
| Protanopia | `sepia(0.2) hue-rotate(-20deg) saturate(0.7)` |
| Deuteranopia | `sepia(0.2) hue-rotate(20deg) saturate(0.7)` |
| Tritanopia | `sepia(0.2) hue-rotate(180deg) saturate(0.7)` |
| Achromatopsia | `grayscale(100%)` |

These are perceptual approximations of each dichromacy type. `hue-rotate` shifts the color spectrum to simulate the missing cone type, `saturate` reduces chroma to reflect reduced color discrimination, and `sepia` adds a slight warm shift that helps approximate how protanopia and deuteranopia flatten warm tones together.

---

## Disability Types Addressed

| Disability | Type | Covered by |
|------------|------|------------|
| Red-green color blindness (most common) | Deuteranopia / Protanopia | P and D modes |
| Blue-yellow color blindness | Tritanopia | T mode |
| Complete color blindness | Achromatopsia | A mode |
| Photosensitivity / contrast sensitivity | — | A mode (reduces visual noise) |

---

## WCAG Reference

This feature aligns with **WCAG 2.1 Success Criterion 1.4.1 — Use of Color** (Level A):

> *"Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."*

By providing a colorblind simulation filter, users can verify that the interface remains legible under their specific type of color vision deficiency, and can use the application in the mode that best matches their visual needs.

---

## Technical Notes

- The filter is applied via `backdrop-filter` on a full-screen overlay `<div>`, which composites at the GPU layer and therefore affects **all visible content**: text, images, Bootstrap components, Chart.js and D3 charts, canvas elements, and the embedded game iframe.
- No external library was used. The full implementation is under 30 lines of vanilla JS and a single CSS rule.
- The toggle is only visible to **authenticated users** (rendered by `setupNav()`, which requires a valid session). On login and register pages, the saved mode is still applied silently via the `DOMContentLoaded` listener.
