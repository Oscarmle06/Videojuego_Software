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

The implementation uses **native SVG `feColorMatrix` filters** embedded directly in the page via JavaScript — no external library or backend change required. A CSS `filter` property is applied to the entire `<body>` element, which transforms every pixel rendered on screen including text, images, charts, and the game iframe.

The color matrices used are based on the **Vienot et al. (1999)** dichromacy model, a peer-reviewed standard for simulating color vision deficiency.

### Files modified

| File | Change |
|------|--------|
| `webpage/js/auth.js` | Added `injectColorblindFilters()`, `setColorblindMode()`, `getCbMode()` functions; updated `setupNav()` to render the toggle; added `DOMContentLoaded` listener to persist mode across page navigation |
| `webpage/css/style.css` | Added `.cb-protanopia`, `.cb-deuteranopia`, `.cb-tritanopia`, `.cb-achromatopsia` body-level filter classes; added `.cb-toggle` and `.cb-btn` styles for the navbar toggle |

No HTML files were modified. The SVG filter definitions are injected into the DOM at runtime.

---

## UI: Colorblind Mode Toggle

A compact button group appears in the top navigation bar on all authenticated pages (Stats, Home, Tutorial, Play):

```
[N]  [P]  [D]  [T]  [A]
```

| Button | Label | Mode | Type of Color Blindness |
|--------|-------|------|-------------------------|
| N | Normal | Off | Default — no filter applied |
| P | Protanopia | `cb-protanopia` | Red-blind (missing L-cones). ~1% of men. Reds appear as dark browns/greens. |
| D | Deuteranopia | `cb-deuteranopia` | Green-blind (missing M-cones). ~5% of men. Most common type. Greens and reds merge. |
| T | Tritanopia | `cb-tritanopia` | Blue-blind (missing S-cones). ~0.01% of population. Blues and greens look alike. |
| A | Achromatopsia | `cb-achromatopsia` | Complete color blindness. Uses CSS `grayscale(100%)`. Very rare, but also useful for users with photosensitivity who prefer reduced contrast. |

The selected mode is highlighted with a cyan background on its button and **persists across all pages** using `localStorage`, so a user does not need to re-select it when navigating between Stats, Tutorial, Home, or Play.

---

## Color Matrix Values

The SVG filters use the following `feColorMatrix` matrices (Vienot et al. 1999):

**Protanopia** — shifts red channel toward green:
```
0.567  0.433  0      0  0
0.558  0.442  0      0  0
0      0.242  0.758  0  0
0      0      0      1  0
```

**Deuteranopia** — shifts green channel toward red:
```
0.625  0.375  0    0  0
0.7    0.3    0    0  0
0      0.3    0.7  0  0
0      0      0    1  0
```

**Tritanopia** — shifts blue channel toward green:
```
0.95   0.05   0      0  0
0      0.433  0.567  0  0
0      0.475  0.525  0  0
0      0      0      1  0
```

---

## Disability Types Addressed

| Disability | Type | Covered by |
|------------|------|------------|
| Red-green color blindness (most common) | Deuteranopia / Protanopia | P and D modes |
| Blue-yellow color blindness | Tritanopia | T mode |
| Complete color blindness | Achromatopsia | A mode (grayscale) |
| Photosensitivity / contrast sensitivity | — | A mode (reduces visual noise) |

---

## WCAG Reference

This feature aligns with **WCAG 2.1 Success Criterion 1.4.1 — Use of Color** (Level A):

> *"Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."*

By providing a colorblind simulation filter, users can verify that the interface remains legible under their specific type of color vision deficiency, and can use the application in the mode that best matches their visual needs.

---

## Technical Notes

- The filter is applied to `<body>`, so it affects **all content**: text, buttons, charts (Chart.js, D3), images, and the embedded game iframe.
- No external CSS framework or JavaScript library was used. The implementation is ~45 lines of vanilla JS + CSS.
- The `color-interpolation-filters="linearRGB"` attribute on each SVG filter ensures mathematically accurate color transformation in linear light space.
- The toggle is only visible to **authenticated users** (it is rendered by `setupNav()`, which requires a valid session). Login and register pages still apply the saved mode silently via the `DOMContentLoaded` listener, but without showing the toggle UI.
