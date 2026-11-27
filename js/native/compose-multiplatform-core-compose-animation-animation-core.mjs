import {
  VOID3gxj6tk5isa35 as VOID,
  equals2au1ep9vhcato as equals,
  protoOf180f3jzyo7rfj as protoOf,
  hashCodeq5arwsb9dgti as hashCode,
  getNumberHashCode2l4nbdcihl25f as getNumberHashCode,
  initMetadataForClassbxx6q50dy2s7 as initMetadataForClass,
  IllegalArgumentException_init_$Create$1gox8sdqs91jy as IllegalArgumentException_init_$Create$,
  isNaN3ixot6a1mjs5h as isNaN_0,
  Unit_instance3kz1zqli6gr1r as Unit_instance,
  shiftRight2cr6y79ufiihy as shiftRight,
  convertToIntofdoxh9bstof as convertToInt,
  FloatCompanionObject_instanceokgc3apyetrg as FloatCompanionObject_instance,
  floatFromBits1n9d03e2m5i5s as floatFromBits,
  Long2qws0ah9gnpki as Long,
  bitwiseAnd2g7wmsfd45l12 as bitwiseAnd,
  divide3tol6kxdi8xn6 as divide,
  toNumberlmbpvqo27r53 as toNumber,
  toRawBits2035dtuolth0v as toRawBits,
  fromInt1lka3ktyu79a4 as fromInt,
  shiftLeft1ck77p6vapyra as shiftLeft,
  bitwiseOr1ita6dahwp8zb as bitwiseOr,
} from './kotlin-kotlin-stdlib.mjs';
import {
  computeCubicVerticalBoundse106b82in60d as computeCubicVerticalBounds,
  findFirstCubicRoottq5suyhwnejp as findFirstCubicRoot,
  evaluateCubiczqswofrromdd as evaluateCubic,
} from './compose-multiplatform-core-compose-ui-ui-graphics.mjs';
import { _FloatFloatPair___get_packedValue__impl__5lczxp31q07450qshb0 as _FloatFloatPair___get_packedValue__impl__5lczxp } from './androidx-collection-collection.mjs';
//region block: imports
var imul = Math.imul;
//endregion
//region block: pre-declaration
initMetadataForClass(SpringSpec, 'SpringSpec', SpringSpec);
initMetadataForClass(CubicBezierEasing, 'CubicBezierEasing');
initMetadataForClass(FloatSpringSpec, 'FloatSpringSpec', FloatSpringSpec);
initMetadataForClass(SpringSimulation, 'SpringSimulation');
//endregion
var androidx_compose_animation_core_TargetBasedAnimation$stable;
var androidx_compose_animation_core_DecayAnimation$stable;
var androidx_compose_animation_core_AnimationConstants$stable;
var androidx_compose_animation_core_TweenSpec$stable;
var androidx_compose_animation_core_SpringSpec$stable;
var androidx_compose_animation_core_ArcAnimationSpec$stable;
var androidx_compose_animation_core_RepeatableSpec$stable;
var androidx_compose_animation_core_InfiniteRepeatableSpec$stable;
var androidx_compose_animation_core_SnapSpec$stable;
var androidx_compose_animation_core_KeyframesSpecBaseConfig$stable;
var androidx_compose_animation_core_KeyframeBaseEntity$stable;
var androidx_compose_animation_core_KeyframesSpec_KeyframesSpecConfig$stable;
var androidx_compose_animation_core_KeyframesSpec_KeyframeEntity$stable;
var androidx_compose_animation_core_KeyframesSpec$stable;
var androidx_compose_animation_core_KeyframesWithSplineSpec_KeyframesWithSplineSpecConfig$stable;
var androidx_compose_animation_core_KeyframesWithSplineSpec$stable;
function SpringSpec(dampingRatio, stiffness, visibilityThreshold) {
  dampingRatio = dampingRatio === VOID ? 1.0 : dampingRatio;
  stiffness = stiffness === VOID ? 1500.0 : stiffness;
  visibilityThreshold = visibilityThreshold === VOID ? null : visibilityThreshold;
  this.r3_1 = dampingRatio;
  this.s3_1 = stiffness;
  this.t3_1 = visibilityThreshold;
}
protoOf(SpringSpec).equals = function (other) {
  var tmp;
  if (other instanceof SpringSpec) {
    tmp = (other.r3_1 === this.r3_1 && other.s3_1 === this.s3_1 && equals(other.t3_1, this.t3_1));
  } else {
    tmp = false;
  }
  return tmp;
};
protoOf(SpringSpec).hashCode = function () {
  // Inline function 'kotlin.hashCode' call
  var tmp0_safe_receiver = this.t3_1;
  var tmp1_elvis_lhs = tmp0_safe_receiver == null ? null : hashCode(tmp0_safe_receiver);
  var tmp$ret$0 = tmp1_elvis_lhs == null ? 0 : tmp1_elvis_lhs;
  return imul(imul(tmp$ret$0, 31) + getNumberHashCode(this.r3_1) | 0, 31) + getNumberHashCode(this.s3_1) | 0;
};
function spring(dampingRatio, stiffness, visibilityThreshold) {
  dampingRatio = dampingRatio === VOID ? 1.0 : dampingRatio;
  stiffness = stiffness === VOID ? 1500.0 : stiffness;
  visibilityThreshold = visibilityThreshold === VOID ? null : visibilityThreshold;
  return new SpringSpec(dampingRatio, stiffness, visibilityThreshold);
}
var androidx_compose_animation_core_AnimationState$stable;
var androidx_compose_animation_core_AnimationScope$stable;
var androidx_compose_animation_core_AnimationVector$stable;
var androidx_compose_animation_core_AnimationVector1D$stable;
var androidx_compose_animation_core_AnimationVector2D$stable;
var androidx_compose_animation_core_AnimationVector3D$stable;
var androidx_compose_animation_core_AnimationVector4D$stable;
var androidx_compose_animation_core_DeferredTargetAnimation$stable;
function throwNoSolution($this, fraction) {
  throw IllegalArgumentException_init_$Create$('The cubic curve with parameters (' + $this.u3_1 + ', ' + $this.v3_1 + ', ' + $this.w3_1 + ', ' + $this.x3_1 + ') has no solution at ' + fraction);
}
function CubicBezierEasing(a, b, c, d) {
  this.u3_1 = a;
  this.v3_1 = b;
  this.w3_1 = c;
  this.x3_1 = d;
  // Inline function 'androidx.compose.animation.core.requirePrecondition' call
  if (!(!isNaN_0(this.u3_1) && !isNaN_0(this.v3_1) && !isNaN_0(this.w3_1) && !isNaN_0(this.x3_1))) {
    var tmp$ret$1 = 'Parameters to CubicBezierEasing cannot be NaN. Actual parameters are: ' + this.u3_1 + ', ' + this.v3_1 + ', ' + this.w3_1 + ', ' + this.x3_1 + '.';
    throwIllegalArgumentException(tmp$ret$1);
  }
  var roots = new Float32Array(5);
  var extrema = computeCubicVerticalBounds(0.0, this.v3_1, this.x3_1, 1.0, roots, 0);
  var tmp = this;
  // Inline function 'androidx.collection.FloatFloatPair.first' call
  // Inline function 'androidx.collection.internal.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(_FloatFloatPair___get_packedValue__impl__5lczxp(extrema), 32));
  tmp.y3_1 = floatFromBits(bits);
  var tmp_0 = this;
  // Inline function 'androidx.collection.FloatFloatPair.second' call
  // Inline function 'androidx.collection.internal.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits_0 = convertToInt(bitwiseAnd(_FloatFloatPair___get_packedValue__impl__5lczxp(extrema), new Long(-1, 0)));
  tmp_0.z3_1 = floatFromBits(bits_0);
}
protoOf(CubicBezierEasing).a4 = function (fraction) {
  var tmp;
  if (fraction > 0.0 && fraction < 1.0) {
    // Inline function 'kotlin.math.max' call
    var b = 1.1920929E-7;
    var f = Math.max(fraction, b);
    var t = findFirstCubicRoot(0.0 - f, this.u3_1 - f, this.w3_1 - f, 1.0 - f);
    if (isNaN_0(t)) {
      throwNoSolution(this, fraction);
    }
    var tmp0 = evaluateCubic(this.v3_1, this.x3_1, t);
    var tmp2 = this.y3_1;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    var maximumValue = this.z3_1;
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_0 = tmp0 < tmp2 ? tmp2 : tmp0;
    tmp = this_0 > maximumValue ? maximumValue : this_0;
  } else {
    tmp = fraction;
  }
  return tmp;
};
protoOf(CubicBezierEasing).equals = function (other) {
  var tmp;
  var tmp_0;
  var tmp_1;
  var tmp_2;
  if (other instanceof CubicBezierEasing) {
    tmp_2 = this.u3_1 === other.u3_1;
  } else {
    tmp_2 = false;
  }
  if (tmp_2) {
    tmp_1 = this.v3_1 === other.v3_1;
  } else {
    tmp_1 = false;
  }
  if (tmp_1) {
    tmp_0 = this.w3_1 === other.w3_1;
  } else {
    tmp_0 = false;
  }
  if (tmp_0) {
    tmp = this.x3_1 === other.x3_1;
  } else {
    tmp = false;
  }
  return tmp;
};
protoOf(CubicBezierEasing).hashCode = function () {
  return imul(imul(imul(getNumberHashCode(this.u3_1), 31) + getNumberHashCode(this.v3_1) | 0, 31) + getNumberHashCode(this.w3_1) | 0, 31) + getNumberHashCode(this.x3_1) | 0;
};
protoOf(CubicBezierEasing).toString = function () {
  return 'CubicBezierEasing(a=' + this.u3_1 + ', b=' + this.v3_1 + ', c=' + this.w3_1 + ', d=' + this.x3_1 + ')';
};
var androidx_compose_animation_core_FloatSpringSpec$stable;
var androidx_compose_animation_core_FloatTweenSpec$stable;
function FloatSpringSpec(dampingRatio, stiffness, visibilityThreshold) {
  dampingRatio = dampingRatio === VOID ? 1.0 : dampingRatio;
  stiffness = stiffness === VOID ? 1500.0 : stiffness;
  visibilityThreshold = visibilityThreshold === VOID ? 0.01 : visibilityThreshold;
  this.b4_1 = dampingRatio;
  this.c4_1 = stiffness;
  this.d4_1 = visibilityThreshold;
  var tmp = this;
  // Inline function 'kotlin.also' call
  var this_0 = new SpringSimulation(1.0);
  this_0.i4(this.b4_1);
  this_0.j4(this.c4_1);
  tmp.e4_1 = this_0;
}
protoOf(FloatSpringSpec).k4 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  var playTimeMillis = divide(playTimeNanos, new Long(1000000, 0));
  this.e4_1.f4_1 = targetValue;
  // Inline function 'androidx.compose.animation.core.Motion.value' call
  var this_0 = this.e4_1.l4(initialValue, initialVelocity, playTimeMillis);
  // Inline function 'androidx.compose.ui.util.unpackFloat1' call
  var value = _Motion___get_packedValue__impl__qymh4n(this_0);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(value, 32));
  return floatFromBits(bits);
};
protoOf(FloatSpringSpec).m4 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  var playTimeMillis = divide(playTimeNanos, new Long(1000000, 0));
  this.e4_1.f4_1 = targetValue;
  // Inline function 'androidx.compose.animation.core.Motion.velocity' call
  var this_0 = this.e4_1.l4(initialValue, initialVelocity, playTimeMillis);
  // Inline function 'androidx.compose.ui.util.unpackFloat2' call
  var value = _Motion___get_packedValue__impl__qymh4n(this_0);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(bitwiseAnd(value, new Long(-1, 0)));
  return floatFromBits(bits);
};
var androidx_compose_animation_core_FloatExponentialDecaySpec$stable;
var androidx_compose_animation_core_InfiniteTransition$stable;
var androidx_compose_animation_core_MutationInterruptedException$stable;
var androidx_compose_animation_core_MutatorMutex$stable;
var androidx_compose_animation_core_MonoSpline$stable;
var androidx_compose_animation_core_PathEasing$stable;
function throwIllegalArgumentException(message) {
  throw IllegalArgumentException_init_$Create$(message);
}
var androidx_compose_animation_core_SpringSimulation$stable;
function SpringSimulation(finalPosition) {
  this.f4_1 = finalPosition;
  var tmp = this;
  // Inline function 'kotlin.math.sqrt' call
  tmp.g4_1 = Math.sqrt(50.0);
  this.h4_1 = 1.0;
}
protoOf(SpringSimulation).j4 = function (value) {
  if (this.n4() <= 0) {
    throwIllegalArgumentException('Spring stiffness constant must be positive.');
  }
  var tmp = this;
  // Inline function 'kotlin.math.sqrt' call
  tmp.g4_1 = Math.sqrt(value);
};
protoOf(SpringSimulation).n4 = function () {
  return this.g4_1 * this.g4_1;
};
protoOf(SpringSimulation).i4 = function (value) {
  if (value < 0) {
    throwIllegalArgumentException('Damping ratio must be non-negative');
  }
  this.h4_1 = value;
};
protoOf(SpringSimulation).l4 = function (lastDisplacement, lastVelocity, timeElapsed) {
  var adjustedDisplacement = lastDisplacement - this.f4_1;
  // Inline function 'kotlin.Long.div' call
  var deltaT = toNumber(timeElapsed) / 1000.0;
  var dampingRatioSquared = this.h4_1 * this.h4_1;
  var r = -this.h4_1 * this.g4_1;
  var displacement;
  var currentVelocity;
  if (this.h4_1 > 1) {
    var tmp = this.g4_1;
    // Inline function 'kotlin.math.sqrt' call
    var x = dampingRatioSquared - 1;
    var s = tmp * Math.sqrt(x);
    var gammaPlus = r + s;
    var gammaMinus = r - s;
    var coeffB = (gammaMinus * adjustedDisplacement - lastVelocity) / (gammaMinus - gammaPlus);
    var coeffA = adjustedDisplacement - coeffB;
    // Inline function 'kotlin.math.exp' call
    var x_0 = gammaMinus * deltaT;
    var tmp_0 = coeffA * Math.exp(x_0);
    // Inline function 'kotlin.math.exp' call
    var x_1 = gammaPlus * deltaT;
    displacement = tmp_0 + coeffB * Math.exp(x_1);
    var tmp_1 = coeffA * gammaMinus;
    // Inline function 'kotlin.math.exp' call
    var x_2 = gammaMinus * deltaT;
    var tmp_2 = tmp_1 * Math.exp(x_2);
    var tmp_3 = coeffB * gammaPlus;
    // Inline function 'kotlin.math.exp' call
    var x_3 = gammaPlus * deltaT;
    currentVelocity = tmp_2 + tmp_3 * Math.exp(x_3);
  } else if (this.h4_1 === 1.0) {
    var coeffA_0 = adjustedDisplacement;
    var coeffB_0 = lastVelocity + this.g4_1 * adjustedDisplacement;
    var nFdT = -this.g4_1 * deltaT;
    var tmp_4 = coeffA_0 + coeffB_0 * deltaT;
    // Inline function 'kotlin.math.exp' call
    displacement = tmp_4 * Math.exp(nFdT);
    var tmp_5 = coeffA_0 + coeffB_0 * deltaT;
    // Inline function 'kotlin.math.exp' call
    var tmp_6 = tmp_5 * Math.exp(nFdT) * -this.g4_1;
    // Inline function 'kotlin.math.exp' call
    currentVelocity = tmp_6 + coeffB_0 * Math.exp(nFdT);
  } else {
    var tmp_7 = this.g4_1;
    // Inline function 'kotlin.math.sqrt' call
    var x_4 = 1 - dampingRatioSquared;
    var dampedFreq = tmp_7 * Math.sqrt(x_4);
    var cosCoeff = adjustedDisplacement;
    var sinCoeff = 1 / dampedFreq * (-r * adjustedDisplacement + lastVelocity);
    var dFdT = dampedFreq * deltaT;
    // Inline function 'kotlin.math.exp' call
    var x_5 = r * deltaT;
    var tmp_8 = Math.exp(x_5);
    // Inline function 'kotlin.math.cos' call
    var tmp_9 = cosCoeff * Math.cos(dFdT);
    // Inline function 'kotlin.math.sin' call
    displacement = tmp_8 * (tmp_9 + sinCoeff * Math.sin(dFdT));
    var tmp_10 = displacement * r;
    // Inline function 'kotlin.math.exp' call
    var x_6 = r * deltaT;
    var tmp_11 = Math.exp(x_6);
    var tmp_12 = -dampedFreq * cosCoeff;
    // Inline function 'kotlin.math.sin' call
    var tmp_13 = tmp_12 * Math.sin(dFdT);
    var tmp_14 = dampedFreq * sinCoeff;
    // Inline function 'kotlin.math.cos' call
    currentVelocity = tmp_10 + tmp_11 * (tmp_13 + tmp_14 * Math.cos(dFdT));
  }
  var newValue = displacement + this.f4_1;
  var newVelocity = currentVelocity;
  // Inline function 'androidx.compose.animation.core.Motion' call
  // Inline function 'androidx.compose.ui.util.packFloats' call
  var v1 = fromInt(toRawBits(newValue));
  var v2 = fromInt(toRawBits(newVelocity));
  var tmp$ret$17 = bitwiseOr(shiftLeft(v1, 32), bitwiseAnd(v2, new Long(-1, 0)));
  return _Motion___init__impl__vk56rv(tmp$ret$17);
};
function _Motion___init__impl__vk56rv(packedValue) {
  return packedValue;
}
function _Motion___get_packedValue__impl__qymh4n($this) {
  return $this;
}
var androidx_compose_animation_core_VectorizedMonoSplineKeyframesSpec$stable;
var androidx_compose_animation_core_AtomicReference$stable;
var androidx_compose_animation_core_internal_PlatformOptimizedCancellationException$stable;
var thread;
//region block: init
androidx_compose_animation_core_TargetBasedAnimation$stable = 8;
androidx_compose_animation_core_DecayAnimation$stable = 0;
androidx_compose_animation_core_AnimationConstants$stable = 0;
androidx_compose_animation_core_TweenSpec$stable = 0;
androidx_compose_animation_core_SpringSpec$stable = 0;
androidx_compose_animation_core_ArcAnimationSpec$stable = 0;
androidx_compose_animation_core_RepeatableSpec$stable = 0;
androidx_compose_animation_core_InfiniteRepeatableSpec$stable = 8;
androidx_compose_animation_core_SnapSpec$stable = 0;
androidx_compose_animation_core_KeyframesSpecBaseConfig$stable = 8;
androidx_compose_animation_core_KeyframeBaseEntity$stable = 8;
androidx_compose_animation_core_KeyframesSpec_KeyframesSpecConfig$stable = 8;
androidx_compose_animation_core_KeyframesSpec_KeyframeEntity$stable = 8;
androidx_compose_animation_core_KeyframesSpec$stable = 0;
androidx_compose_animation_core_KeyframesWithSplineSpec_KeyframesWithSplineSpecConfig$stable = 8;
androidx_compose_animation_core_KeyframesWithSplineSpec$stable = 0;
androidx_compose_animation_core_AnimationState$stable = 0;
androidx_compose_animation_core_AnimationScope$stable = 8;
androidx_compose_animation_core_AnimationVector$stable = 8;
androidx_compose_animation_core_AnimationVector1D$stable = 8;
androidx_compose_animation_core_AnimationVector2D$stable = 8;
androidx_compose_animation_core_AnimationVector3D$stable = 8;
androidx_compose_animation_core_AnimationVector4D$stable = 8;
androidx_compose_animation_core_DeferredTargetAnimation$stable = 8;
androidx_compose_animation_core_FloatSpringSpec$stable = 8;
androidx_compose_animation_core_FloatTweenSpec$stable = 0;
androidx_compose_animation_core_FloatExponentialDecaySpec$stable = 0;
androidx_compose_animation_core_InfiniteTransition$stable = 8;
androidx_compose_animation_core_MutationInterruptedException$stable = 8;
androidx_compose_animation_core_MutatorMutex$stable = 0;
androidx_compose_animation_core_MonoSpline$stable = 8;
androidx_compose_animation_core_PathEasing$stable = 0;
androidx_compose_animation_core_SpringSimulation$stable = 8;
androidx_compose_animation_core_VectorizedMonoSplineKeyframesSpec$stable = 8;
androidx_compose_animation_core_AtomicReference$stable = 8;
androidx_compose_animation_core_internal_PlatformOptimizedCancellationException$stable = 8;
thread = Unit_instance;
//endregion
//region block: exports
export {
  CubicBezierEasing as CubicBezierEasing2lokozmur33uw,
  FloatSpringSpec as FloatSpringSpec2az8c9z506uzv,
  spring as springm5n3xad0398a,
};
//endregion

//# sourceMappingURL=compose-multiplatform-core-compose-animation-animation-core.mjs.map
