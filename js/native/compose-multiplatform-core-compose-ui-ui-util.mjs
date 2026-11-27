import {
  toRawBits2035dtuolth0v as toRawBits,
  fromInt1lka3ktyu79a4 as fromInt,
  Long2qws0ah9gnpki as Long,
  bitwiseAnd2g7wmsfd45l12 as bitwiseAnd,
  divide3tol6kxdi8xn6 as divide,
  convertToIntofdoxh9bstof as convertToInt,
  FloatCompanionObject_instanceokgc3apyetrg as FloatCompanionObject_instance,
  floatFromBits1n9d03e2m5i5s as floatFromBits,
} from './kotlin-kotlin-stdlib.mjs';
//region block: imports
//endregion
//region block: pre-declaration
//endregion
function fastCbrt(x) {
  var v = bitwiseAnd(fromInt(toRawBits(x)), new Long(-1, 1));
  // Inline function 'kotlin.Long.div' call
  var tmp$ret$0 = divide(v, fromInt(3));
  // Inline function 'androidx.compose.ui.util.floatFromBits' call
  // Inline function 'kotlin.fromBits' call
  var bits = 709952852 + convertToInt(tmp$ret$0) | 0;
  var estimate = floatFromBits(bits);
  estimate = estimate - (estimate - x / (estimate * estimate)) * (1.0 / 3.0);
  estimate = estimate - (estimate - x / (estimate * estimate)) * (1.0 / 3.0);
  return estimate;
}
//region block: exports
export {
  fastCbrt as fastCbrtvvso7sl1jpyf,
};
//endregion

//# sourceMappingURL=compose-multiplatform-core-compose-ui-ui-util.mjs.map
