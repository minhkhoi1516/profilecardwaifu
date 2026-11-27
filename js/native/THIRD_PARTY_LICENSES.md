# Third-Party Licenses & Integration Provenance — `native-core/` & `js/native/`

MINKOI 5.6 strictly distinguishes **direct Maven Central dependency integration** from **reference math adapters** and **incompatible Skiko/Android-only modules**. No Skiko runtime (`~8.64 MB` WASM) is bundled into production (`skikoImports == 0` verified by `native-core/sync-to-web.mjs`).

## A. Direct Maven Central Integrations (Compiled & Linked via Gradle)

### 1. Miuix (`top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01`)
- **Repository:** https://github.com/compose-miuix-ui/miuix
- **License:** Apache License 2.0 (`SPDX-License-Identifier: Apache-2.0`)
- **Copyright:** Copyright 2025–2026, compose-miuix-ui contributors
- **Direct APIs invoked:** `top.yukonga.miuix.kmp.anim.folmeSpring` (compiled into `DirectMavenBridge.kt` for `wasmJs` and `js`).
- **Modules NOT directly integrated (incompatible without Skiko Canvas):** `miuix-blur`, `miuix-glass`, `miuix-squircle` (`AlphaImageBitmap.skiko.kt`), `Modifier.overScroll*` / Compose UI widgets.

### 2. COUI (`io.github.suqi8.coui.kmp:coui-ui:2.1.0`)
- **Repository:** https://github.com/suqi8/coui
- **License:** Apache License 2.0 (`SPDX-License-Identifier: Apache-2.0`)
- **Copyright:** Copyright 2026, compose-coui-ui contributors
- **Direct APIs invoked:** `io.github.suqi8.coui.kmp.anim.COUISpringEasing`, `COUIEaseEasing`, `COUIInEaseEasing`, `COUIMoveEaseEasing`, `COUIOutEaseEasing`, `couiSpring`, `io.github.suqi8.coui.kmp.utils.SinkFeedback`.
- **Modules NOT directly integrated (incompatible without Skiko Canvas / Android sensors):** `coui-blur`, `coui-shader`, `COUIMaterialEffect`, `TiltLight`.

### 3. JetBrains Compose Multiplatform Animation Core & Kotlin Stdlib (Transitive)
- **Artifacts:** `org.jetbrains.compose.animation:animation-core:1.13.0-rc01`, `org.jetbrains.compose.ui:ui-unit`, `org.jetbrains.compose.ui:ui-geometry`, `org.jetbrains.compose.ui:ui-graphics`, `org.jetbrains.compose.ui:ui-util`, `androidx.collection:collection`, `org.jetbrains.kotlin:kotlin-stdlib:2.4.21`.
- **License:** Apache License 2.0 (`SPDX-License-Identifier: Apache-2.0`)
- **Copyright:** Copyright 2010–2026 JetBrains s.r.o. and The Android Open Source Project.

## B. Reference Math Adapters (NOT Direct Maven Calls — Upstream Internal/Private or Skiko-Only)

### 4. Miuix Internal Primitives (`SpringUtils.kt`, `PressFeedback.kt`)
- **Source:** `compose-miuix-ui/miuix` (`v0.9.5-rc01`, Apache-2.0).
- **Reason for adapter:** `SpringMath` is `internal object` and `pressFeedbackStrength` is `private fun` in `miuix-ui`, so they cannot be invoked externally via Gradle. Exact formulas are implemented in `ReferenceMathAdapters.kt`.

### 5. Backdrop / AndroidLiquidGlass (`Kyant0/AndroidLiquidGlass`, `v2.0.1`)
- **Repository:** https://github.com/Kyant0/AndroidLiquidGlass
- **License:** Apache License 2.0 (`SPDX-License-Identifier: Apache-2.0`)
- **Copyright:** Copyright 2025–2026, Kyant0
- **Reason NOT directly integrated:** `io.github.kyant0:backdrop:2.0.1` keeps all shaders (`Shaders.kt`) `internal` and renders exclusively via `org.jetbrains.skia.RuntimeEffect` (`SkikoRuntimeShader`) inside Compose UI `Modifier.drawBackdrop` on an isolated Skia WebGL canvas (cannot sample/refract HTML DOM elements and requires `~8.64 MB` Skiko WASM).
- **Adapter used:** Pure SDF/refraction/highlight math (`sdRoundedRect`, `gradSdRoundedRect`, `circleMap`, `backdropHighlightIntensity`, `backdropRefractionMagnitude`) adapted in `ReferenceMathAdapters.kt` + native CSS `backdrop-filter` / WebGL2 / WebGPU rendering.
