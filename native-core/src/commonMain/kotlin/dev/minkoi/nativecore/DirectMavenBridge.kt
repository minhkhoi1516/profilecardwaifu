// =============================================================================
// MINKOI 5.6 · DIRECT MAVEN NATIVE LIBRARY BRIDGE
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
//    - SpringSpec.vectorize(Float.VectorConverter)
//
// Zero Skiko runtime calls — verified via WebAssembly.Module.imports == 0 Skiko
// and JS module reachability graph touchesSkiko == false.
// =============================================================================
package dev.minkoi.nativecore

import androidx.compose.animation.core.AnimationVector1D
import androidx.compose.animation.core.VectorConverter
import io.github.suqi8.coui.kmp.anim.COUIEaseEasing
import io.github.suqi8.coui.kmp.anim.COUIInEaseEasing
import io.github.suqi8.coui.kmp.anim.COUIMoveEaseEasing
import io.github.suqi8.coui.kmp.anim.COUIOutEaseEasing
import io.github.suqi8.coui.kmp.anim.COUISpringEasing
import io.github.suqi8.coui.kmp.anim.couiSpring
import io.github.suqi8.coui.kmp.utils.SinkFeedback
import top.yukonga.miuix.kmp.anim.folmeSpring
import kotlin.math.max

object DirectMavenBridge {
    private val defaultSinkFeedback = SinkFeedback()

    /** Direct call to Miuix `top.yukonga.miuix.kmp.anim.folmeSpring` stiffness derivation */
    fun miuixFolmeStiffness(damping: Double, response: Double): Double {
        val safeD = max(0.05, damping).toFloat()
        val safeR = max(0.05, response).toFloat()
        return folmeSpring<Float>(safeD, safeR).stiffness.toDouble()
    }

    /** Direct call to Miuix `folmeSpring` vectorized through Compose Animation Core */
    fun miuixFolmeStep(
        value: Double,
        target: Double,
        velocity: Double,
        dtSeconds: Double,
        damping: Double,
        response: Double,
        outPair: DoubleArray
    ) {
        val spec = folmeSpring<Float>(max(0.05, damping).toFloat(), max(0.05, response).toFloat())
        val vec = spec.vectorize(Float.VectorConverter)
        val dtNanos = (max(0.0, dtSeconds) * 1_000_000_000.0).toLong()
        val initV = AnimationVector1D(value.toFloat())
        val targetV = AnimationVector1D(target.toFloat())
        val velV = AnimationVector1D(velocity.toFloat())
        outPair[0] = vec.getValueFromNanos(dtNanos, initV, targetV, velV).value.toDouble()
        outPair[1] = vec.getVelocityFromNanos(dtNanos, initV, targetV, velV).value.toDouble()
    }

    /** Direct call to COUI `io.github.suqi8.coui.kmp.anim.COUISpringEasing.transform` */
    fun couiSpringEasingTransform(fraction: Double, response: Double, bounce: Double): Double {
        val safeR = if (response == 0.0) 1.0 else max(0.05, response)
        return COUISpringEasing(safeR.toFloat(), bounce.toFloat())
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
        val safeR = if (response == 0.0) 1.0 else max(0.05, response)
        return couiSpring<Float>(safeR.toFloat(), 0f).stiffness.toDouble()
    }

    fun couiDampingFromBounce(bounce: Double): Double {
        return couiSpring<Float>(0.35f, bounce.toFloat()).dampingRatio.toDouble()
    }

    /** Direct call to COUI `couiSpring` vectorized step */
    fun couiSpringStep(
        value: Double,
        target: Double,
        velocity: Double,
        dtSeconds: Double,
        response: Double,
        bounce: Double,
        outPair: DoubleArray
    ) {
        val safeR = if (response == 0.0) 1.0 else max(0.05, response)
        val spec = couiSpring<Float>(safeR.toFloat(), bounce.toFloat())
        val vec = spec.vectorize(Float.VectorConverter)
        val dtNanos = (max(0.0, dtSeconds) * 1_000_000_000.0).toLong()
        val initV = AnimationVector1D(value.toFloat())
        val targetV = AnimationVector1D(target.toFloat())
        val velV = AnimationVector1D(velocity.toFloat())
        outPair[0] = vec.getValueFromNanos(dtNanos, initV, targetV, velV).value.toDouble()
        outPair[1] = vec.getVelocityFromNanos(dtNanos, initV, targetV, velV).value.toDouble()
    }

    /** Direct read from COUI `SinkFeedback` default press sink scale (0.94) */
    fun couiDefaultSinkAmount(): Double = defaultSinkFeedback.sinkAmount.toDouble()
}
