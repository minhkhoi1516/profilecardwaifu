# Contributing to MinKoi Studio

Thank you for your interest in contributing to MinKoi Studio. We welcome bug reports, feature suggestions, and code contributions that align with the project's design philosophy.

---

## 1. Code of Conduct & Philosophy

- **Zero Runtime Dependencies**: The core web runtime uses modern vanilla HTML5, CSS3, and JavaScript without external runtime frameworks, compilers, or bundlers.
- **Anime Aesthetic & Fluid Motion**: All visual additions should respect the design language (HyperOS Miuix spring physics, squircle geometry, and luminous anime glass aesthetics).
- **Deterministic Audio Sync**: The Lyrics Engine architecture (`js/lyrics/*`) requires strict verification. Never introduce artificial word timings or compromise the underlying audio clock.

---

## 2. Reporting Issues

When filing an issue, please provide:
1. **Clear description**: What went wrong and what was expected to happen.
2. **Environment details**: Browser version (Chrome, Safari, Edge, Firefox), operating system, and device type (desktop vs mobile).
3. **Reproduction steps**: Step-by-step instructions to trigger the behavior.
4. **Console output**: Any JavaScript errors or network failures from Developer Tools (F12).

---

## 3. Local Development & Testing

MinKoi Studio requires no installation step or node build process:

1. **Serve locally** using any static HTTP server:
   ```bash
   # Python
   python -m http.server 8080

   # Node (npx)
   npx serve .
   ```
2. **Run asset integrity checks**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/qa/verify-assets.ps1
   ```
3. **Run automated lyrics engine regression tests**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/qa/verify-lyrics.ps1
   ```
   Or open `http://localhost:8080/tests/lyrics-v2.test.html` directly in your browser. All 15 unit tests must pass before submitting code.

---

## 4. Coding Conventions

- **JavaScript**: Modern ES2022+, strictly scoped within IIFE modules or pure helper functions.
- **CSS**: Use semantic CSS custom properties defined in `css/tokens-v3.css` and `css/style-base.css`.
- **Assets**: New persona illustrations or audio files must be documented in `js/config.js` and conform to naming conventions.

---

## 5. Pull Request Workflow

1. Fork the repository and create your feature branch: `git checkout -b feature/my-feature`.
2. Commit your changes using conventional commit messages (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
3. Verify that all automated tests pass with 0 console errors.
4. Open a Pull Request with a concise summary of changes and visual screenshots if altering UI components.
