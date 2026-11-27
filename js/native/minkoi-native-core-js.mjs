import {
  SinkFeedbackmagtsu295yod as SinkFeedback,
  COUISpringEasing3483417belkvv as COUISpringEasing,
  get_COUIInEaseEasing1fltnhkb2an9y as get_COUIInEaseEasing,
  get_COUIMoveEaseEasing10fp53f6449ps as get_COUIMoveEaseEasing,
  get_COUIOutEaseEasing2elfmvnrle7gi as get_COUIOutEaseEasing,
  get_COUIEaseEasing1qziozyu42jq3 as get_COUIEaseEasing,
  couiSpringglxbjlayxbyn as couiSpring,
} from './compose-coui-ui-coui-ui.mjs';
import { folmeSpring2kwyeztf1urxz as folmeSpring } from './compose-miuix-ui-miuix-ui.mjs';
import {
  protoOf180f3jzyo7rfj as protoOf,
  FloatCompanionObject_instanceokgc3apyetrg as FloatCompanionObject_instance,
  numberToLong345n6tb1n1i71 as numberToLong,
  coerceAtMostfyc3emgaderp as coerceAtMost,
  initMetadataForObject1cxne3s9w65el as initMetadataForObject,
  Unit_instance3kz1zqli6gr1r as Unit_instance,
} from './kotlin-kotlin-stdlib.mjs';
import {
  get_VectorConvertermm8cecmwglax as get_VectorConverter,
  AnimationVector1D1417vrhjxultj as AnimationVector1D,
} from './compose-multiplatform-core-compose-animation-animation-core.mjs';
//region block: imports
var sign = Math.sign;
var hypot = Math.hypot;
//endregion
//region block: pre-declaration
initMetadataForObject(DirectMavenBridge, 'DirectMavenBridge');
initMetadataForObject(ReferenceMathAdapters, 'ReferenceMathAdapters');
//endregion
function DirectMavenBridge() {
  DirectMavenBridge_instance = this;
  this.n4_1 = new SinkFeedback();
}
protoOf(DirectMavenBridge).o4 = function (damping, response) {
  // Inline function 'kotlin.math.max' call
  var safeD = Math.max(0.05, damping);
  // Inline function 'kotlin.math.max' call
  var safeR = Math.max(0.05, response);
  return folmeSpring(safeD, safeR).i1_1;
};
protoOf(DirectMavenBridge).p4 = function (value, target, velocity, dtSeconds, damping, response, outPair) {
  // Inline function 'kotlin.math.max' call
  var tmp = Math.max(0.05, damping);
  // Inline function 'kotlin.math.max' call
  var tmp$ret$1 = Math.max(0.05, response);
  var spec = folmeSpring(tmp, tmp$ret$1);
  var vec = spec.k1(get_VectorConverter(FloatCompanionObject_instance));
  // Inline function 'kotlin.math.max' call
  var tmp$ret$2 = Math.max(0.0, dtSeconds);
  var dtNanos = numberToLong(tmp$ret$2 * 1.0E9);
  var initV = new AnimationVector1D(value);
  var targetV = new AnimationVector1D(target);
  var velV = new AnimationVector1D(velocity);
  outPair[0] = vec.u3(dtNanos, initV, targetV, velV).m1_1;
  outPair[1] = vec.y3(dtNanos, initV, targetV, velV).m1_1;
};
protoOf(DirectMavenBridge).q4 = function (fraction, response, bounce) {
  var tmp;
  if (response === 0.0) {
    tmp = 1.0;
  } else {
    // Inline function 'kotlin.math.max' call
    tmp = Math.max(0.05, response);
  }
  var safeR = tmp;
  var tmp_0 = new COUISpringEasing(safeR, bounce);
  // Inline function 'kotlin.math.max' call
  var tmp$ret$1 = Math.max(0.0, fraction);
  return tmp_0.b3(tmp$ret$1);
};
protoOf(DirectMavenBridge).r4 = function (kind, fraction) {
  // Inline function 'kotlin.math.max' call
  var tmp$ret$0 = Math.max(0.0, fraction);
  var f = coerceAtMost(tmp$ret$0, 1.0);
  var easing;
  switch (kind) {
    case 1:
      easing = get_COUIInEaseEasing();
      break;
    case 2:
      easing = get_COUIMoveEaseEasing();
      break;
    case 3:
      easing = get_COUIOutEaseEasing();
      break;
    default:
      easing = get_COUIEaseEasing();
      break;
  }
  return easing.b3(f);
};
protoOf(DirectMavenBridge).s4 = function (response) {
  var tmp;
  if (response === 0.0) {
    tmp = 1.0;
  } else {
    // Inline function 'kotlin.math.max' call
    tmp = Math.max(0.05, response);
  }
  var safeR = tmp;
  return couiSpring(safeR, 0.0).i1_1;
};
protoOf(DirectMavenBridge).t4 = function (bounce) {
  return couiSpring(0.35, bounce).h1_1;
};
protoOf(DirectMavenBridge).u4 = function (value, target, velocity, dtSeconds, response, bounce, outPair) {
  var tmp;
  if (response === 0.0) {
    tmp = 1.0;
  } else {
    // Inline function 'kotlin.math.max' call
    tmp = Math.max(0.05, response);
  }
  var safeR = tmp;
  var spec = couiSpring(safeR, bounce);
  var vec = spec.k1(get_VectorConverter(FloatCompanionObject_instance));
  // Inline function 'kotlin.math.max' call
  var tmp$ret$1 = Math.max(0.0, dtSeconds);
  var dtNanos = numberToLong(tmp$ret$1 * 1.0E9);
  var initV = new AnimationVector1D(value);
  var targetV = new AnimationVector1D(target);
  var velV = new AnimationVector1D(velocity);
  outPair[0] = vec.u3(dtNanos, initV, targetV, velV).m1_1;
  outPair[1] = vec.y3(dtNanos, initV, targetV, velV).m1_1;
};
protoOf(DirectMavenBridge).v4 = function () {
  return this.n4_1.l4_1;
};
var DirectMavenBridge_instance;
function DirectMavenBridge_getInstance() {
  if (DirectMavenBridge_instance == null)
    new DirectMavenBridge();
  return DirectMavenBridge_instance;
}
function ReferenceMathAdapters() {
}
protoOf(ReferenceMathAdapters).w4 = function (inputDistance, range) {
  if (range <= 0.0 || inputDistance === 0.0)
    return 0.0;
  // Inline function 'kotlin.math.sign' call
  var dir = sign(inputDistance);
  // Inline function 'kotlin.math.abs' call
  // Inline function 'kotlin.math.min' call
  var a = Math.abs(inputDistance) / range;
  // Inline function 'kotlin.math.max' call
  var b = Math.min(a, 1.0);
  var x = Math.max(0.0, b);
  var dampedFactor = x - x * x + x * x * x / 3.0;
  return dir * dampedFactor * range;
};
protoOf(ReferenceMathAdapters).x4 = function (currentPixelOffset, range) {
  if (range <= 0.0)
    return 0.0;
  // Inline function 'kotlin.math.abs' call
  var absPixelOffset = Math.abs(currentPixelOffset);
  // Inline function 'kotlin.math.abs' call
  var x = this.w4(range, range);
  var absMaxOffset = Math.abs(x);
  if (absPixelOffset <= 0.0)
    return 0.0;
  if (absPixelOffset >= absMaxOffset)
    absPixelOffset = absMaxOffset;
  var base = range - 3.0 * absPixelOffset;
  // Inline function 'kotlin.math.pow' call
  var x_0 = 2.0 / 3.0;
  var tmp = Math.pow(range, x_0);
  // Inline function 'kotlin.math.sign' call
  var tmp_0 = tmp * sign(base);
  // Inline function 'kotlin.math.abs' call
  var tmp0 = Math.abs(base);
  // Inline function 'kotlin.math.pow' call
  var x_1 = 1.0 / 3.0;
  var part2 = tmp_0 * Math.pow(tmp0, x_1);
  // Inline function 'kotlin.math.sign' call
  return sign(currentPixelOffset) * (range - part2);
};
protoOf(ReferenceMathAdapters).y4 = function (widthPx, heightPx, density) {
  // Inline function 'kotlin.math.max' call
  var safeDensity = Math.max(1.0, density);
  // Inline function 'kotlin.math.max' call
  var maxSideDp = Math.max(widthPx, heightPx) / safeDensity;
  // Inline function 'kotlin.math.max' call
  var b = maxSideDp / 160.0;
  var sizeRatio = Math.max(1.0, b);
  return 2.0 / (1.0 + sizeRatio);
};
protoOf(ReferenceMathAdapters).z4 = function (value, target, velocity, dt, dampingRatio, stiffness, mass, outPair) {
  // Inline function 'kotlin.math.max' call
  // Inline function 'kotlin.math.sqrt' call
  var x = stiffness / Math.max(0.001, mass);
  var omega = Math.sqrt(x);
  // Inline function 'kotlin.math.max' call
  var zeta = Math.max(0.05, dampingRatio);
  var x_0 = value - target;
  var v = velocity;
  var nextX;
  var nextV;
  // Inline function 'kotlin.math.abs' call
  var x_1 = zeta - 1.0;
  if (Math.abs(x_1) < 1.0E-5) {
    var b = v + omega * x_0;
    // Inline function 'kotlin.math.exp' call
    var x_2 = -omega * dt;
    var decay = Math.exp(x_2);
    nextX = (x_0 + b * dt) * decay;
    nextV = (v - omega * b * dt) * decay;
  } else {
    if (zeta < 1.0) {
      var alpha = zeta * omega;
      // Inline function 'kotlin.math.sqrt' call
      var x_3 = 1.0 - zeta * zeta;
      var wd = omega * Math.sqrt(x_3);
      var b_0 = (v + alpha * x_0) / wd;
      // Inline function 'kotlin.math.cos' call
      var x_4 = wd * dt;
      var c = Math.cos(x_4);
      // Inline function 'kotlin.math.sin' call
      var x_5 = wd * dt;
      var s = Math.sin(x_5);
      // Inline function 'kotlin.math.exp' call
      var x_6 = -alpha * dt;
      var decay_0 = Math.exp(x_6);
      nextX = decay_0 * (x_0 * c + b_0 * s);
      nextV = decay_0 * (v * c - (alpha * b_0 + wd * x_0) * s);
    } else {
      // Inline function 'kotlin.math.sqrt' call
      var x_7 = zeta * zeta - 1.0;
      var root = Math.sqrt(x_7);
      var r1 = -omega / (zeta + root);
      var r2 = -omega * (zeta + root);
      var a = (v - r2 * x_0) / (r1 - r2);
      var b_1 = x_0 - a;
      // Inline function 'kotlin.math.exp' call
      var x_8 = r1 * dt;
      var e1 = Math.exp(x_8);
      // Inline function 'kotlin.math.exp' call
      var x_9 = r2 * dt;
      var e2 = Math.exp(x_9);
      nextX = a * e1 + b_1 * e2;
      nextV = r1 * a * e1 + r2 * b_1 * e2;
    }
  }
  outPair[0] = target + nextX;
  outPair[1] = nextV;
};
protoOf(ReferenceMathAdapters).a5 = function (cx, cy, halfW, halfH, radius) {
  // Inline function 'kotlin.math.min' call
  // Inline function 'kotlin.math.min' call
  var b = Math.min(halfW, halfH);
  var r = Math.min(radius, b);
  // Inline function 'kotlin.math.abs' call
  var qx = Math.abs(cx) - (halfW - r);
  // Inline function 'kotlin.math.abs' call
  var qy = Math.abs(cy) - (halfH - r);
  // Inline function 'kotlin.math.max' call
  var tmp0 = Math.max(qx, 0.0);
  // Inline function 'kotlin.math.max' call
  // Inline function 'kotlin.math.hypot' call
  var y = Math.max(qy, 0.0);
  var outside = hypot(tmp0, y);
  // Inline function 'kotlin.math.max' call
  // Inline function 'kotlin.math.min' call
  var a = Math.max(qx, qy);
  var inside = Math.min(a, 0.0);
  return outside + inside - r;
};
protoOf(ReferenceMathAdapters).b5 = function (cx, cy, halfW, halfH, radius, outGrad) {
  // Inline function 'kotlin.math.min' call
  // Inline function 'kotlin.math.min' call
  var b = Math.min(halfW, halfH);
  var r = Math.min(radius, b);
  // Inline function 'kotlin.math.abs' call
  var cornerX = Math.abs(cx) - (halfW - r);
  // Inline function 'kotlin.math.abs' call
  var cornerY = Math.abs(cy) - (halfH - r);
  var sx = cx >= 0.0 ? 1.0 : -1.0;
  var sy = cy >= 0.0 ? 1.0 : -1.0;
  if (cornerX >= 0.0 || cornerY >= 0.0) {
    // Inline function 'kotlin.math.max' call
    var tmp0 = Math.max(cornerX, 0.0);
    // Inline function 'kotlin.math.max' call
    // Inline function 'kotlin.math.hypot' call
    var y = Math.max(cornerY, 0.0);
    var len = hypot(tmp0, y);
    if (len > 1.0E-6) {
      // Inline function 'kotlin.math.max' call
      outGrad[0] = sx * (Math.max(cornerX, 0.0) / len);
      // Inline function 'kotlin.math.max' call
      outGrad[1] = sy * (Math.max(cornerY, 0.0) / len);
    } else {
      outGrad[0] = 0.0;
      outGrad[1] = 0.0;
    }
  } else {
    var gradX = cornerX >= cornerY ? 1.0 : 0.0;
    outGrad[0] = sx * gradX;
    outGrad[1] = sy * (1.0 - gradX);
  }
};
protoOf(ReferenceMathAdapters).c5 = function (x) {
  // Inline function 'kotlin.math.min' call
  // Inline function 'kotlin.math.max' call
  var b = Math.min(1.0, x);
  var clamped = Math.max(0.0, b);
  // Inline function 'kotlin.math.max' call
  var b_0 = 1.0 - clamped * clamped;
  // Inline function 'kotlin.math.sqrt' call
  var x_0 = Math.max(0.0, b_0);
  return 1.0 - Math.sqrt(x_0);
};
protoOf(ReferenceMathAdapters).d5 = function (coordX, coordY, width, height, radius, angleRad, falloff) {
  var halfW = width * 0.5;
  var halfH = height * 0.5;
  var cx = coordX - halfW;
  var cy = coordY - halfH;
  var tmp0 = radius * 1.5;
  // Inline function 'kotlin.math.min' call
  // Inline function 'kotlin.math.min' call
  var b = Math.min(halfW, halfH);
  var gradRadius = Math.min(tmp0, b);
  var grad = new Float64Array(2);
  this.b5(cx, cy, halfW, halfH, gradRadius, grad);
  var tmp = grad[0];
  // Inline function 'kotlin.math.cos' call
  var tmp_0 = tmp * Math.cos(angleRad);
  var tmp_1 = grad[1];
  // Inline function 'kotlin.math.sin' call
  var d = tmp_0 + tmp_1 * Math.sin(angleRad);
  // Inline function 'kotlin.math.abs' call
  var tmp0_0 = Math.abs(d);
  // Inline function 'kotlin.math.max' call
  // Inline function 'kotlin.math.pow' call
  var x = Math.max(0.1, falloff);
  return Math.pow(tmp0_0, x);
};
protoOf(ReferenceMathAdapters).e5 = function (coordX, coordY, width, height, radius, refractionHeight, refractionAmount) {
  if (refractionHeight <= 0.0)
    return 0.0;
  var halfW = width * 0.5;
  var halfH = height * 0.5;
  var sd = this.a5(coordX - halfW, coordY - halfH, halfW, halfH, radius);
  if (-sd >= refractionHeight)
    return 0.0;
  // Inline function 'kotlin.math.min' call
  var clampedSd = Math.min(sd, 0.0);
  return this.c5(1.0 - -clampedSd / refractionHeight) * refractionAmount;
};
var ReferenceMathAdapters_instance;
function ReferenceMathAdapters_getInstance() {
  return ReferenceMathAdapters_instance;
}
function get_scratchPair() {
  _init_properties_JsExports_kt__s0j324();
  return scratchPair;
}
var scratchPair;
function minkoiNativeVersion() {
  _init_properties_JsExports_kt__s0j324();
  return '5.6.1-kotlin-js-direct-maven';
}
function minkoiNativeManifestJson() {
  _init_properties_JsExports_kt__s0j324();
  return '{"version":"5.6.1","target":"js","directMaven":["top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01","io.github.suqi8.coui.kmp:coui-ui:2.1.0","org.jetbrains.compose.animation:animation-core:1.13.0-rc01"],"referenceAdapters":["Miuix SpringMath (internal)","Miuix PressFeedback (private)","Backdrop Shaders.kt (internal SkSL -> SDF)"],"incompatibleDirect":["miuix-blur/miuix-glass (Skiko)","coui-blur/coui-shader (Skiko)","io.github.kyant0:backdrop:2.0.1 (Skiko)"]}';
}
function miuixFolmeStiffness(damping, response) {
  _init_properties_JsExports_kt__s0j324();
  return DirectMavenBridge_getInstance().o4(damping, response);
}
function miuixFolmeStepValue(value, target, velocity, dt, damping, response) {
  _init_properties_JsExports_kt__s0j324();
  DirectMavenBridge_getInstance().p4(value, target, velocity, dt, damping, response, get_scratchPair());
  return get_scratchPair()[0];
}
function couiSpringEasing(fraction, response, bounce) {
  _init_properties_JsExports_kt__s0j324();
  return DirectMavenBridge_getInstance().q4(fraction, response, bounce);
}
function couiBezierEasing(kind, fraction) {
  _init_properties_JsExports_kt__s0j324();
  return DirectMavenBridge_getInstance().r4(kind, fraction);
}
function couiStiffnessFromResponse(response) {
  _init_properties_JsExports_kt__s0j324();
  return DirectMavenBridge_getInstance().s4(response);
}
function couiDampingFromBounce(bounce) {
  _init_properties_JsExports_kt__s0j324();
  return DirectMavenBridge_getInstance().t4(bounce);
}
function couiSpringStepValue(value, target, velocity, dt, response, bounce) {
  _init_properties_JsExports_kt__s0j324();
  DirectMavenBridge_getInstance().u4(value, target, velocity, dt, response, bounce, get_scratchPair());
  return get_scratchPair()[0];
}
function couiDefaultSinkAmount() {
  _init_properties_JsExports_kt__s0j324();
  return DirectMavenBridge_getInstance().v4();
}
function miuixObtainDampingDistance(inputDistance, range) {
  _init_properties_JsExports_kt__s0j324();
  return ReferenceMathAdapters_instance.w4(inputDistance, range);
}
function miuixObtainTouchDistance(currentPixelOffset, range) {
  _init_properties_JsExports_kt__s0j324();
  return ReferenceMathAdapters_instance.x4(currentPixelOffset, range);
}
function miuixPressStrength(widthPx, heightPx, density) {
  _init_properties_JsExports_kt__s0j324();
  return ReferenceMathAdapters_instance.y4(widthPx, heightPx, density);
}
function springStepValue(value, target, velocity, dt, dampingRatio, stiffness, mass) {
  _init_properties_JsExports_kt__s0j324();
  ReferenceMathAdapters_instance.z4(value, target, velocity, dt, dampingRatio, stiffness, mass, get_scratchPair());
  return get_scratchPair()[0];
}
function springStepLastVelocity() {
  _init_properties_JsExports_kt__s0j324();
  return get_scratchPair()[1];
}
function backdropHighlightIntensity(coordX, coordY, width, height, radius, angleRad, falloff) {
  _init_properties_JsExports_kt__s0j324();
  return ReferenceMathAdapters_instance.d5(coordX, coordY, width, height, radius, angleRad, falloff);
}
function backdropRefractionMagnitude(coordX, coordY, width, height, radius, refractionHeight, refractionAmount) {
  _init_properties_JsExports_kt__s0j324();
  return ReferenceMathAdapters_instance.e5(coordX, coordY, width, height, radius, refractionHeight, refractionAmount);
}
function main() {
  _init_properties_JsExports_kt__s0j324();
}
var properties_initialized_JsExports_kt_432guy;
function _init_properties_JsExports_kt__s0j324() {
  if (!properties_initialized_JsExports_kt_432guy) {
    properties_initialized_JsExports_kt_432guy = true;
    scratchPair = new Float64Array(2);
  }
}
function mainWrapper() {
  main();
}
//region block: init
ReferenceMathAdapters_instance = new ReferenceMathAdapters();
//endregion
//region block: exports
export {
  minkoiNativeVersion as minkoiNativeVersion,
  minkoiNativeManifestJson as minkoiNativeManifestJson,
  miuixFolmeStiffness as miuixFolmeStiffness,
  miuixFolmeStepValue as miuixFolmeStepValue,
  couiSpringEasing as couiSpringEasing,
  couiBezierEasing as couiBezierEasing,
  couiStiffnessFromResponse as couiStiffnessFromResponse,
  couiDampingFromBounce as couiDampingFromBounce,
  couiSpringStepValue as couiSpringStepValue,
  couiDefaultSinkAmount as couiDefaultSinkAmount,
  miuixObtainDampingDistance as miuixObtainDampingDistance,
  miuixObtainTouchDistance as miuixObtainTouchDistance,
  miuixPressStrength as miuixPressStrength,
  springStepValue as springStepValue,
  springStepLastVelocity as springStepLastVelocity,
  backdropHighlightIntensity as backdropHighlightIntensity,
  backdropRefractionMagnitude as backdropRefractionMagnitude,
};
//endregion
mainWrapper();

//# sourceMappingURL=minkoi-native-core-js.mjs.map
