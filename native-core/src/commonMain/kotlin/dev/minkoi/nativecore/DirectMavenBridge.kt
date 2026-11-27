// =============================================================================
// MINKOI 5.6 · DIRECT MAVEN NATIVE LIBRARY BRIDGE (Zero-Allocation Cached)
//
// Directly invokes official Maven Central KMP artifacts (NO formula clones):
// 1. top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01 (Apache-2.0)
//    - top.yukonga.miuix.kmp.anim.folmeSpring
// 2. io.github.suqi8.coui.kmp:coui-ui:2.1.0 (Apache-2.0)
//    - io.github.suqi8.coui.kmp.anim.COUISpringEasing
//    - io.github.suqi8.coui.kmp.anim.COUIEaseEasing / In / Move / Out
//    - io.github.suqi8.coui.kmp.anim.couiSpring
//    - io.github.suqi8.coui.kmp.utils.SinkFeedback
// 3. org.jetbrains.compose.animation:animation-core (transitive, Apache-2.0)
//    - FloatSpringSpec (zero-allocation scalar spring evaluation)
//
// Performance hardening (MINKOI 5.6):
// - Caches FloatSpringSpec instances per preset (bounded at 64 entries) and
//   COUISpringEasing instances (bounded at 64 entries) to eliminate per-frame
//   allocation churn when real Maven springs drive live UI transitions.
// - Zero Skiko runtime calls — verified via WebAssembly.Module.imports == 0
//   Skiko and JS module reachability graph touchesSkiko == false.
// =============================================================================
package dev.minkoi.nativecore

import androidx.compose.animation.core.FloatSpringSpec
import io.github.suqi8.coui.kmp.anim.COUIEaseEasing
import io.github.suqi8.coui.kmp.anim.COUIInEaseEasing
import io.github.suqi8.coui.kmp.anim.COUIMoveEaseEasing
import io.github.suqi8.coui.kmp.anim.COUIOutEaseEasing
import io.github.suqi8.coui.kmp.anim.COUISpringEasing
import io.github.suqi8.coui.kmp.anim.couiSpring
import io.github.suqi8.coui.kmp.utils.SinkFeedback
import top.yukonga.miuix.kmp.anim.folmeSpring
import kotlin.math.max
import kotlin.math.roundToInt

object DirectMavenBridge {
    private val defaultSinkFeedback = SinkFeedback()

    // Bounded caches for official Maven specs & easings (zero per-frame allocations!)
    private const val MAX_CACHE_SIZE = 64
    private val folmeSpecCache = HashMap<Int, FloatSpringSpec>(32)
    private val couiSpecCache = HashMap<Int, FloatSpringSpec>(32)
    private val couiEaseCache = HashMap<Int, COUISpringEasing>(16)

    private fun packPairKey(a: Float, b: Float): Int {
        val qa = (a * 1000f).roundToInt() and 0xFFFF
        val qb = ((b + 2f) * 1000f).roundToInt() and 0xFFFF
        return (qa shl 16) or qb
    }

    private fun getFolmeFloatSpec(damping: Float, response: Float): FloatSpringSpec {
        val key = packPairKey(damping, response)
        folmeSpecCache[key]?.let { return it }
        if (folmeSpecCache.size >= MAX_CACHE_SIZE) folmeSpecCache.clear()
        val springSpec = folmeSpring<Float>(damping, response)
        val floatSpec = FloatSpringSpec(springSpec.dampingRatio, springSpec.stiffness)
        folmeSpecCache[key] = floatSpec
        return floatSpec
    }

    private fun getCouiFloatSpec(response: Float, bounce: Float): FloatSpringSpec {
        val key = packPairKey(response, bounce)
        couiSpecCache[key]?.let { return it }
        if (couiSpecCache.size >= MAX_CACHE_SIZE) couiSpecCache.clear()
        val springSpec = couiSpring<Float>(response, bounce)
        val floatSpec = FloatSpringSpec(springSpec.dampingRatio, springSpec.stiffness)
        couiSpecCache[key] = floatSpec
        return floatSpec
    }

