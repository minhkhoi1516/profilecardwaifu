package dev.minkoi.nativecore

import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.assertTrue

class NativeFusionCoreTest {
    @Test
    fun directMiuixFolmeSpringIntegration() {
        val k = DirectMavenBridge.miuixFolmeStiffness(0.85, 0.35)
        assertTrue(k > 300.0 && k < 330.0, "Expected Miuix folme stiffness ~322, got $k")
        val out = DoubleArray(2)
        DirectMavenBridge.miuixFolmeStep(0.0, 1.0, 0.0, 0.016, 0.85, 0.35, out)
        assertTrue(out[0] > 0.02 && out[0] < 0.2, "Expected Miuix folme step in (0.02,0.2), got ${out[0]}")
        assertTrue(out[1] > 1.0, "Expected positive velocity from Miuix folmeSpring, got ${out[1]}")
    }

    @Test
    fun directCouiEasingAndSinkFeedbackIntegration() {
        val start = DirectMavenBridge.couiSpringEasingTransform(0.0, 0.35, 0.0)
        val mid = DirectMavenBridge.couiSpringEasingTransform(0.5, 0.35, 0.2)
        val end = DirectMavenBridge.couiSpringEasingTransform(1.0, 0.35, 0.2)
        assertTrue(abs(start) < 1e-5)
        assertTrue(mid > 0.5 && mid < 1.25)
        assertTrue(abs(end - 1.0) < 1e-4)
        val ease = DirectMavenBridge.couiBezierTransform(0, 0.5)
        assertTrue(abs(ease - 0.5) < 0.02, "Expected COUIEaseEasing(0.5) ~0.5, got $ease")
        val sink = DirectMavenBridge.couiDefaultSinkAmount()
        assertTrue(abs(sink - 0.94) < 0.001, "Expected COUI SinkFeedback default 0.94, got $sink")
    }

    @Test
    fun referenceAdaptersRoundTripAndOpticalMath() {
        val damped = ReferenceMathAdapters.miuixObtainDampingDistance(50.0, 100.0)
        assertTrue(abs(damped - 29.1667) < 0.01, "Expected ~29.17, got $damped")
        val restored = ReferenceMathAdapters.miuixObtainTouchDistance(damped, 100.0)
        assertTrue(abs(restored - 50.0) < 0.05, "Expected round-trip ~50.0, got $restored")
        val smallBtnStrength = ReferenceMathAdapters.miuixPressStrength(80.0, 40.0, 1.0)
        val largeCardStrength = ReferenceMathAdapters.miuixPressStrength(480.0, 320.0, 1.0)
        assertTrue(abs(smallBtnStrength - 1.0) < 1e-6, "Small <=160dp press strength should be 1.0")
        assertTrue(abs(largeCardStrength - 0.5) < 1e-6, "480dp press strength should be 2/(1+3)=0.5")

        val edgeRefraction = ReferenceMathAdapters.backdropRefractionMagnitude(2.0, 22.0, 420.0, 44.0, 22.0, 14.0, 8.0)
        val centerRefraction = ReferenceMathAdapters.backdropRefractionMagnitude(210.0, 22.0, 420.0, 44.0, 22.0, 14.0, 8.0)
        assertTrue(edgeRefraction > 0.0)
        assertTrue(centerRefraction == 0.0)
        val hi = ReferenceMathAdapters.backdropHighlightIntensity(210.0, 0.0, 420.0, 44.0, 22.0, -1.5708, 1.5)
        assertTrue(hi > 0.8)
    }
}
