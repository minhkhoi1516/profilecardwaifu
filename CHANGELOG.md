# Changelog

All notable changes to the **MinKoi Studio** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
