import {
  toRawBits2035dtuolth0v as toRawBits,
  fromInt1lka3ktyu79a4 as fromInt,
  shiftLeft1ck77p6vapyra as shiftLeft,
  Long2qws0ah9gnpki as Long,
  bitwiseAnd2g7wmsfd45l12 as bitwiseAnd,
  bitwiseOr1ita6dahwp8zb as bitwiseOr,
} from './kotlin-kotlin-stdlib.mjs';
//region block: imports
//endregion
//region block: pre-declaration
//endregion
function _FloatFloatPair___init__impl__2q1dd3(packedValue) {
  return packedValue;
}
function _FloatFloatPair___get_packedValue__impl__5lczxp($this) {
  return $this;
}
function _FloatFloatPair___init__impl__2q1dd3_0(first, second) {
  // Inline function 'androidx.collection.packFloats' call
  var v1 = fromInt(toRawBits(first));
  var v2 = fromInt(toRawBits(second));
  var tmp$ret$0 = bitwiseOr(shiftLeft(v1, 32), bitwiseAnd(v2, new Long(-1, 0)));
  return _FloatFloatPair___init__impl__2q1dd3(tmp$ret$0);
}
//region block: exports
export {
  _FloatFloatPair___init__impl__2q1dd3_0 as _FloatFloatPair___init__impl__2q1dd333y772up0sk66,
  _FloatFloatPair___get_packedValue__impl__5lczxp as _FloatFloatPair___get_packedValue__impl__5lczxp31q07450qshb0,
};
//endregion

//# sourceMappingURL=androidx-collection-collection.mjs.map
