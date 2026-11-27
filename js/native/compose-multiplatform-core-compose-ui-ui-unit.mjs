import {
  compareTo3ankvs086tmwq as compareTo,
  isNaN3ixot6a1mjs5h as isNaN_0,
  THROW_CCE2g6jy02ryeudk as THROW_CCE,
  protoOf180f3jzyo7rfj as protoOf,
  initMetadataForCompanion1wyw17z38v6ac as initMetadataForCompanion,
  initMetadataForClassbxx6q50dy2s7 as initMetadataForClass,
  shiftRight2cr6y79ufiihy as shiftRight,
  convertToIntofdoxh9bstof as convertToInt,
  FloatCompanionObject_instanceokgc3apyetrg as FloatCompanionObject_instance,
  floatFromBits1n9d03e2m5i5s as floatFromBits,
  Long2qws0ah9gnpki as Long,
  bitwiseAnd2g7wmsfd45l12 as bitwiseAnd,
  equalsLong28bsrfhwvd686 as equalsLong,
} from './kotlin-kotlin-stdlib.mjs';
//region block: imports
//endregion
//region block: pre-declaration
initMetadataForCompanion(Companion);
initMetadataForClass(Dp, 'Dp');
initMetadataForCompanion(Companion_0);
initMetadataForClass(DpOffset, 'DpOffset');
initMetadataForCompanion(Companion_1);
initMetadataForClass(IntOffset, 'IntOffset');
initMetadataForCompanion(Companion_2);
initMetadataForClass(IntSize, 'IntSize');
//endregion
var androidx_compose_ui_unit_ComposeUiUnitFlags$stable;
var androidx_compose_ui_unit_DpRect$stable;
function _Dp___init__impl__ms3zkb(value) {
  return value;
}
function _Dp___get_value__impl__geb1vb($this) {
  return $this;
}
function Dp__compareTo_impl_tlg3dl($this, other) {
  return isNaN_0(_Dp___get_value__impl__geb1vb($this)) || isNaN_0(_Dp___get_value__impl__geb1vb(other)) ? 0 : compareTo(_Dp___get_value__impl__geb1vb($this), _Dp___get_value__impl__geb1vb(other));
}
function Dp__compareTo_impl_tlg3dl_0($this, other) {
  return Dp__compareTo_impl_tlg3dl($this.c1_1, other instanceof Dp ? other.c1_1 : THROW_CCE());
}
function Dp__toString_impl_kcddez($this) {
  var tmp;
  // Inline function 'androidx.compose.ui.unit.isUnspecified' call
  if (isNaN_0(_Dp___get_value__impl__geb1vb($this))) {
    tmp = 'Dp.Unspecified';
  } else {
    tmp = '' + _Dp___get_value__impl__geb1vb($this) + '.dp';
  }
  return tmp;
}
function Companion() {
}
var Companion_instance;
function Companion_getInstance() {
  return Companion_instance;
}
function Dp(value) {
  this.c1_1 = value;
}
protoOf(Dp).d1 = function (other) {
  return Dp__compareTo_impl_tlg3dl(this.c1_1, other);
};
protoOf(Dp).h = function (other) {
  return Dp__compareTo_impl_tlg3dl_0(this, other);
};
protoOf(Dp).toString = function () {
  return Dp__toString_impl_kcddez(this.c1_1);
};
function _DpOffset___init__impl__yq36wy(packedValue) {
  return packedValue;
}
function _DpOffset___get_packedValue__impl__7zqn8y($this) {
  return $this;
}
function _DpOffset___get_x__impl__uauqb5($this) {
  // Inline function 'androidx.compose.ui.util.unpackFloat1' call
  var value = _DpOffset___get_packedValue__impl__7zqn8y($this);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(shiftRight(value, 32));
  // Inline function 'androidx.compose.ui.unit.dp' call
  var this_0 = floatFromBits(bits);
  return _Dp___init__impl__ms3zkb(this_0 + 0.0);
}
function _DpOffset___get_y__impl__1h898y($this) {
  // Inline function 'androidx.compose.ui.util.unpackFloat2' call
  var value = _DpOffset___get_packedValue__impl__7zqn8y($this);
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = convertToInt(bitwiseAnd(value, new Long(-1, 0)));
  // Inline function 'androidx.compose.ui.unit.dp' call
  var this_0 = floatFromBits(bits);
  return _Dp___init__impl__ms3zkb(this_0 + 0.0);
}
function DpOffset__toString_impl_qqhvsu($this) {
  var tmp;
  // Inline function 'androidx.compose.ui.unit.isSpecified' call
  if (!equalsLong(_DpOffset___get_packedValue__impl__7zqn8y($this), new Long(2143289344, 2143289344))) {
    tmp = '(' + Dp__toString_impl_kcddez(_DpOffset___get_x__impl__uauqb5($this)) + ', ' + Dp__toString_impl_kcddez(_DpOffset___get_y__impl__1h898y($this)) + ')';
  } else {
    tmp = 'DpOffset.Unspecified';
  }
  return tmp;
}
function Companion_0() {
}
var Companion_instance_0;
function Companion_getInstance_0() {
  return Companion_instance_0;
}
function DpOffset(packedValue) {
  this.e1_1 = packedValue;
}
protoOf(DpOffset).toString = function () {
  return DpOffset__toString_impl_qqhvsu(this.e1_1);
};
function _IntOffset___init__impl__rq8h7b(packedValue) {
  return packedValue;
}
function _IntOffset___get_packedValue__impl__982pbx($this) {
  return $this;
}
function _IntOffset___get_x__impl__qiqr5o($this) {
  // Inline function 'androidx.compose.ui.util.unpackInt1' call
  var value = _IntOffset___get_packedValue__impl__982pbx($this);
  return convertToInt(shiftRight(value, 32));
}
function _IntOffset___get_y__impl__2avpwj($this) {
  // Inline function 'androidx.compose.ui.util.unpackInt2' call
  var value = _IntOffset___get_packedValue__impl__982pbx($this);
  return convertToInt(bitwiseAnd(value, new Long(-1, 0)));
}
function IntOffset__toString_impl_h46d8h($this) {
  return '(' + _IntOffset___get_x__impl__qiqr5o($this) + ', ' + _IntOffset___get_y__impl__2avpwj($this) + ')';
}
function Companion_1() {
}
var Companion_instance_1;
function Companion_getInstance_1() {
  return Companion_instance_1;
}
function IntOffset(packedValue) {
  this.f1_1 = packedValue;
}
protoOf(IntOffset).toString = function () {
  return IntOffset__toString_impl_h46d8h(this.f1_1);
};
var androidx_compose_ui_unit_IntRect$stable;
function _IntSize___init__impl__emcjft(packedValue) {
  return packedValue;
}
function _IntSize___get_packedValue__impl__uho7jf($this) {
  return $this;
}
function IntSize__toString_impl_54w9zl($this) {
  // Inline function 'androidx.compose.ui.unit.IntSize.width' call
  // Inline function 'androidx.compose.ui.util.unpackInt1' call
  var value = _IntSize___get_packedValue__impl__uho7jf($this);
  var tmp = convertToInt(shiftRight(value, 32));
  // Inline function 'androidx.compose.ui.unit.IntSize.height' call
  // Inline function 'androidx.compose.ui.util.unpackInt2' call
  var value_0 = _IntSize___get_packedValue__impl__uho7jf($this);
  return '' + tmp + ' x ' + convertToInt(bitwiseAnd(value_0, new Long(-1, 0)));
}
function Companion_2() {
}
var Companion_instance_2;
function Companion_getInstance_2() {
  return Companion_instance_2;
}
function IntSize(packedValue) {
  this.g1_1 = packedValue;
}
protoOf(IntSize).toString = function () {
  return IntSize__toString_impl_54w9zl(this.g1_1);
};
var androidx_compose_ui_unit_DpInsets$stable;
//region block: init
androidx_compose_ui_unit_ComposeUiUnitFlags$stable = 0;
androidx_compose_ui_unit_DpRect$stable = 0;
Companion_instance = new Companion();
Companion_instance_0 = new Companion_0();
Companion_instance_1 = new Companion_1();
androidx_compose_ui_unit_IntRect$stable = 0;
Companion_instance_2 = new Companion_2();
androidx_compose_ui_unit_DpInsets$stable = 0;
//endregion
//region block: exports
export {
  DpOffset as DpOffset2xcr695m4ap8z,
  Dp as Dp3t87qiepl9rb5,
  IntOffset as IntOffset2dvrfa3sc3t6x,
  IntSize as IntSizey6j89niu217h,
  _Dp___init__impl__ms3zkb as _Dp___init__impl__ms3zkbylhnpwwxwbyf,
  _Dp___get_value__impl__geb1vb as _Dp___get_value__impl__geb1vb26sbzucva829d,
  _DpOffset___init__impl__yq36wy as _DpOffset___init__impl__yq36wy2nfh4jbyh5tbx,
  _DpOffset___get_x__impl__uauqb5 as _DpOffset___get_x__impl__uauqb51eunqdkkog92o,
  _DpOffset___get_y__impl__1h898y as _DpOffset___get_y__impl__1h898y1enw06stmii8j,
  _IntOffset___init__impl__rq8h7b as _IntOffset___init__impl__rq8h7b329boo9j1oiiq,
  _IntOffset___get_x__impl__qiqr5o as _IntOffset___get_x__impl__qiqr5o3hkm8ok3j7g2u,
  _IntOffset___get_y__impl__2avpwj as _IntOffset___get_y__impl__2avpwj1c68f5mctv23l,
  _IntSize___init__impl__emcjft as _IntSize___init__impl__emcjft2q6yiw1n025h1,
  _IntSize___get_packedValue__impl__uho7jf as _IntSize___get_packedValue__impl__uho7jf5nbj4kff6wep,
};
//endregion

//# sourceMappingURL=compose-multiplatform-core-compose-ui-ui-unit.mjs.map
