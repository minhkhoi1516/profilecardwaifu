// =============================================================================
// MINKOI 5.6 · REFERENCE MATH ADAPTERS (Explicitly NOT Direct Maven Calls)
//
// These primitives are adapted from upstream Apache-2.0 source files where the
// upstream symbols are `internal`/`private` or tightly bound to Skiko/Compose UI:
// 1. Miuix `SpringUtils.kt` (`internal object SpringMath`: obtainDampingDistance,
//    obtainTouchDistance) & `PressFeedback.kt` (`private fun pressFeedbackStrength`)
//    — https://github.com/compose-miuix-ui/miuix (v0.9.5-rc01, Apache-2.0)
// 2. Backdrop `Shaders.kt` (`internal val` SkSL SDF refraction & highlight math)
//    — https://github.com/Kyant0/AndroidLiquidGlass (v2.0.1, Apache-2.0)
//    Direct Maven integration of `io.github.kyant0:backdrop:2.0.1` rendering requires
//    Compose UI + Skiko RuntimeEffect (`~8.64 MB` WASM) on an isolated canvas.
// 3. Closed-form arbitrary (dampingRatio, stiffness, mass) spring integrator for
//    legacy custom presets not defined via (damping, response).
// =============================================================================
package dev.minkoi.nativecore

import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.cosh
import kotlin.math.exp
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sign
import kotlin.math.sin
import kotlin.math.sinh
import kotlin.math.sqrt

object ReferenceMathAdapters {
    // 1. Miuix internal SpringMath rubber-band damping (SpringUtils.kt)
    fun miuixObtainDampingDistance(inputDistance: Double, range: Double): Double {
        if (range <= 0.0 || inputDistance == 0.0) return 0.0
        val dir = sign(inputDistance)
        val x = max(0.0, min(abs(inputDistance) / range, 1.0))
        val dampedFactor = x - (x * x) + ((x * x * x) / 3.0)
        return dir * dampedFactor * range
    }

    fun miuixObtainTouchDistance(currentPixelOffset: Double, range: Double): Double {
        if (range <= 0.0) return 0.0
        var absPixelOffset = abs(currentPixelOffset)
        val absMaxOffset = abs(miuixObtainDampingDistance(range, range))
        if (absPixelOffset <= 0.0) return 0.0
        if (absPixelOffset >= absMaxOffset) absPixelOffset = absMaxOffset
        val base = range - (3.0 * absPixelOffset)
        val part2 = range.pow(2.0 / 3.0) * sign(base) * abs(base).pow(1.0 / 3.0)
        return sign(currentPixelOffset) * (range - part2)
    }

    // 2. Miuix private PressFeedback.kt exact formula:
    //    sizeRatio = max(1, max(wDp, hDp) / 160), strength = 2 / (1 + sizeRatio)
    fun miuixPressStrength(widthPx: Double, heightPx: Double, density: Double): Double {
        val safeDensity = max(1.0, density)
        val maxSideDp = max(widthPx, heightPx) / safeDensity
        val sizeRatio = max(1.0, maxSideDp / 160.0)
        return 2.0 / (1.0 + sizeRatio)
    }

    // 3. Closed-form damped spring step for arbitrary (dampingRatio, stiffness, mass)
    fun stepClosedFormSpring(
        value: Double,
        target: Double,
        velocity: Double,
        dt: Double,
        dampingRatio: Double,
        stiffness: Double,
        mass: Double,
        outPair: DoubleArray
    ) {
        val omega = sqrt(stiffness / max(0.001, mass))
        val zeta = max(0.05, dampingRatio)
        val x = value - target
        val v = velocity
        val nextX: Double
        val nextV: Double
        when {
            abs(zeta - 1.0) < 1e-5 -> {
                val b = v + omega * x
                val decay = exp(-omega * dt)
                nextX = (x + b * dt) * decay
                nextV = (v - omega * b * dt) * decay
            }
            zeta < 1.0 -> {
                val alpha = zeta * omega
                val wd = omega * sqrt(1.0 - zeta * zeta)
                val b = (v + alpha * x) / wd
                val c = cos(wd * dt)
                val s = sin(wd * dt)
                val decay = exp(-alpha * dt)
                nextX = decay * (x * c + b * s)
                nextV = decay * (v * c - (alpha * b + wd * x) * s)
            }
            else -> {
                val root = sqrt(zeta * zeta - 1.0)
                val r1 = -omega / (zeta + root)
                val r2 = -omega * (zeta + root)
                val a = (v - r2 * x) / (r1 - r2)
                val b = x - a
                val e1 = exp(r1 * dt)
                val e2 = exp(r2 * dt)
                nextX = a * e1 + b * e2
                nextV = r1 * a * e1 + r2 * b * e2
            }
        }
        outPair[0] = target + nextX
        outPair[1] = nextV
    }

