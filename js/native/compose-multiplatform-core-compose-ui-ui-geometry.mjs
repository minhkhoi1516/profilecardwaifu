import {
  isNaN3ixot6a1mjs5h as isNaN_0,
  isInfinite2z3fcu1dj15nr as isInfinite,
  numberToInt1ygmcfwhs2fkq as numberToInt,
  protoOf180f3jzyo7rfj as protoOf,
  initMetadataForCompanion1wyw17z38v6ac as initMetadataForCompanion,
  Long2qws0ah9gnpki as Long,
  bitwiseAnd2g7wmsfd45l12 as bitwiseAnd,
  equalsLong28bsrfhwvd686 as equalsLong,
  shiftRight2cr6y79ufiihy as shiftRight,
  convertToIntofdoxh9bstof as convertToInt,
  FloatCompanionObject_instanceokgc3apyetrg as FloatCompanionObject_instance,
  floatFromBits1n9d03e2m5i5s as floatFromBits,
  initMetadataForClassbxx6q50dy2s7 as initMetadataForClass,
} from './kotlin-kotlin-stdlib.mjs';
//region block: imports
//endregion
//region block: pre-declaration
initMetadataForCompanion(Companion);
initMetadataForClass(Offset, 'Offset');
initMetadataForCompanion(Companion_0);
initMetadataForClass(Rect, 'Rect');
initMetadataForCompanion(Companion_1);
initMetadataForClass(Size, 'Size');
//endregion
function toStringAsFixed(_this__u8e3s4, digits) {
  if (isNaN_0(_this__u8e3s4))
    return 'NaN';
  if (isInfinite(_this__u8e3s4))
    return _this__u8e3s4 < 0.0 ? '-Infinity' : 'Infinity';
  // Inline function 'kotlin.math.max' call
  var clampedDigits = Math.max(digits, 0);
  // Inline function 'kotlin.math.pow' call
  var pow = Math.pow(10.0, clampedDigits);
  var shifted = _this__u8e3s4 * pow;
  var decimal = shifted - numberToInt(shifted);
  var tmp;
  if (decimal >= 0.5) {
    tmp = numberToInt(shifted) + 1 | 0;
  } else {
    tmp = numberToInt(shifted);
  }
  var roundedShifted = tmp;
  var rounded = roundedShifted / pow;
  var tmp_0;
  if (clampedDigits > 0) {
    tmp_0 = rounded.toString();
  } else {
    tmp_0 = numberToInt(rounded).toString();
  }
  return tmp_0;
}
var androidx_compose_ui_geometry_MutableRect$stable;
function _Offset___init__impl__c168vi(packedValue) {
  return packedValue;
}
function _Offset___get_packedValue__impl__xh2k8q($this) {
  return $this;
}
function Companion() {
}
var Companion_instance;
function Companion_getInstance() {
  return Companion_instance;
}
function Offset__toString_impl_4ffbou($this) {
  var tmp;
  // Inline function 'androidx.compose.ui.geometry.isSpecified' call
  if (!equalsLong(bitwiseAnd(_Offset___get_packedValue__impl__xh2k8q($this), new Long(2147483647, 2147483647)), new Long(2143289344, 2143289344))) {
    // Inline function 'androidx.compose.ui.geometry.Offset.x' call
    // Inline function 'androidx.compose.ui.util.unpackFloat1' call
    var value = _Offset___get_packedValue__impl__xh2k8q($this);
    // Inline function 'androidx.compose.ui.util.floatFromBits' call
    // Inline function 'kotlin.fromBits' call
    var bits = convertToInt(shiftRight(value, 32));
    var tmp$ret$1 = floatFromBits(bits);
    var tmp_0 = toStringAsFixed(tmp$ret$1, 1);
    // Inline function 'androidx.compose.ui.geometry.Offset.y' call
    // Inline function 'androidx.compose.ui.util.unpackFloat2' call
    var value_0 = _Offset___get_packedValue__impl__xh2k8q($this);
    // Inline function 'androidx.compose.ui.util.floatFromBits' call
    // Inline function 'kotlin.fromBits' call
    var bits_0 = convertToInt(bitwiseAnd(value_0, new Long(-1, 0)));
    var tmp$ret$5 = floatFromBits(bits_0);
    tmp = 'Offset(' + tmp_0 + ', ' + toStringAsFixed(tmp$ret$5, 1) + ')';
  } else {
    tmp = 'Offset.Unspecified';
  }
  return tmp;
}
function Offset(packedValue) {
  this.v_1 = packedValue;
}
protoOf(Offset).toString = function () {
  return Offset__toString_impl_4ffbou(this.v_1);
};
var androidx_compose_ui_geometry_Rect$stable;
function Companion_0() {
  Companion_instance_0 = this;
  this.w_1 = new Rect(0.0, 0.0, 0.0, 0.0);
}
var Companion_instance_0;
function Companion_getInstance_0() {
  if (Companion_instance_0 == null)
    new Companion_0();
  return Companion_instance_0;
}
function Rect(left, top, right, bottom) {
  Companion_getInstance_0();
  this.x_1 = left;
  this.y_1 = top;
  this.z_1 = right;
  this.a1_1 = bottom;
}
protoOf(Rect).toString = function () {
  return 'Rect.fromLTRB(' + (toStringAsFixed(this.x_1, 1) + ', ') + (toStringAsFixed(this.y_1, 1) + ', ') + (toStringAsFixed(this.z_1, 1) + ', ') + (toStringAsFixed(this.a1_1, 1) + ')');
};
var androidx_compose_ui_geometry_RoundRect$stable;
function _Size___init__impl__aywn0g(packedValue) {
  return packedValue;
}
function _Size___get_packedValue__impl__7rlt1o($this) {
  return $this;
}
function Companion_1() {
}
var Companion_instance_1;
function Companion_getInstance_1() {
  return Companion_instance_1;
}
function Size__toString_impl_o87ni8($this) {
  var tmp;
  // Inline function 'androidx.compose.ui.geometry.isSpecified' call
  if (!equalsLong(_Size___get_packedValue__impl__7rlt1o($this), new Long(2143289344, 2143289344))) {
    // Inline function 'androidx.compose.ui.geometry.Size.width' call
    // Inline function 'androidx.compose.ui.util.unpackFloat1' call
    var value = _Size___get_packedValue__impl__7rlt1o($this);
    // Inline function 'androidx.compose.ui.util.floatFromBits' call
    // Inline function 'kotlin.fromBits' call
    var bits = convertToInt(shiftRight(value, 32));
    var tmp$ret$1 = floatFromBits(bits);
    var tmp_0 = toStringAsFixed(tmp$ret$1, 1);
    // Inline function 'androidx.compose.ui.geometry.Size.height' call
    // Inline function 'androidx.compose.ui.util.unpackFloat2' call
    var value_0 = _Size___get_packedValue__impl__7rlt1o($this);
    // Inline function 'androidx.compose.ui.util.floatFromBits' call
    // Inline function 'kotlin.fromBits' call
    var bits_0 = convertToInt(bitwiseAnd(value_0, new Long(-1, 0)));
    var tmp$ret$5 = floatFromBits(bits_0);
    tmp = 'Size(' + tmp_0 + ', ' + toStringAsFixed(tmp$ret$5, 1) + ')';
  } else {
    tmp = 'Size.Unspecified';
  }
  return tmp;
}
function Size(packedValue) {
  this.b1_1 = packedValue;
}
protoOf(Size).toString = function () {
  return Size__toString_impl_o87ni8(this.b1_1);
};
//region block: init
androidx_compose_ui_geometry_MutableRect$stable = 8;
Companion_instance = new Companion();
androidx_compose_ui_geometry_Rect$stable = 0;
androidx_compose_ui_geometry_RoundRect$stable = 0;
Companion_instance_1 = new Companion_1();
//endregion
//region block: exports
export {
  Offset as Offset1xwdzn5lu92tr,
  Rect as Rectmzcwydunvx8k,
  Size as Size260n8r22w12r1,
  _Offset___init__impl__c168vi as _Offset___init__impl__c168vi2be4qg18yq0ae,
  _Offset___get_packedValue__impl__xh2k8q as _Offset___get_packedValue__impl__xh2k8q3pchx76bvscp0,
  _Size___init__impl__aywn0g as _Size___init__impl__aywn0g2ma243uyqa7pa,
  _Size___get_packedValue__impl__7rlt1o as _Size___get_packedValue__impl__7rlt1o2kbmr9yo71s13,
};
//endregion

//# sourceMappingURL=compose-multiplatform-core-compose-ui-ui-geometry.mjs.map
