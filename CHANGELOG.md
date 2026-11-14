# Changelog

All notable changes to the **MinKoi Studio** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.5.0] - 2026-11-14

### Fixed
- **Critical Mobile Liquid Glass Recovery (P0 Resolved)**:
  - Completely resolved the issue where the category indicator was invisible on real mobile devices across Eco, Balanced, and High quality tiers.
  - Eliminated `-webkit-mask-image` and `mask-image` on `.audio-category-nav` scroll container, preventing WebKit / Android WebView hardware-accelerated compositing layer drops and offscreen buffer isolation.
  - Removed `mix-blend-mode: overlay` from `.liquid-glass-shimmer` which triggered WebKit layer discarding inside scrollable contexts.
  - Introduced robust solid/RGBA fallback properties before all `color-mix()` declarations, ensuring full visual rendering on mobile browsers with partial or legacy CSS Color 5 engines.
  - Re-architected **Eco Mode** with a vibrant, high-contrast, saturated accent pill (`#0284c7` to `#0369a1` gradient with glowing aura and 2px border) that is immediately visible without GPU blur overhead.
  - Refined **High & Balanced Modes** with multi-stop luminous glass, top specular bevel highlight (`inset 0 1.5px 2px rgba(255, 255, 255, 0.75)`), bottom rim shadow, and glowing accent halo.
  - Polished **Light Mode** porcelain-glass capsule with crisp borders and high-contrast `#0f172a` active text.
  - Added `.has-liquid-nav` state management with graceful fallback styling for `.cat-tab.active` to ensure zero flash of unstyled/invisible tabs.
  - Added `document.fonts.ready` lifecycle listener in `js/ui/components.js` to synchronously re-measure tab dimensions when web fonts finish loading.

### Added
- **Multi-Viewport Automated QA Suite**: Created `scripts/qa/verify-v3-5.ps1` testing 9 viewport sizes (320x720, 360x800, 375x812, 390x844, 393x873, 412x915, 430x932, 768x1024, 1440x900), persona switching, auto-centering scroll position, and zero console errors.
- **Cache-Busting Update**: Bumped asset cache versions to `?v=35.0` across all CSS and JavaScript references in `index.html`.

---

## [3.4.0] - 2026-11-14

### Added
- **Miuix Tactile Controls**: Interactive button press physics (`scale(0.91-0.93)`) with cubic-bezier bounce recovery for playback buttons, hero play control, and quick action icons.
- **Automated QA Verification Suite**: Standalone test runners (`scripts/qa/verify-assets.ps1` and `scripts/qa/verify-lyrics.ps1`) for non-interactive dependency and regression checks.

### Fixed
- **Mobile Luminous Glass Capsule Hotfix**: Redesigned `.liquid-glass-indicator` with dual-stop luminous gradient, elevated `z-index: 1`, high-contrast specular reflections, and glowing active text, eliminating the washed-out/flat appearance on mobile screens under Balanced and Eco quality tiers.
- **Zero-Lag Gesture Engine**:
  - Eliminated the ~1 second drag freeze and abrupt jump during edge auto-scrolling by synchronizing indicator transform updates in the exact same `requestAnimationFrame` step as container scrolling.
  - Resolved mobile layout thrashing by caching tab geometry in memory during drag, avoiding `getBoundingClientRect` calls during `pointermove`.
  - Added gesture disambiguation to smoothly yield to native vertical page scrolling when `dy > dx`.
  - Shielded `ResizeObserver` from resetting active springs mid-drag.
- **Lyrics Engine Integrity**: Verified 15/15 regression unit tests pass with zero failures.

---

## [3.3.0] - 2026-11-13

### Added
- **Shared-Element Morphing Player**: Continuous visual transition when opening the playlist flyout, connecting the now-playing track art and title seamlessly with the player dock.
- **Tactile Volume Slider V2**: Dynamic accent gradient fill bar with interactive scrub state and enlarged thumb feedback.
- **Touch Hit-Target Expander**: Expanded seek bar touch interaction zone to 42px via `::before` pseudo-element without increasing visible track height.

### Fixed
- Tooltip timestamp clamping at 0% and 100% boundary positions on seek bar scrub.

---

## [3.2.0] - 2026-11-13

### Added
- **Liquid Navigation V2**: Continuous drag tracking with Miuix rubberband boundary resistance and edge auto-scrolling.
- **Waifu Adaptive Ambient Lighting**: Audio visualizer reactivity with dynamic disc halo pulse and reactive avatar aura.
- **ListPopup Spring Physics**: Spring-driven popup opening and closing transitions with state machine generation tracking.

---

## [3.1.0] - 2026-11-12

### Added
- **Miuix iOS-Like Liquid Glass Navigation**: Integrated floating liquid indicator underneath the `STUDIO AUDIO SUITE` header with stretch and squash deformation.
- **Overlay Trapping & Accessibility**: Escape key handling, backdrop dismiss, and focus trapping for modal dialogs.

---

## [3.0.0] - 2026-11-12

### Added
- **HyperOS Miuix Architecture**: Integration of analytical spring physics engine (`js/ui/spring.js`) and squircle border calculation (`js/ui/squircle.js`).
- **Modular Lyrics Engine V2**: Decoupled multi-file architecture with TTML/LRC parsers, continuous sweep animation, and line-level fallbacks.
- **Quality Tiers**: Automatic hardware profiling and manual selection between High (full GPU blur), Balanced (reduced blur), and Eco (solid contrast).

---

## [2.0.0] - 2026-11-04

### Added
- **8 Persona Roster**: Alya Kujou, Shiina Mahiru, Waguri Kaoruko, Sakura Miku, Shinobu Uzuki, Konohana Hinako, Asanagi Umi, and Nakano Miku.
- **Studio Audio Suite**: 31-track audio library with instant persona filtering and non-interrupting playback.
- **Dual Responsive Wallpapers**: Non-repeating random crossfade between desktop and mobile aspect ratio banners.
- **Zen Mode**: Distraction-free listening experience with auto-dimming dock controls and Screen Wake Lock API.
