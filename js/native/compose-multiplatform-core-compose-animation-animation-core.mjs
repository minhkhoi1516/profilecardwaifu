import {
  VOID3gxj6tk5isa35 as VOID,
  protoOf180f3jzyo7rfj as protoOf,
  initMetadataForClassbxx6q50dy2s7 as initMetadataForClass,
  THROW_CCE2g6jy02ryeudk as THROW_CCE,
  Unit_instance3kz1zqli6gr1r as Unit_instance,
  IllegalArgumentException_init_$Create$1gox8sdqs91jy as IllegalArgumentException_init_$Create$,
  isNaN3ixot6a1mjs5h as isNaN_0,
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
  numberToInt1ygmcfwhs2fkq as numberToInt,
  roundToInt1ue8x8yshtznx as roundToInt,
  objectCreate1ve4bgxiu4x98 as objectCreate,
  throwUninitializedPropertyAccessException14fok093f3k3t as throwUninitializedPropertyAccessException,
  initMetadataForObject1cxne3s9w65el as initMetadataForObject,
  compareTo3ankvs086tmwq as compareTo,
  IndexOutOfBoundsException_init_$Create$k95f9vzk11af as IndexOutOfBoundsException_init_$Create$,
} from './kotlin-kotlin-stdlib.mjs';
import {
  computeCubicVerticalBoundse106b82in60d as computeCubicVerticalBounds,
  findFirstCubicRoottq5suyhwnejp as findFirstCubicRoot,
  evaluateCubiczqswofrromdd as evaluateCubic,
} from './compose-multiplatform-core-compose-ui-ui-graphics.mjs';
import { _FloatFloatPair___get_packedValue__impl__5lczxp31q07450qshb0 as _FloatFloatPair___get_packedValue__impl__5lczxp } from './androidx-collection-collection.mjs';
import {
  _Dp___get_value__impl__geb1vb26sbzucva829d as _Dp___get_value__impl__geb1vb,
  _Dp___init__impl__ms3zkbylhnpwwxwbyf as _Dp___init__impl__ms3zkb,
  Dp3t87qiepl9rb5 as Dp,
  _DpOffset___get_x__impl__uauqb51eunqdkkog92o as _DpOffset___get_x__impl__uauqb5,
  _DpOffset___get_y__impl__1h898y1enw06stmii8j as _DpOffset___get_y__impl__1h898y,
  _DpOffset___init__impl__yq36wy2nfh4jbyh5tbx as _DpOffset___init__impl__yq36wy,
  DpOffset2xcr695m4ap8z as DpOffset,
  _IntOffset___get_x__impl__qiqr5o3hkm8ok3j7g2u as _IntOffset___get_x__impl__qiqr5o,
  _IntOffset___get_y__impl__2avpwj1c68f5mctv23l as _IntOffset___get_y__impl__2avpwj,
  _IntOffset___init__impl__rq8h7b329boo9j1oiiq as _IntOffset___init__impl__rq8h7b,
  IntOffset2dvrfa3sc3t6x as IntOffset,
  _IntSize___get_packedValue__impl__uho7jf5nbj4kff6wep as _IntSize___get_packedValue__impl__uho7jf,
  _IntSize___init__impl__emcjft2q6yiw1n025h1 as _IntSize___init__impl__emcjft,
  IntSizey6j89niu217h as IntSize,
} from './compose-multiplatform-core-compose-ui-ui-unit.mjs';
import {
  _Size___get_packedValue__impl__7rlt1o2kbmr9yo71s13 as _Size___get_packedValue__impl__7rlt1o,
  _Size___init__impl__aywn0g2ma243uyqa7pa as _Size___init__impl__aywn0g,
  Size260n8r22w12r1 as Size,
  _Offset___get_packedValue__impl__xh2k8q3pchx76bvscp0 as _Offset___get_packedValue__impl__xh2k8q,
  _Offset___init__impl__c168vi2be4qg18yq0ae as _Offset___init__impl__c168vi,
  Offset1xwdzn5lu92tr as Offset,
  Rectmzcwydunvx8k as Rect,
} from './compose-multiplatform-core-compose-ui-ui-geometry.mjs';
//region block: imports
var hypot = Math.hypot;
var imul = Math.imul;
//endregion
//region block: pre-declaration
initMetadataForClass(SpringSpec, 'SpringSpec', SpringSpec);
initMetadataForClass(AnimationVector, 'AnimationVector');
initMetadataForClass(AnimationVector1D, 'AnimationVector1D', VOID, AnimationVector);
initMetadataForClass(AnimationVector2D, 'AnimationVector2D', VOID, AnimationVector);
initMetadataForClass(AnimationVector4D, 'AnimationVector4D', VOID, AnimationVector);
initMetadataForClass(Arc, 'Arc');
initMetadataForClass(ArcSpline, 'ArcSpline');
initMetadataForClass(CubicBezierEasing, 'CubicBezierEasing');
initMetadataForClass(FloatSpringSpec, 'FloatSpringSpec', FloatSpringSpec);
initMetadataForClass(SpringSimulation, 'SpringSimulation');
initMetadataForClass(TwoWayConverterImpl, 'TwoWayConverterImpl');
initMetadataForClass(VectorizedSpringSpec, 'VectorizedSpringSpec', VectorizedSpringSpec_init_$Create$);
initMetadataForClass(VectorizedFloatAnimationSpec, 'VectorizedFloatAnimationSpec');
initMetadataForObject(DefaultSpringAnimations, 'DefaultSpringAnimations');
initMetadataForClass(createSpringAnimations$1);
initMetadataForClass(createSpringAnimations$2);
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
  this.h1_1 = dampingRatio;
  this.i1_1 = stiffness;
  this.j1_1 = visibilityThreshold;
}
protoOf(SpringSpec).k1 = function (converter) {
  return VectorizedSpringSpec_init_$Create$(this.h1_1, this.i1_1, convert(converter, this.j1_1));
};
function spring(dampingRatio, stiffness, visibilityThreshold) {
  dampingRatio = dampingRatio === VOID ? 1.0 : dampingRatio;
  stiffness = stiffness === VOID ? 1500.0 : stiffness;
  visibilityThreshold = visibilityThreshold === VOID ? null : visibilityThreshold;
  return new SpringSpec(dampingRatio, stiffness, visibilityThreshold);
}
function convert(_this__u8e3s4, data) {
  if (data == null) {
    return null;
  } else {
    return _this__u8e3s4.l1()(data);
  }
}
var androidx_compose_animation_core_AnimationState$stable;
var androidx_compose_animation_core_AnimationScope$stable;
var androidx_compose_animation_core_AnimationVector$stable;
var androidx_compose_animation_core_AnimationVector1D$stable;
var androidx_compose_animation_core_AnimationVector2D$stable;
var androidx_compose_animation_core_AnimationVector3D$stable;
var androidx_compose_animation_core_AnimationVector4D$stable;
function AnimationVector1D(initVal) {
  AnimationVector.call(this);
  this.m1_1 = initVal;
  this.n1_1 = 1;
}
protoOf(AnimationVector1D).o1 = function () {
  return new AnimationVector1D(0.0);
};
protoOf(AnimationVector1D).p1 = function (index) {
  if (index === 0) {
    return this.m1_1;
  } else {
    return 0.0;
  }
};
protoOf(AnimationVector1D).q1 = function (index, value) {
  if (index === 0) {
    this.m1_1 = value;
  }
};
protoOf(AnimationVector1D).r1 = function () {
  return this.n1_1;
};
protoOf(AnimationVector1D).toString = function () {
  return 'AnimationVector1D: value = ' + this.m1_1;
};
function AnimationVector2D(v1, v2) {
  AnimationVector.call(this);
  this.s1_1 = v1;
  this.t1_1 = v2;
  this.u1_1 = 2;
}
protoOf(AnimationVector2D).o1 = function () {
  return new AnimationVector2D(0.0, 0.0);
};
protoOf(AnimationVector2D).p1 = function (index) {
  switch (index) {
    case 0:
      return this.s1_1;
    case 1:
      return this.t1_1;
    default:
      return 0.0;
  }
};
protoOf(AnimationVector2D).q1 = function (index, value) {
  if (index === 0)
    this.s1_1 = value;
  else if (index === 1)
    this.t1_1 = value;
};
protoOf(AnimationVector2D).r1 = function () {
  return this.u1_1;
};
protoOf(AnimationVector2D).toString = function () {
  return 'AnimationVector2D: v1 = ' + this.s1_1 + ', v2 = ' + this.t1_1;
};
function AnimationVector4D(v1, v2, v3, v4) {
  AnimationVector.call(this);
  this.v1_1 = v1;
  this.w1_1 = v2;
  this.x1_1 = v3;
  this.y1_1 = v4;
  this.z1_1 = 4;
}
protoOf(AnimationVector4D).o1 = function () {
  return new AnimationVector4D(0.0, 0.0, 0.0, 0.0);
};
protoOf(AnimationVector4D).p1 = function (index) {
  switch (index) {
    case 0:
      return this.v1_1;
    case 1:
      return this.w1_1;
    case 2:
      return this.x1_1;
    case 3:
      return this.y1_1;
    default:
      return 0.0;
  }
};
protoOf(AnimationVector4D).q1 = function (index, value) {
  switch (index) {
    case 0:
      this.v1_1 = value;
      break;
    case 1:
      this.w1_1 = value;
      break;
    case 2:
      this.x1_1 = value;
      break;
    case 3:
      this.y1_1 = value;
      break;
  }
};
protoOf(AnimationVector4D).r1 = function () {
  return this.z1_1;
};
protoOf(AnimationVector4D).toString = function () {
  return 'AnimationVector4D: v1 = ' + this.v1_1 + ', v2 = ' + this.w1_1 + ', v3 = ' + this.x1_1 + ', v4 = ' + this.y1_1;
};
function AnimationVector() {
}
function newInstance(_this__u8e3s4) {
  var tmp = _this__u8e3s4.o1();
  return tmp instanceof AnimationVector ? tmp : THROW_CCE();
}
function get_OurPercentCache() {
  _init_properties_ArcSpline_kt__f15lqp();
  return OurPercentCache;
}
var OurPercentCache;
var androidx_compose_animation_core_ArcSpline_Arc$stable;
var androidx_compose_animation_core_ArcSpline$stable;
function Arc(mode, time1, time2, x1, y1, x2, y2) {
  this.a2_1 = time1;
  this.b2_1 = time2;
  this.c2_1 = x1;
  this.d2_1 = y1;
  this.e2_1 = x2;
  this.f2_1 = y2;
  this.g2_1 = 0.0;
  this.h2_1 = 0.0;
  this.i2_1 = 0.0;
  var dx = this.e2_1 - this.c2_1;
  var dy = this.f2_1 - this.d2_1;
  var isVertical;
  switch (mode) {
    case 1:
      isVertical = true;
      break;
    case 5:
      isVertical = dy < 0;
      break;
    case 4:
      isVertical = dy > 0;
      break;
    default:
      isVertical = false;
      break;
  }
  this.m2_1 = isVertical ? -1.0 : 1.0;
  this.k2_1 = 1 / (this.b2_1 - this.a2_1);
  this.j2_1 = new Float32Array(101);
  var isLinear = mode === 3;
  var tmp;
  var tmp_0;
  if (isLinear) {
    tmp_0 = true;
  } else {
    // Inline function 'kotlin.math.abs' call
    tmp_0 = Math.abs(dx) < 0.001;
  }
  if (tmp_0) {
    tmp = true;
  } else {
    // Inline function 'kotlin.math.abs' call
    tmp = Math.abs(dy) < 0.001;
  }
  if (tmp) {
    isLinear = true;
    var tmp_1 = this;
    // Inline function 'kotlin.math.hypot' call
    tmp_1.g2_1 = hypot(dy, dx);
    this.l2_1 = this.g2_1 * this.k2_1;
    this.q2_1 = dx * this.k2_1;
    this.r2_1 = dy * this.k2_1;
    this.n2_1 = NaN;
    this.o2_1 = NaN;
  } else {
    this.n2_1 = dx * this.m2_1;
    this.o2_1 = dy * -this.m2_1;
    this.q2_1 = isVertical ? this.e2_1 : this.c2_1;
    this.r2_1 = isVertical ? this.d2_1 : this.f2_1;
    this.s2(this.c2_1, this.d2_1, this.e2_1, this.f2_1);
    this.l2_1 = this.g2_1 * this.k2_1;
  }
  this.p2_1 = isLinear;
}
protoOf(Arc).s2 = function (x1, y1, x2, y2) {
  var a = x2 - x1;
  var b = y1 - y2;
  var lx = 0.0;
  var ly = b;
  var dist = 0.0;
  var ourPercent = get_OurPercentCache();
  var lastIndex = ourPercent.length - 1 | 0;
  var lastIndexFloat = lastIndex;
  var lut = this.j2_1;
  var inductionVariable = 1;
  if (inductionVariable <= lastIndex)
    do {
      var i = inductionVariable;
      inductionVariable = inductionVariable + 1 | 0;
      // Inline function 'androidx.compose.animation.core.toRadians' call
      var angle = 90.0 * i / lastIndex * (3.141592653589793 / 180.0);
      // Inline function 'kotlin.math.sin' call
      var s = Math.sin(angle);
      // Inline function 'kotlin.math.cos' call
      var c = Math.cos(angle);
      var px = a * s;
      var py = b * c;
      var tmp = dist;
      var tmp0 = px - lx;
      // Inline function 'kotlin.math.hypot' call
      var y = py - ly;
      dist = tmp + hypot(tmp0, y);
      ourPercent[i] = dist;
      lx = px;
      ly = py;
    }
     while (!(i === lastIndex));
  this.g2_1 = dist;
  var inductionVariable_0 = 1;
  if (inductionVariable_0 <= lastIndex)
    do {
      var i_0 = inductionVariable_0;
      inductionVariable_0 = inductionVariable_0 + 1 | 0;
      var _index_0__fvwizt = i_0;
      ourPercent[_index_0__fvwizt] = ourPercent[_index_0__fvwizt] / dist;
    }
     while (!(i_0 === lastIndex));
  var lutLastIndex = 100;
  var inductionVariable_1 = 0;
  var last = lut.length - 1 | 0;
  if (inductionVariable_1 <= last)
    do {
      var i_1 = inductionVariable_1;
      inductionVariable_1 = inductionVariable_1 + 1 | 0;
      var pos = i_1 / lutLastIndex;
      // Inline function 'androidx.compose.animation.core.binarySearch' call
      var index = binarySearch(ourPercent, pos);
      if (index >= 0) {
        lut[i_1] = index / lastIndexFloat;
      } else if (index === -1) {
        lut[i_1] = 0.0;
      } else {
        var p1 = (-index | 0) - 2 | 0;
        var p2 = (-index | 0) - 1 | 0;
        var ans = (p1 + (pos - ourPercent[p1]) / (ourPercent[p2] - ourPercent[p1])) / lastIndexFloat;
        lut[i_1] = ans;
      }
    }
     while (inductionVariable_1 <= last);
};
function ArcSpline(arcModes, timePoints, y) {
  this.u2_1 = true;
  var mode = {_v: 1};
  var last = {_v: 1};
  var tmp = this;
  var tmp_0 = 0;
  var tmp_1 = timePoints.length - 1 | 0;
  // Inline function 'kotlin.arrayOfNulls' call
  var tmp_2 = Array(tmp_1);
  while (tmp_0 < tmp_1) {
    var tmp_3 = tmp_0;
    switch (arcModes[tmp_3]) {
      case 1:
        mode._v = 1;
        last._v = mode._v;
        break;
      case 2:
        mode._v = 2;
        last._v = mode._v;
        break;
      case 3:
        mode._v = last._v === 1 ? 2 : 1;
        last._v = mode._v;
        break;
      case 0:
        mode._v = 3;
        break;
      case 5:
        mode._v = 5;
        break;
      case 4:
        mode._v = 4;
        break;
    }
    var yArray = y[tmp_3];
    var yArray1 = y[tmp_3 + 1 | 0];
    var timeArray = timePoints[tmp_3];
    var timeArray1 = timePoints[tmp_3 + 1 | 0];
    var dim = (yArray.length / 2 | 0) + (yArray.length % 2 | 0) | 0;
    var tmp_4 = 0;
    // Inline function 'kotlin.arrayOfNulls' call
    var tmp_5 = Array(dim);
    while (tmp_4 < dim) {
      var tmp_6 = tmp_4;
      var k = imul(tmp_6, 2);
      tmp_5[tmp_6] = new Arc(mode._v, timeArray, timeArray1, yArray[k], yArray[k + 1 | 0], yArray1[k], yArray1[k + 1 | 0]);
      tmp_4 = tmp_4 + 1 | 0;
    }
    tmp_2[tmp_3] = tmp_5;
    tmp_0 = tmp_0 + 1 | 0;
  }
  tmp.t2_1 = tmp_2;
}
var properties_initialized_ArcSpline_kt_jqay4z;
function _init_properties_ArcSpline_kt__f15lqp() {
  if (!properties_initialized_ArcSpline_kt_jqay4z) {
    properties_initialized_ArcSpline_kt_jqay4z = true;
    OurPercentCache = new Float32Array(91);
    androidx_compose_animation_core_ArcSpline_Arc$stable = 8;
    androidx_compose_animation_core_ArcSpline$stable = 8;
  }
}
var androidx_compose_animation_core_DeferredTargetAnimation$stable;
function throwNoSolution($this, fraction) {
  throw IllegalArgumentException_init_$Create$('The cubic curve with parameters (' + $this.v2_1 + ', ' + $this.w2_1 + ', ' + $this.x2_1 + ', ' + $this.y2_1 + ') has no solution at ' + fraction);
}
function CubicBezierEasing(a, b, c, d) {
  this.v2_1 = a;
  this.w2_1 = b;
  this.x2_1 = c;
  this.y2_1 = d;
  // Inline function 'androidx.compose.animation.core.requirePrecondition' call
  if (!(!isNaN_0(this.v2_1) && !isNaN_0(this.w2_1) && !isNaN_0(this.x2_1) && !isNaN_0(this.y2_1))) {
    var tmp$ret$1 = 'Parameters to CubicBezierEasing cannot be NaN. Actual parameters are: ' + this.v2_1 + ', ' + this.w2_1 + ', ' + this.x2_1 + ', ' + this.y2_1 + '.';
    throwIllegalArgumentException(tmp$ret$1);
  }
  var roots = new Float32Array(5);
  var extrema = computeCubicVerticalBounds(0.0, this.w2_1, this.y2_1, 1.0, roots, 0);
  var tmp = this;
  // Inline function 'androidx.collection.FloatFloatPair.first' call
  // Inline function 'androidx.collection.internal.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(_FloatFloatPair___get_packedValue__impl__5lczxp(extrema), 32));
  tmp.z2_1 = floatFromBits(bits);
  var tmp_0 = this;
  // Inline function 'androidx.collection.FloatFloatPair.second' call
  // Inline function 'androidx.collection.internal.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits_0 = convertToInt(bitwiseAnd(_FloatFloatPair___get_packedValue__impl__5lczxp(extrema), new Long(-1, 0)));
  tmp_0.a3_1 = floatFromBits(bits_0);
}
protoOf(CubicBezierEasing).b3 = function (fraction) {
  var tmp;
  if (fraction > 0.0 && fraction < 1.0) {
    // Inline function 'kotlin.math.max' call
    var b = 1.1920929E-7;
    var f = Math.max(fraction, b);
    var t = findFirstCubicRoot(0.0 - f, this.v2_1 - f, this.x2_1 - f, 1.0 - f);
    if (isNaN_0(t)) {
      throwNoSolution(this, fraction);
    }
    var tmp0 = evaluateCubic(this.w2_1, this.y2_1, t);
    var tmp2 = this.z2_1;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    var maximumValue = this.a3_1;
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_0 = tmp0 < tmp2 ? tmp2 : tmp0;
    tmp = this_0 > maximumValue ? maximumValue : this_0;
  } else {
    tmp = fraction;
  }
  return tmp;
};
protoOf(CubicBezierEasing).toString = function () {
  return 'CubicBezierEasing(a=' + this.v2_1 + ', b=' + this.w2_1 + ', c=' + this.x2_1 + ', d=' + this.y2_1 + ')';
};
var androidx_compose_animation_core_FloatSpringSpec$stable;
var androidx_compose_animation_core_FloatTweenSpec$stable;
function FloatSpringSpec(dampingRatio, stiffness, visibilityThreshold) {
  dampingRatio = dampingRatio === VOID ? 1.0 : dampingRatio;
  stiffness = stiffness === VOID ? 1500.0 : stiffness;
  visibilityThreshold = visibilityThreshold === VOID ? 0.01 : visibilityThreshold;
  this.c3_1 = dampingRatio;
  this.d3_1 = stiffness;
  this.e3_1 = visibilityThreshold;
  var tmp = this;
  // Inline function 'kotlin.also' call
  var this_0 = new SpringSimulation(1.0);
  this_0.j3(this.c3_1);
  this_0.k3(this.d3_1);
  tmp.f3_1 = this_0;
}
protoOf(FloatSpringSpec).l3 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  var playTimeMillis = divide(playTimeNanos, new Long(1000000, 0));
  this.f3_1.g3_1 = targetValue;
  // Inline function 'androidx.compose.animation.core.Motion.value' call
  var this_0 = this.f3_1.m3(initialValue, initialVelocity, playTimeMillis);
  // Inline function 'androidx.compose.ui.util.unpackFloat1' call
  var value = _Motion___get_packedValue__impl__qymh4n(this_0);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(value, 32));
  return floatFromBits(bits);
};
protoOf(FloatSpringSpec).n3 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  var playTimeMillis = divide(playTimeNanos, new Long(1000000, 0));
  this.f3_1.g3_1 = targetValue;
  // Inline function 'androidx.compose.animation.core.Motion.velocity' call
  var this_0 = this.f3_1.m3(initialValue, initialVelocity, playTimeMillis);
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
  this.g3_1 = finalPosition;
  var tmp = this;
  // Inline function 'kotlin.math.sqrt' call
  tmp.h3_1 = Math.sqrt(50.0);
  this.i3_1 = 1.0;
}
protoOf(SpringSimulation).k3 = function (value) {
  if (this.o3() <= 0) {
    throwIllegalArgumentException('Spring stiffness constant must be positive.');
  }
  var tmp = this;
  // Inline function 'kotlin.math.sqrt' call
  tmp.h3_1 = Math.sqrt(value);
};
protoOf(SpringSimulation).o3 = function () {
  return this.h3_1 * this.h3_1;
};
protoOf(SpringSimulation).j3 = function (value) {
  if (value < 0) {
    throwIllegalArgumentException('Damping ratio must be non-negative');
  }
  this.i3_1 = value;
};
protoOf(SpringSimulation).m3 = function (lastDisplacement, lastVelocity, timeElapsed) {
  var adjustedDisplacement = lastDisplacement - this.g3_1;
  // Inline function 'kotlin.Long.div' call
  var deltaT = toNumber(timeElapsed) / 1000.0;
  var dampingRatioSquared = this.i3_1 * this.i3_1;
  var r = -this.i3_1 * this.h3_1;
  var displacement;
  var currentVelocity;
  if (this.i3_1 > 1) {
    var tmp = this.h3_1;
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
  } else if (this.i3_1 === 1.0) {
    var coeffA_0 = adjustedDisplacement;
    var coeffB_0 = lastVelocity + this.h3_1 * adjustedDisplacement;
    var nFdT = -this.h3_1 * deltaT;
    var tmp_4 = coeffA_0 + coeffB_0 * deltaT;
    // Inline function 'kotlin.math.exp' call
    displacement = tmp_4 * Math.exp(nFdT);
    var tmp_5 = coeffA_0 + coeffB_0 * deltaT;
    // Inline function 'kotlin.math.exp' call
    var tmp_6 = tmp_5 * Math.exp(nFdT) * -this.h3_1;
    // Inline function 'kotlin.math.exp' call
    currentVelocity = tmp_6 + coeffB_0 * Math.exp(nFdT);
  } else {
    var tmp_7 = this.h3_1;
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
  var newValue = displacement + this.g3_1;
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
function get_FloatToVector() {
  _init_properties_VectorConverters_kt__g28mmu();
  return FloatToVector;
}
var FloatToVector;
var IntToVector;
var DpToVector;
var DpOffsetToVector;
var SizeToVector;
var OffsetToVector;
var IntOffsetToVector;
var IntSizeToVector;
var RectToVector;
function get_VectorConverter(_this__u8e3s4) {
  _init_properties_VectorConverters_kt__g28mmu();
  return get_FloatToVector();
}
function TwoWayConverter(convertToVector, convertFromVector) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new TwoWayConverterImpl(convertToVector, convertFromVector);
}
function TwoWayConverterImpl(convertToVector, convertFromVector) {
  this.p3_1 = convertToVector;
  this.q3_1 = convertFromVector;
}
protoOf(TwoWayConverterImpl).l1 = function () {
  return this.p3_1;
};
function FloatToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new AnimationVector1D(it);
}
function FloatToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return it.m1_1;
}
function IntToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new AnimationVector1D(it);
}
function IntToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return numberToInt(it.m1_1);
}
function DpToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new AnimationVector1D(_Dp___get_value__impl__geb1vb(it.c1_1));
}
function DpToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new Dp(_Dp___init__impl__ms3zkb(it.m1_1));
}
function DpOffsetToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new AnimationVector2D(_Dp___get_value__impl__geb1vb(_DpOffset___get_x__impl__uauqb5(it.e1_1)), _Dp___get_value__impl__geb1vb(_DpOffset___get_y__impl__1h898y(it.e1_1)));
}
function DpOffsetToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  // Inline function 'androidx.compose.ui.unit.dp' call
  var this_0 = it.s1_1;
  var tmp0 = _Dp___init__impl__ms3zkb(this_0 + 0.0);
  // Inline function 'androidx.compose.ui.unit.dp' call
  var this_1 = it.t1_1;
  // Inline function 'androidx.compose.ui.unit.DpOffset' call
  var y = _Dp___init__impl__ms3zkb(this_1 + 0.0);
  var tmp0_0 = _Dp___get_value__impl__geb1vb(tmp0);
  // Inline function 'androidx.compose.ui.util.packFloats' call
  var val2 = _Dp___get_value__impl__geb1vb(y);
  var v1 = fromInt(toRawBits(tmp0_0));
  var v2 = fromInt(toRawBits(val2));
  var tmp$ret$3 = bitwiseOr(shiftLeft(v1, 32), bitwiseAnd(v2, new Long(-1, 0)));
  var tmp$ret$2 = _DpOffset___init__impl__yq36wy(tmp$ret$3);
  return new DpOffset(tmp$ret$2);
}
function SizeToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  // Inline function 'androidx.compose.ui.geometry.Size.width' call
  var this_0 = it.b1_1;
  // Inline function 'androidx.compose.ui.util.unpackFloat1' call
  var value = _Size___get_packedValue__impl__7rlt1o(this_0);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(value, 32));
  var tmp = floatFromBits(bits);
  // Inline function 'androidx.compose.ui.geometry.Size.height' call
  var this_1 = it.b1_1;
  // Inline function 'androidx.compose.ui.util.unpackFloat2' call
  var value_0 = _Size___get_packedValue__impl__7rlt1o(this_1);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits_0 = convertToInt(bitwiseAnd(value_0, new Long(-1, 0)));
  var tmp$ret$4 = floatFromBits(bits_0);
  return new AnimationVector2D(tmp, tmp$ret$4);
}
function SizeToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  var tmp0 = it.s1_1;
  // Inline function 'androidx.compose.ui.geometry.Size' call
  // Inline function 'androidx.compose.ui.util.packFloats' call
  var val2 = it.t1_1;
  var v1 = fromInt(toRawBits(tmp0));
  var v2 = fromInt(toRawBits(val2));
  var tmp$ret$1 = bitwiseOr(shiftLeft(v1, 32), bitwiseAnd(v2, new Long(-1, 0)));
  var tmp$ret$0 = _Size___init__impl__aywn0g(tmp$ret$1);
  return new Size(tmp$ret$0);
}
function OffsetToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  // Inline function 'androidx.compose.ui.geometry.Offset.x' call
  var this_0 = it.v_1;
  // Inline function 'androidx.compose.ui.util.unpackFloat1' call
  var value = _Offset___get_packedValue__impl__xh2k8q(this_0);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(value, 32));
  var tmp = floatFromBits(bits);
  // Inline function 'androidx.compose.ui.geometry.Offset.y' call
  var this_1 = it.v_1;
  // Inline function 'androidx.compose.ui.util.unpackFloat2' call
  var value_0 = _Offset___get_packedValue__impl__xh2k8q(this_1);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits_0 = convertToInt(bitwiseAnd(value_0, new Long(-1, 0)));
  var tmp$ret$4 = floatFromBits(bits_0);
  return new AnimationVector2D(tmp, tmp$ret$4);
}
function OffsetToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  var tmp0 = it.s1_1;
  // Inline function 'androidx.compose.ui.geometry.Offset' call
  // Inline function 'androidx.compose.ui.util.packFloats' call
  var val2 = it.t1_1;
  var v1 = fromInt(toRawBits(tmp0));
  var v2 = fromInt(toRawBits(val2));
  var tmp$ret$1 = bitwiseOr(shiftLeft(v1, 32), bitwiseAnd(v2, new Long(-1, 0)));
  var tmp$ret$0 = _Offset___init__impl__c168vi(tmp$ret$1);
  return new Offset(tmp$ret$0);
}
function IntOffsetToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new AnimationVector2D(_IntOffset___get_x__impl__qiqr5o(it.f1_1), _IntOffset___get_y__impl__2avpwj(it.f1_1));
}
function IntOffsetToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  // Inline function 'androidx.compose.ui.util.fastRoundToInt' call
  var this_0 = it.s1_1;
  var tmp;
  if (isNaN_0(this_0)) {
    tmp = 0;
  } else {
    // Inline function 'kotlin.math.roundToInt' call
    tmp = roundToInt(this_0);
  }
  var tmp0 = tmp;
  // Inline function 'androidx.compose.ui.util.fastRoundToInt' call
  var this_1 = it.t1_1;
  var tmp_0;
  if (isNaN_0(this_1)) {
    tmp_0 = 0;
  } else {
    // Inline function 'kotlin.math.roundToInt' call
    tmp_0 = roundToInt(this_1);
  }
  // Inline function 'androidx.compose.ui.unit.IntOffset' call
  // Inline function 'androidx.compose.ui.util.packInts' call
  var val2 = tmp_0;
  var tmp$ret$5 = bitwiseOr(shiftLeft(fromInt(tmp0), 32), bitwiseAnd(fromInt(val2), new Long(-1, 0)));
  var tmp$ret$4 = _IntOffset___init__impl__rq8h7b(tmp$ret$5);
  return new IntOffset(tmp$ret$4);
}
function IntSizeToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  // Inline function 'androidx.compose.ui.unit.IntSize.width' call
  var this_0 = it.g1_1;
  // Inline function 'androidx.compose.ui.util.unpackInt1' call
  var value = _IntSize___get_packedValue__impl__uho7jf(this_0);
  var tmp = convertToInt(shiftRight(value, 32));
  // Inline function 'androidx.compose.ui.unit.IntSize.height' call
  var this_1 = it.g1_1;
  // Inline function 'androidx.compose.ui.util.unpackInt2' call
  var value_0 = _IntSize___get_packedValue__impl__uho7jf(this_1);
  var tmp$ret$2 = convertToInt(bitwiseAnd(value_0, new Long(-1, 0)));
  return new AnimationVector2D(tmp, tmp$ret$2);
}
function IntSizeToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  // Inline function 'androidx.compose.ui.util.fastRoundToInt' call
  var this_0 = it.s1_1;
  var tmp;
  if (isNaN_0(this_0)) {
    tmp = 0;
  } else {
    // Inline function 'kotlin.math.roundToInt' call
    tmp = roundToInt(this_0);
  }
  // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
  var this_1 = tmp;
  var tmp0 = this_1 < 0 ? 0 : this_1;
  // Inline function 'androidx.compose.ui.util.fastRoundToInt' call
  var this_2 = it.t1_1;
  var tmp_0;
  if (isNaN_0(this_2)) {
    tmp_0 = 0;
  } else {
    // Inline function 'kotlin.math.roundToInt' call
    tmp_0 = roundToInt(this_2);
  }
  // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
  var this_3 = tmp_0;
  // Inline function 'androidx.compose.ui.unit.IntSize' call
  // Inline function 'androidx.compose.ui.util.packInts' call
  var val2 = this_3 < 0 ? 0 : this_3;
  var tmp$ret$7 = bitwiseOr(shiftLeft(fromInt(tmp0), 32), bitwiseAnd(fromInt(val2), new Long(-1, 0)));
  var tmp$ret$6 = _IntSize___init__impl__emcjft(tmp$ret$7);
  return new IntSize(tmp$ret$6);
}
function RectToVector$lambda(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new AnimationVector4D(it.x_1, it.y_1, it.z_1, it.a1_1);
}
function RectToVector$lambda_0(it) {
  _init_properties_VectorConverters_kt__g28mmu();
  return new Rect(it.v1_1, it.w1_1, it.x1_1, it.y1_1);
}
var properties_initialized_VectorConverters_kt_cg0a6g;
function _init_properties_VectorConverters_kt__g28mmu() {
  if (!properties_initialized_VectorConverters_kt_cg0a6g) {
    properties_initialized_VectorConverters_kt_cg0a6g = true;
    var tmp = FloatToVector$lambda;
    FloatToVector = TwoWayConverter(tmp, FloatToVector$lambda_0);
    var tmp_0 = IntToVector$lambda;
    IntToVector = TwoWayConverter(tmp_0, IntToVector$lambda_0);
    var tmp_1 = DpToVector$lambda;
    DpToVector = TwoWayConverter(tmp_1, DpToVector$lambda_0);
    var tmp_2 = DpOffsetToVector$lambda;
    DpOffsetToVector = TwoWayConverter(tmp_2, DpOffsetToVector$lambda_0);
    var tmp_3 = SizeToVector$lambda;
    SizeToVector = TwoWayConverter(tmp_3, SizeToVector$lambda_0);
    var tmp_4 = OffsetToVector$lambda;
    OffsetToVector = TwoWayConverter(tmp_4, OffsetToVector$lambda_0);
    var tmp_5 = IntOffsetToVector$lambda;
    IntOffsetToVector = TwoWayConverter(tmp_5, IntOffsetToVector$lambda_0);
    var tmp_6 = IntSizeToVector$lambda;
    IntSizeToVector = TwoWayConverter(tmp_6, IntSizeToVector$lambda_0);
    var tmp_7 = RectToVector$lambda;
    RectToVector = TwoWayConverter(tmp_7, RectToVector$lambda_0);
  }
}
var EmptyIntArray;
var EmptyFloatArray;
var EmptyArcSpline;
var androidx_compose_animation_core_VectorizedKeyframesSpec$stable;
var androidx_compose_animation_core_VectorizedKeyframeSpecElementInfo$stable;
var androidx_compose_animation_core_VectorizedSnapSpec$stable;
var androidx_compose_animation_core_VectorizedInfiniteRepeatableSpec$stable;
var androidx_compose_animation_core_VectorizedRepeatableSpec$stable;
var androidx_compose_animation_core_Spring$stable;
var androidx_compose_animation_core_VectorizedSpringSpec$stable;
var androidx_compose_animation_core_VectorizedTweenSpec$stable;
var androidx_compose_animation_core_VectorizedFloatAnimationSpec$stable;
function VectorizedSpringSpec_init_$Init$(dampingRatio, stiffness, visibilityThreshold, $this) {
  dampingRatio = dampingRatio === VOID ? 1.0 : dampingRatio;
  stiffness = stiffness === VOID ? 1500.0 : stiffness;
  visibilityThreshold = visibilityThreshold === VOID ? null : visibilityThreshold;
  VectorizedSpringSpec.call($this, dampingRatio, stiffness, createSpringAnimations(visibilityThreshold, dampingRatio, stiffness));
  return $this;
}
function VectorizedSpringSpec_init_$Create$(dampingRatio, stiffness, visibilityThreshold) {
  return VectorizedSpringSpec_init_$Init$(dampingRatio, stiffness, visibilityThreshold, objectCreate(protoOf(VectorizedSpringSpec)));
}
function VectorizedSpringSpec(dampingRatio, stiffness, anims) {
  this.r3_1 = new VectorizedFloatAnimationSpec(anims);
  this.s3_1 = dampingRatio;
  this.t3_1 = stiffness;
}
protoOf(VectorizedSpringSpec).u3 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  return this.r3_1.u3(playTimeNanos, initialValue, targetValue, initialVelocity);
};
protoOf(VectorizedSpringSpec).y3 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  return this.r3_1.y3(playTimeNanos, initialValue, targetValue, initialVelocity);
};
function _get_valueVector__r10idf($this) {
  var tmp = $this.w3_1;
  if (!(tmp == null))
    return tmp;
  else {
    throwUninitializedPropertyAccessException('valueVector');
  }
}
function _get_velocityVector__dvxlkl($this) {
  var tmp = $this.x3_1;
  if (!(tmp == null))
    return tmp;
  else {
    throwUninitializedPropertyAccessException('velocityVector');
  }
}
function VectorizedFloatAnimationSpec(anims) {
  this.v3_1 = anims;
}
protoOf(VectorizedFloatAnimationSpec).u3 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  if (!!(this.w3_1 == null)) {
    this.w3_1 = newInstance(initialValue);
  }
  var inductionVariable = 0;
  var last = _get_valueVector__r10idf(this).r1();
  if (inductionVariable < last)
    do {
      var i = inductionVariable;
      inductionVariable = inductionVariable + 1 | 0;
      _get_valueVector__r10idf(this).q1(i, this.v3_1.z3(i).l3(playTimeNanos, initialValue.p1(i), targetValue.p1(i), initialVelocity.p1(i)));
    }
     while (inductionVariable < last);
  return _get_valueVector__r10idf(this);
};
protoOf(VectorizedFloatAnimationSpec).y3 = function (playTimeNanos, initialValue, targetValue, initialVelocity) {
  if (!!(this.x3_1 == null)) {
    this.x3_1 = newInstance(initialVelocity);
  }
  var inductionVariable = 0;
  var last = _get_velocityVector__dvxlkl(this).r1();
  if (inductionVariable < last)
    do {
      var i = inductionVariable;
      inductionVariable = inductionVariable + 1 | 0;
      _get_velocityVector__dvxlkl(this).q1(i, this.v3_1.z3(i).n3(playTimeNanos, initialValue.p1(i), targetValue.p1(i), initialVelocity.p1(i)));
    }
     while (inductionVariable < last);
  return _get_velocityVector__dvxlkl(this);
};
function createSpringAnimations(visibilityThreshold, dampingRatio, stiffness) {
  _init_properties_VectorizedAnimationSpec_kt__qefgpy();
  if (visibilityThreshold == null && dampingRatio === 1.0 && stiffness === 1500.0) {
    return DefaultSpringAnimations_getInstance();
  }
  var tmp;
  if (!(visibilityThreshold == null)) {
    tmp = new createSpringAnimations$1(visibilityThreshold, dampingRatio, stiffness);
  } else {
    tmp = new createSpringAnimations$2(dampingRatio, stiffness);
  }
  return tmp;
}
function DefaultSpringAnimations() {
  DefaultSpringAnimations_instance = this;
  this.a4_1 = new FloatSpringSpec(1.0, 1500.0);
}
protoOf(DefaultSpringAnimations).z3 = function (index) {
  return this.a4_1;
};
var DefaultSpringAnimations_instance;
function DefaultSpringAnimations_getInstance() {
  if (DefaultSpringAnimations_instance == null)
    new DefaultSpringAnimations();
  return DefaultSpringAnimations_instance;
}
function createSpringAnimations$1($visibilityThreshold, $dampingRatio, $stiffness) {
  var tmp = this;
  var tmp_0 = 0;
  var tmp_1 = $visibilityThreshold.r1();
  // Inline function 'kotlin.arrayOfNulls' call
  var tmp_2 = Array(tmp_1);
  while (tmp_0 < tmp_1) {
    var tmp_3 = tmp_0;
    tmp_2[tmp_3] = new FloatSpringSpec($dampingRatio, $stiffness, $visibilityThreshold.p1(tmp_3));
    tmp_0 = tmp_0 + 1 | 0;
  }
  tmp.b4_1 = tmp_2;
}
protoOf(createSpringAnimations$1).z3 = function (index) {
  return this.b4_1[index];
};
function createSpringAnimations$2($dampingRatio, $stiffness) {
  this.c4_1 = new FloatSpringSpec($dampingRatio, $stiffness);
}
protoOf(createSpringAnimations$2).z3 = function (index) {
  return this.c4_1;
};
var properties_initialized_VectorizedAnimationSpec_kt_jkmo58;
function _init_properties_VectorizedAnimationSpec_kt__qefgpy() {
  if (!properties_initialized_VectorizedAnimationSpec_kt_jkmo58) {
    properties_initialized_VectorizedAnimationSpec_kt_jkmo58 = true;
    EmptyIntArray = new Int32Array(0);
    EmptyFloatArray = new Float32Array(0);
    var tmp = new Int32Array(2);
    var tmp_0 = new Float32Array(2);
    // Inline function 'kotlin.arrayOf' call
    // Inline function 'kotlin.js.unsafeCast' call
    // Inline function 'kotlin.js.asDynamic' call
    var tmp$ret$0 = [new Float32Array(2), new Float32Array(2)];
    EmptyArcSpline = new ArcSpline(tmp, tmp_0, tmp$ret$0);
    androidx_compose_animation_core_VectorizedKeyframesSpec$stable = 8;
    androidx_compose_animation_core_VectorizedKeyframeSpecElementInfo$stable = 0;
    androidx_compose_animation_core_VectorizedSnapSpec$stable = 0;
    androidx_compose_animation_core_VectorizedInfiniteRepeatableSpec$stable = 8;
    androidx_compose_animation_core_VectorizedRepeatableSpec$stable = 8;
    androidx_compose_animation_core_Spring$stable = 0;
    androidx_compose_animation_core_VectorizedSpringSpec$stable = 8;
    androidx_compose_animation_core_VectorizedTweenSpec$stable = 8;
    androidx_compose_animation_core_VectorizedFloatAnimationSpec$stable = 8;
  }
}
var androidx_compose_animation_core_VectorizedMonoSplineKeyframesSpec$stable;
function binarySearch(_this__u8e3s4, element, fromIndex, toIndex) {
  fromIndex = fromIndex === VOID ? 0 : fromIndex;
  toIndex = toIndex === VOID ? _this__u8e3s4.length : toIndex;
  rangeCheck(_this__u8e3s4.length, fromIndex, toIndex);
  var low = fromIndex;
  var high = toIndex - 1 | 0;
  while (low <= high) {
    var mid = (low + high | 0) >>> 1 | 0;
    var midVal = _this__u8e3s4[mid];
    var cmp = compareTo(midVal, element);
    if (cmp < 0)
      low = mid + 1 | 0;
    else if (cmp > 0)
      high = mid - 1 | 0;
    else
      return mid;
  }
  return -(low + 1 | 0) | 0;
}
function rangeCheck(size, fromIndex, toIndex) {
  if (fromIndex > toIndex)
    throw IllegalArgumentException_init_$Create$('fromIndex (' + fromIndex + ') is greater than toIndex (' + toIndex + ').');
  else if (fromIndex < 0)
    throw IndexOutOfBoundsException_init_$Create$('fromIndex (' + fromIndex + ') is less than zero.');
  else if (toIndex > size)
    throw IndexOutOfBoundsException_init_$Create$('toIndex (' + toIndex + ') is greater than size (' + size + ').');
}
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
  AnimationVector1D as AnimationVector1D1417vrhjxultj,
  CubicBezierEasing as CubicBezierEasing2lokozmur33uw,
  get_VectorConverter as get_VectorConvertermm8cecmwglax,
  spring as springm5n3xad0398a,
};
//endregion

//# sourceMappingURL=compose-multiplatform-core-compose-animation-animation-core.mjs.map