    private fun getCouiSpringEasing(response: Float, bounce: Float): COUISpringEasing {
        val key = packPairKey(response, bounce)
        couiEaseCache[key]?.let { return it }
        if (couiEaseCache.size >= MAX_CACHE_SIZE) couiEaseCache.clear()
        val easing = COUISpringEasing(response, bounce)
        couiEaseCache[key] = easing
        return easing
    }

    /** Direct call to Miuix `top.yukonga.miuix.kmp.anim.folmeSpring` stiffness derivation */
    fun miuixFolmeStiffness(damping: Double, response: Double): Double {
        val safeD = max(0.05, damping).toFloat()
        val safeR = max(0.05, response).toFloat()
        return getFolmeFloatSpec(safeD, safeR).stiffness.toDouble()
    }

    /** Zero-allocation cached direct call to Miuix `folmeSpring` via Compose `FloatSpringSpec` */
    fun miuixFolmeStep(
        value: Double,
        target: Double,
        velocity: Double,
        dtSeconds: Double,
        damping: Double,
        response: Double,
        outPair: DoubleArray
    ) {
        val safeD = max(0.05, damping).toFloat()
        val safeR = max(0.05, response).toFloat()
        val spec = getFolmeFloatSpec(safeD, safeR)
        val dtNanos = (max(0.0, dtSeconds) * 1_000_000_000.0).toLong()
        val v0 = value.toFloat()
        val vt = target.toFloat()
        val vel0 = velocity.toFloat()
        outPair[0] = spec.getValueFromNanos(dtNanos, v0, vt, vel0).toDouble()
        outPair[1] = spec.getVelocityFromNanos(dtNanos, v0, vt, vel0).toDouble()
    }

    /** Cached direct call to COUI `io.github.suqi8.coui.kmp.anim.COUISpringEasing.transform` */
    fun couiSpringEasingTransform(fraction: Double, response: Double, bounce: Double): Double {
        val safeR = (if (response == 0.0) 1.0 else max(0.05, response)).toFloat()
        val safeB = bounce.toFloat()
        return getCouiSpringEasing(safeR, safeB)
            .transform(max(0.0, fraction).toFloat())
            .toDouble()
    }

    /** Direct call to COUI Bezier interpolators (0=Ease, 1=InEase, 2=MoveEase, 3=OutEase) */
    fun couiBezierTransform(kind: Int, fraction: Double): Double {
        val f = max(0.0, fraction).coerceAtMost(1.0).toFloat()
        val easing = when (kind) {
            1 -> COUIInEaseEasing
            2 -> COUIMoveEaseEasing
            3 -> COUIOutEaseEasing
            else -> COUIEaseEasing
        }
        return easing.transform(f).toDouble()
    }

    /** Direct call to COUI `couiSpring` parameters */
    fun couiStiffnessFromResponse(response: Double): Double {
        val safeR = (if (response == 0.0) 1.0 else max(0.05, response)).toFloat()
        return getCouiFloatSpec(safeR, 0f).stiffness.toDouble()
    }

    fun couiDampingFromBounce(bounce: Double): Double {
        return getCouiFloatSpec(0.35f, bounce.toFloat()).dampingRatio.toDouble()
    }

    /** Zero-allocation cached direct call to COUI `couiSpring` via Compose `FloatSpringSpec` */
    fun couiSpringStep(
        value: Double,
        target: Double,
        velocity: Double,
        dtSeconds: Double,
        response: Double,
        bounce: Double,
        outPair: DoubleArray
    ) {
        val safeR = (if (response == 0.0) 1.0 else max(0.05, response)).toFloat()
        val safeB = bounce.toFloat()
        val spec = getCouiFloatSpec(safeR, safeB)
        val dtNanos = (max(0.0, dtSeconds) * 1_000_000_000.0).toLong()
        val v0 = value.toFloat()
        val vt = target.toFloat()
        val vel0 = velocity.toFloat()
        outPair[0] = spec.getValueFromNanos(dtNanos, v0, vt, vel0).toDouble()
        outPair[1] = spec.getVelocityFromNanos(dtNanos, v0, vt, vel0).toDouble()
    }

    /** Direct read from COUI `SinkFeedback` default press sink scale (0.94) */
    fun couiDefaultSinkAmount(): Double = defaultSinkFeedback.sinkAmount.toDouble()
}
