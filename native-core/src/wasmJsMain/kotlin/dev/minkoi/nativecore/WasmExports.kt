@file:OptIn(kotlin.js.ExperimentalJsExport::class)

package dev.minkoi.nativecore

import kotlin.js.JsExport

private val scratchPair = DoubleArray(2)

@JsExport
fun minkoiNativeVersion(): String = "5.6.1-kotlin-wasm-direct-maven"

@JsExport
fun minkoiNativeManifestJson(): String =
    """{"version":"5.6.1","target":"wasmJs","directMaven":["top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01","io.github.suqi8.coui.kmp:coui-ui:2.1.0","org.jetbrains.compose.animation:animation-core:1.13.0-rc01"],"referenceAdapters":["Miuix SpringMath (internal)","Miuix PressFeedback (private)","Backdrop Shaders.kt (internal SkSL -> SDF)"],"incompatibleDirect":["miuix-blur/miuix-glass (Skiko)","coui-blur/coui-shader (Skiko)","io.github.kyant0:backdrop:2.0.1 (Skiko)"]}"""

// --- DIRECT MAVEN LIBRARY EXPORTS (Miuix 0.9.5-rc01 & COUI 2.1.0) ---

@JsExport
fun miuixFolmeStiffness(damping: Double, response: Double): Double =
    DirectMavenBridge.miuixFolmeStiffness(damping, response)

@JsExport
fun miuixFolmeStepValue(
    value: Double,
    target: Double,
    velocity: Double,
    dt: Double,
    damping: Double,
    response: Double
): Double {
    DirectMavenBridge.miuixFolmeStep(value, target, velocity, dt, damping, response, scratchPair)
    return scratchPair[0]
}

@JsExport
fun couiSpringEasing(fraction: Double, response: Double, bounce: Double): Double =
    DirectMavenBridge.couiSpringEasingTransform(fraction, response, bounce)

@JsExport
fun couiBezierEasing(kind: Int, fraction: Double): Double =
    DirectMavenBridge.couiBezierTransform(kind, fraction)

@JsExport
fun couiStiffnessFromResponse(response: Double): Double =
    DirectMavenBridge.couiStiffnessFromResponse(response)

@JsExport
fun couiDampingFromBounce(bounce: Double): Double =
    DirectMavenBridge.couiDampingFromBounce(bounce)

@JsExport
fun couiSpringStepValue(
    value: Double,
    target: Double,
    velocity: Double,
    dt: Double,
    response: Double,
    bounce: Double
): Double {
    DirectMavenBridge.couiSpringStep(value, target, velocity, dt, response, bounce, scratchPair)
    return scratchPair[0]
}

@JsExport
fun couiDefaultSinkAmount(): Double = DirectMavenBridge.couiDefaultSinkAmount()

// --- REFERENCE MATH ADAPTER EXPORTS (explicitly documented non-direct) ---

@JsExport
fun miuixObtainDampingDistance(inputDistance: Double, range: Double): Double =
    ReferenceMathAdapters.miuixObtainDampingDistance(inputDistance, range)

@JsExport
fun miuixObtainTouchDistance(currentPixelOffset: Double, range: Double): Double =
    ReferenceMathAdapters.miuixObtainTouchDistance(currentPixelOffset, range)

@JsExport
fun miuixPressStrength(widthPx: Double, heightPx: Double, density: Double): Double =
    ReferenceMathAdapters.miuixPressStrength(widthPx, heightPx, density)

@JsExport
fun springStepValue(
    value: Double,
    target: Double,
    velocity: Double,
    dt: Double,
    dampingRatio: Double,
    stiffness: Double,
    mass: Double
): Double {
    ReferenceMathAdapters.stepClosedFormSpring(value, target, velocity, dt, dampingRatio, stiffness, mass, scratchPair)
    return scratchPair[0]
}

@JsExport
fun springStepLastVelocity(): Double = scratchPair[1]

@JsExport
fun backdropHighlightIntensity(
    coordX: Double,
    coordY: Double,
    width: Double,
    height: Double,
    radius: Double,
    angleRad: Double,
    falloff: Double
): Double = ReferenceMathAdapters.backdropHighlightIntensity(coordX, coordY, width, height, radius, angleRad, falloff)

@JsExport
fun backdropRefractionMagnitude(
    coordX: Double,
    coordY: Double,
    width: Double,
    height: Double,
    radius: Double,
    refractionHeight: Double,
    refractionAmount: Double
): Double = ReferenceMathAdapters.backdropRefractionMagnitude(
    coordX, coordY, width, height, radius, refractionHeight, refractionAmount
)

fun main() {}