    // 4. Backdrop internal Shaders.kt optical SDF math (reference adapter for CSS/WebGL)
    fun sdRoundedRect(cx: Double, cy: Double, halfW: Double, halfH: Double, radius: Double): Double {
        val r = min(radius, min(halfW, halfH))
        val qx = abs(cx) - (halfW - r)
        val qy = abs(cy) - (halfH - r)
        val outside = hypot(max(qx, 0.0), max(qy, 0.0))
        val inside = min(max(qx, qy), 0.0)
        return outside + inside - r
    }

    fun gradSdRoundedRect(cx: Double, cy: Double, halfW: Double, halfH: Double, radius: Double, outGrad: DoubleArray) {
        val r = min(radius, min(halfW, halfH))
        val cornerX = abs(cx) - (halfW - r)
        val cornerY = abs(cy) - (halfH - r)
        val sx = if (cx >= 0.0) 1.0 else -1.0
        val sy = if (cy >= 0.0) 1.0 else -1.0
        if (cornerX >= 0.0 || cornerY >= 0.0) {
            val len = hypot(max(cornerX, 0.0), max(cornerY, 0.0))
            if (len > 1e-6) {
                outGrad[0] = sx * (max(cornerX, 0.0) / len)
                outGrad[1] = sy * (max(cornerY, 0.0) / len)
            } else {
                outGrad[0] = 0.0
                outGrad[1] = 0.0
            }
        } else {
            val gradX = if (cornerX >= cornerY) 1.0 else 0.0
            outGrad[0] = sx * gradX
            outGrad[1] = sy * (1.0 - gradX)
        }
    }

    fun circleMap(x: Double): Double {
        val clamped = max(0.0, min(1.0, x))
        return 1.0 - sqrt(max(0.0, 1.0 - clamped * clamped))
    }

    fun backdropHighlightIntensity(
        coordX: Double,
        coordY: Double,
        width: Double,
        height: Double,
        radius: Double,
        angleRad: Double,
        falloff: Double
    ): Double {
        val halfW = width * 0.5
        val halfH = height * 0.5
        val cx = coordX - halfW
        val cy = coordY - halfH
        val gradRadius = min(radius * 1.5, min(halfW, halfH))
        val grad = DoubleArray(2)
        gradSdRoundedRect(cx, cy, halfW, halfH, gradRadius, grad)
        val d = grad[0] * cos(angleRad) + grad[1] * sin(angleRad)
        return abs(d).pow(max(0.1, falloff))
    }

    fun backdropRefractionMagnitude(
        coordX: Double,
        coordY: Double,
        width: Double,
        height: Double,
        radius: Double,
        refractionHeight: Double,
        refractionAmount: Double
    ): Double {
        if (refractionHeight <= 0.0) return 0.0
        val halfW = width * 0.5
        val halfH = height * 0.5
        val sd = sdRoundedRect(coordX - halfW, coordY - halfH, halfW, halfH, radius)
        if (-sd >= refractionHeight) return 0.0
        val clampedSd = min(sd, 0.0)
        return circleMap(1.0 - (-clampedSd / refractionHeight)) * refractionAmount
    }
}
