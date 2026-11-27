import {
  VOID3gxj6tk5isa35 as VOID,
  isNaN3ixot6a1mjs5h as isNaN_0,
  Unit_instance3kz1zqli6gr1r as Unit_instance,
} from './kotlin-kotlin-stdlib.mjs';
import { _FloatFloatPair___init__impl__2q1dd333y772up0sk66 as _FloatFloatPair___init__impl__2q1dd3 } from './androidx-collection-collection.mjs';
import { fastCbrtvvso7sl1jpyf as fastCbrt } from './compose-multiplatform-core-compose-ui-ui-util.mjs';
//region block: imports
//endregion
//region block: pre-declaration
//endregion
var androidx_compose_ui_graphics_BaseMeshGradientRenderer$stable;
var androidx_compose_ui_graphics_BaseShaderMeshGradientRenderer$stable;
function computeCubicVerticalBounds(p0y, p1y, p2y, p3y, roots, index) {
  index = index === VOID ? 0 : index;
  var d0 = 3.0 * (p1y - p0y);
  var d1 = 3.0 * (p2y - p1y);
  var d2 = 3.0 * (p3y - p2y);
  var count = findQuadraticRoots(d0, d1, d2, roots, index);
  var dd0 = 2.0 * (d1 - d0);
  var dd1 = 2.0 * (d2 - d1);
  var tmp = count;
  // Inline function 'androidx.compose.ui.graphics.findLineRoot' call
  var index_0 = index + count | 0;
  count = tmp + writeValidRootInUnitRange(-dd0 / (dd1 - dd0), roots, index_0) | 0;
  // Inline function 'kotlin.math.min' call
  var minY = Math.min(p0y, p3y);
  // Inline function 'kotlin.math.max' call
  var maxY = Math.max(p0y, p3y);
  var inductionVariable = 0;
  var last = count;
  if (inductionVariable < last)
    do {
      var i = inductionVariable;
      inductionVariable = inductionVariable + 1 | 0;
      var t = roots[i];
      var y = evaluateCubic_0(p0y, p1y, p2y, p3y, t);
      // Inline function 'kotlin.math.min' call
      var a = minY;
      minY = Math.min(a, y);
      // Inline function 'kotlin.math.max' call
      var a_0 = maxY;
      maxY = Math.max(a_0, y);
    }
     while (inductionVariable < last);
  return _FloatFloatPair___init__impl__2q1dd3(minY, maxY);
}
function findFirstCubicRoot(p0, p1, p2, p3) {
  var a = 3.0 * (p0 - 2.0 * p1 + p2);
  var b = 3.0 * (p1 - p0);
  var c = p0;
  var d = -p0 + 3.0 * (p1 - p2) + p3;
  // Inline function 'androidx.compose.ui.graphics.closeTo' call
  // Inline function 'kotlin.math.abs' call
  var x = d - 0.0;
  if (Math.abs(x) < 1.0E-7) {
    // Inline function 'androidx.compose.ui.graphics.closeTo' call
    // Inline function 'kotlin.math.abs' call
    var x_0 = a - 0.0;
    if (Math.abs(x_0) < 1.0E-7) {
      // Inline function 'androidx.compose.ui.graphics.closeTo' call
      // Inline function 'kotlin.math.abs' call
      var x_1 = b - 0.0;
      if (Math.abs(x_1) < 1.0E-7) {
        return NaN;
      }
      // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
      var r = -c / b;
      // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
      // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
      // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
      var this_0 = r < 0.0 ? 0.0 : r;
      var s = this_0 > 1.0 ? 1.0 : this_0;
      var tmp;
      // Inline function 'kotlin.math.abs' call
      var x_2 = s - r;
      if (Math.abs(x_2) > 1.05E-6) {
        tmp = NaN;
      } else {
        tmp = s;
      }
      return tmp;
    } else {
      // Inline function 'kotlin.math.sqrt' call
      var x_3 = b * b - 4.0 * a * c;
      var q = Math.sqrt(x_3);
      var a2 = 2.0 * a;
      // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
      var r_0 = (q - b) / a2;
      // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
      // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
      // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
      var this_1 = r_0 < 0.0 ? 0.0 : r_0;
      var s_0 = this_1 > 1.0 ? 1.0 : this_1;
      var tmp_0;
      // Inline function 'kotlin.math.abs' call
      var x_4 = s_0 - r_0;
      if (Math.abs(x_4) > 1.05E-6) {
        tmp_0 = NaN;
      } else {
        tmp_0 = s_0;
      }
      var root = tmp_0;
      if (!isNaN_0(root))
        return root;
      // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
      var r_1 = (-b - q) / a2;
      // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
      // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
      // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
      var this_2 = r_1 < 0.0 ? 0.0 : r_1;
      var s_1 = this_2 > 1.0 ? 1.0 : this_2;
      var tmp_1;
      // Inline function 'kotlin.math.abs' call
      var x_5 = s_1 - r_1;
      if (Math.abs(x_5) > 1.05E-6) {
        tmp_1 = NaN;
      } else {
        tmp_1 = s_1;
      }
      return tmp_1;
    }
  }
  a = a / d;
  b = b / d;
  c = c / d;
  var o3 = (3.0 * b - a * a) / 9.0;
  var q2 = (2.0 * a * a * a - 9.0 * a * b + 27.0 * c) / 54.0;
  var discriminant = q2 * q2 + o3 * o3 * o3;
  var a3 = a / 3.0;
  if (discriminant < 0.0) {
    var mp33 = -(o3 * o3 * o3);
    // Inline function 'kotlin.math.sqrt' call
    var r_2 = Math.sqrt(mp33);
    var t = -q2 / r_2;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    var minimumValue = -1.0;
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_3 = t < minimumValue ? minimumValue : t;
    var cosPhi = this_3 > 1.0 ? 1.0 : this_3;
    // Inline function 'kotlin.math.acos' call
    var phi = Math.acos(cosPhi);
    var t1 = 2.0 * fastCbrt(r_2);
    // Inline function 'kotlin.math.cos' call
    var x_6 = phi / 3.0;
    // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
    var r_3 = t1 * Math.cos(x_6) - a3;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_4 = r_3 < 0.0 ? 0.0 : r_3;
    var s_2 = this_4 > 1.0 ? 1.0 : this_4;
    var tmp_2;
    // Inline function 'kotlin.math.abs' call
    var x_7 = s_2 - r_3;
    if (Math.abs(x_7) > 1.05E-6) {
      tmp_2 = NaN;
    } else {
      tmp_2 = s_2;
    }
    var root_0 = tmp_2;
    if (!isNaN_0(root_0))
      return root_0;
    // Inline function 'kotlin.math.cos' call
    var x_8 = (phi + 6.283185307179586) / 3.0;
    // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
    var r_4 = t1 * Math.cos(x_8) - a3;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_5 = r_4 < 0.0 ? 0.0 : r_4;
    var s_3 = this_5 > 1.0 ? 1.0 : this_5;
    var tmp_3;
    // Inline function 'kotlin.math.abs' call
    var x_9 = s_3 - r_4;
    if (Math.abs(x_9) > 1.05E-6) {
      tmp_3 = NaN;
    } else {
      tmp_3 = s_3;
    }
    root_0 = tmp_3;
    if (!isNaN_0(root_0))
      return root_0;
    // Inline function 'kotlin.math.cos' call
    var x_10 = (phi + 2.0 * 6.283185307179586) / 3.0;
    // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
    var r_5 = t1 * Math.cos(x_10) - a3;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_6 = r_5 < 0.0 ? 0.0 : r_5;
    var s_4 = this_6 > 1.0 ? 1.0 : this_6;
    var tmp_4;
    // Inline function 'kotlin.math.abs' call
    var x_11 = s_4 - r_5;
    if (Math.abs(x_11) > 1.05E-6) {
      tmp_4 = NaN;
    } else {
      tmp_4 = s_4;
    }
    return tmp_4;
  } else if (discriminant === 0.0) {
    var u1 = -fastCbrt(q2);
    // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
    var r_6 = 2.0 * u1 - a3;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_7 = r_6 < 0.0 ? 0.0 : r_6;
    var s_5 = this_7 > 1.0 ? 1.0 : this_7;
    var tmp_5;
    // Inline function 'kotlin.math.abs' call
    var x_12 = s_5 - r_6;
    if (Math.abs(x_12) > 1.05E-6) {
      tmp_5 = NaN;
    } else {
      tmp_5 = s_5;
    }
    var root_1 = tmp_5;
    if (!isNaN_0(root_1))
      return root_1;
    // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
    var r_7 = -u1 - a3;
    // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
    // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
    var this_8 = r_7 < 0.0 ? 0.0 : r_7;
    var s_6 = this_8 > 1.0 ? 1.0 : this_8;
    var tmp_6;
    // Inline function 'kotlin.math.abs' call
    var x_13 = s_6 - r_7;
    if (Math.abs(x_13) > 1.05E-6) {
      tmp_6 = NaN;
    } else {
      tmp_6 = s_6;
    }
    return tmp_6;
  }
  // Inline function 'kotlin.math.sqrt' call
  var sd = Math.sqrt(discriminant);
  var u1_0 = fastCbrt(-q2 + sd);
  var v1 = fastCbrt(q2 + sd);
  // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
  var r_8 = u1_0 - v1 - a3;
  // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
  // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
  // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
  var this_9 = r_8 < 0.0 ? 0.0 : r_8;
  var s_7 = this_9 > 1.0 ? 1.0 : this_9;
  var tmp_7;
  // Inline function 'kotlin.math.abs' call
  var x_14 = s_7 - r_8;
  if (Math.abs(x_14) > 1.05E-6) {
    tmp_7 = NaN;
  } else {
    tmp_7 = s_7;
  }
  return tmp_7;
}
function evaluateCubic(p1, p2, t) {
  var a = 1.0 / 3.0 + (p1 - p2);
  var b = p2 - 2.0 * p1;
  var c = p1;
  return 3.0 * ((a * t + b) * t + c) * t;
}
function findQuadraticRoots(p0, p1, p2, roots, index) {
  index = index === VOID ? 0 : index;
  var a = p0;
  var b = p1;
  var c = p2;
  var d = a - 2.0 * b + c;
  var rootCount = 0;
  if (!(d === 0.0)) {
    // Inline function 'kotlin.math.sqrt' call
    var x = b * b - a * c;
    var v1 = -Math.sqrt(x);
    var v2 = -a + b;
    rootCount = rootCount + writeValidRootInUnitRange(-(v1 + v2) / d, roots, index) | 0;
    rootCount = rootCount + writeValidRootInUnitRange((v1 - v2) / d, roots, index + rootCount | 0) | 0;
    if (rootCount > 1) {
      var s = roots[index];
      var t = roots[index + 1 | 0];
      if (s > t) {
        roots[index] = t;
        roots[index + 1 | 0] = s;
      } else if (s === t) {
        rootCount = rootCount - 1 | 0;
      }
    }
  } else if (!(b === c)) {
    rootCount = rootCount + writeValidRootInUnitRange((2.0 * b - c) / (2.0 * b - 2.0 * c), roots, index) | 0;
  }
  return rootCount;
}
function evaluateCubic_0(p0, p1, p2, p3, t) {
  var a = p3 + 3.0 * (p1 - p2) - p0;
  var b = 3.0 * (p2 - 2.0 * p1 + p0);
  var c = 3.0 * (p1 - p0);
  return ((a * t + b) * t + c) * t + p0;
}
function writeValidRootInUnitRange(r, roots, index) {
  // Inline function 'androidx.compose.ui.graphics.clampValidRootInUnitRange' call
  // Inline function 'androidx.compose.ui.util.fastCoerceIn' call
  // Inline function 'androidx.compose.ui.util.fastCoerceAtLeast' call
  // Inline function 'androidx.compose.ui.util.fastCoerceAtMost' call
  var this_0 = r < 0.0 ? 0.0 : r;
  var s = this_0 > 1.0 ? 1.0 : this_0;
  var tmp;
  // Inline function 'kotlin.math.abs' call
  var x = s - r;
  if (Math.abs(x) > 1.05E-6) {
    tmp = NaN;
  } else {
    tmp = s;
  }
  var v = tmp;
  roots[index] = v;
  return isNaN_0(v) ? 0 : 1;
}
var androidx_compose_ui_graphics_Brush$stable;
var androidx_compose_ui_graphics_SolidColor$stable;
var androidx_compose_ui_graphics_LinearGradient$stable;
var androidx_compose_ui_graphics_RadialGradient$stable;
var androidx_compose_ui_graphics_CompositeShaderBrush$stable;
var androidx_compose_ui_graphics_SweepGradient$stable;
var androidx_compose_ui_graphics_ShaderBrush$stable;
var androidx_compose_ui_graphics_ColorFilter$stable;
var androidx_compose_ui_graphics_BlendModeColorFilter$stable;
var androidx_compose_ui_graphics_ColorMatrixColorFilter$stable;
var androidx_compose_ui_graphics_LightingColorFilter$stable;
var androidx_compose_ui_graphics_DefaultMeshGradientRenderer$stable;
var androidx_compose_ui_graphics_LayerOutsets$stable;
var androidx_compose_ui_graphics_MeshGradientPainter$stable;
var androidx_compose_ui_graphics_MeshGradientConfig$stable;
var androidx_compose_ui_graphics_Outline_Rectangle$stable;
var androidx_compose_ui_graphics_Outline_Rounded$stable;
var androidx_compose_ui_graphics_Outline_Generic$stable;
var androidx_compose_ui_graphics_Outline$stable;
var androidx_compose_ui_graphics_PixelMap$stable;
var androidx_compose_ui_graphics_Shadow$stable;
var androidx_compose_ui_graphics_Vertices$stable;
var androidx_compose_ui_graphics_blur_BlurShaders$stable;
var androidx_compose_ui_graphics_blur_BlurStop$stable;
var androidx_compose_ui_graphics_blur_BlurUniform$stable;
var androidx_compose_ui_graphics_blur_BlurVerticalGradient$stable;
var androidx_compose_ui_graphics_blur_BlurVerticalStops$stable;
var androidx_compose_ui_graphics_blur_BlurHorizontalGradient$stable;
var androidx_compose_ui_graphics_blur_BlurHorizontalStops$stable;
var androidx_compose_ui_graphics_blur_BlurLinearGradient$stable;
var androidx_compose_ui_graphics_blur_BlurLinearStops$stable;
var androidx_compose_ui_graphics_blur_BlurRadialGradient$stable;
var androidx_compose_ui_graphics_blur_BlurRadialStops$stable;
var androidx_compose_ui_graphics_blur_BlurRadiusShader$stable;
var androidx_compose_ui_graphics_colorspace_Adaptation$stable;
var androidx_compose_ui_graphics_colorspace_ColorSpace$stable;
var androidx_compose_ui_graphics_colorspace_ColorSpaces$stable;
var androidx_compose_ui_graphics_colorspace_Illuminant$stable;
var androidx_compose_ui_graphics_colorspace_Lab$stable;
var androidx_compose_ui_graphics_colorspace_Oklab$stable;
var androidx_compose_ui_graphics_colorspace_Rgb$stable;
var androidx_compose_ui_graphics_colorspace_TransferParameters$stable;
var androidx_compose_ui_graphics_colorspace_WhitePoint$stable;
var androidx_compose_ui_graphics_colorspace_Xyz$stable;
var androidx_compose_ui_graphics_drawscope_CanvasDrawScope_DrawParams$stable;
var androidx_compose_ui_graphics_drawscope_CanvasDrawScope$stable;
var androidx_compose_ui_graphics_drawscope_DrawStyle$stable;
var androidx_compose_ui_graphics_drawscope_Fill$stable;
var androidx_compose_ui_graphics_drawscope_Stroke$stable;
var androidx_compose_ui_graphics_drawscope_EmptyCanvas$stable;
var androidx_compose_ui_graphics_layer_ChildLayerDependenciesTracker$stable;
var androidx_compose_ui_graphics_painter_BitmapPainter$stable;
var androidx_compose_ui_graphics_painter_BrushPainter$stable;
var androidx_compose_ui_graphics_painter_ColorPainter$stable;
var androidx_compose_ui_graphics_painter_Painter$stable;
var androidx_compose_ui_graphics_shadow_DropShadowPainter$stable;
var androidx_compose_ui_graphics_shadow_DropShadowRenderer$stable;
var androidx_compose_ui_graphics_shadow_InnerShadowPainter$stable;
var androidx_compose_ui_graphics_shadow_InnerShadowRenderer$stable;
var androidx_compose_ui_graphics_shadow_Shadow$stable;
var androidx_compose_ui_graphics_shadow_ShadowRenderer$stable;
var androidx_compose_ui_graphics_vector_PathBuilder$stable;
var androidx_compose_ui_graphics_vector_PathNode_Close$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeMoveTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_MoveTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeLineTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_LineTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeHorizontalTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_HorizontalTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeVerticalTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_VerticalTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeCurveTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_CurveTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeReflectiveCurveTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_ReflectiveCurveTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeQuadTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_QuadTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeReflectiveQuadTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_ReflectiveQuadTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_RelativeArcTo$stable;
var androidx_compose_ui_graphics_vector_PathNode_ArcTo$stable;
var androidx_compose_ui_graphics_vector_PathNode$stable;
var androidx_compose_ui_graphics_Shader$stable;
var androidx_compose_ui_graphics_TransformShader$stable;
var androidx_compose_ui_graphics_layer_GraphicsLayer$stable;
var androidx_compose_ui_graphics_platform_PlatformBlurFilter$stable;
var androidx_compose_ui_graphics_platform_PlatformColorFilter$stable;
var androidx_compose_ui_graphics_platform_PlatformGraphicsContext$stable;
var androidx_compose_ui_graphics_platform_PlatformGraphicsRegistry$stable;
var androidx_compose_ui_graphics_RenderEffect$stable;
var androidx_compose_ui_graphics_CustomPlatformRenderEffect$stable;
var androidx_compose_ui_graphics_BlurEffect$stable;
var androidx_compose_ui_graphics_OffsetEffect$stable;
var androidx_compose_ui_graphics_SkikoGraphicsCompatRegistry$stable;
//region block: init
androidx_compose_ui_graphics_BaseMeshGradientRenderer$stable = 8;
androidx_compose_ui_graphics_BaseShaderMeshGradientRenderer$stable = 8;
androidx_compose_ui_graphics_Brush$stable = 0;
androidx_compose_ui_graphics_SolidColor$stable = 0;
androidx_compose_ui_graphics_LinearGradient$stable = 0;
androidx_compose_ui_graphics_RadialGradient$stable = 0;
androidx_compose_ui_graphics_CompositeShaderBrush$stable = 0;
androidx_compose_ui_graphics_SweepGradient$stable = 0;
androidx_compose_ui_graphics_ShaderBrush$stable = 0;
androidx_compose_ui_graphics_ColorFilter$stable = 0;
androidx_compose_ui_graphics_BlendModeColorFilter$stable = 0;
androidx_compose_ui_graphics_ColorMatrixColorFilter$stable = 0;
androidx_compose_ui_graphics_LightingColorFilter$stable = 0;
androidx_compose_ui_graphics_DefaultMeshGradientRenderer$stable = 8;
androidx_compose_ui_graphics_LayerOutsets$stable = 0;
androidx_compose_ui_graphics_MeshGradientPainter$stable = 8;
androidx_compose_ui_graphics_MeshGradientConfig$stable = 8;
androidx_compose_ui_graphics_Outline_Rectangle$stable = 0;
androidx_compose_ui_graphics_Outline_Rounded$stable = 0;
androidx_compose_ui_graphics_Outline_Generic$stable = 8;
androidx_compose_ui_graphics_Outline$stable = 8;
androidx_compose_ui_graphics_PixelMap$stable = 8;
androidx_compose_ui_graphics_Shadow$stable = 0;
androidx_compose_ui_graphics_Vertices$stable = 8;
androidx_compose_ui_graphics_blur_BlurShaders$stable = 0;
androidx_compose_ui_graphics_blur_BlurStop$stable = 0;
androidx_compose_ui_graphics_blur_BlurUniform$stable = 0;
androidx_compose_ui_graphics_blur_BlurVerticalGradient$stable = 0;
androidx_compose_ui_graphics_blur_BlurVerticalStops$stable = 0;
androidx_compose_ui_graphics_blur_BlurHorizontalGradient$stable = 0;
androidx_compose_ui_graphics_blur_BlurHorizontalStops$stable = 0;
androidx_compose_ui_graphics_blur_BlurLinearGradient$stable = 0;
androidx_compose_ui_graphics_blur_BlurLinearStops$stable = 0;
androidx_compose_ui_graphics_blur_BlurRadialGradient$stable = 0;
androidx_compose_ui_graphics_blur_BlurRadialStops$stable = 0;
androidx_compose_ui_graphics_blur_BlurRadiusShader$stable = 0;
androidx_compose_ui_graphics_colorspace_Adaptation$stable = 8;
androidx_compose_ui_graphics_colorspace_ColorSpace$stable = 8;
androidx_compose_ui_graphics_colorspace_ColorSpaces$stable = 0;
androidx_compose_ui_graphics_colorspace_Illuminant$stable = 0;
androidx_compose_ui_graphics_colorspace_Lab$stable = 0;
androidx_compose_ui_graphics_colorspace_Oklab$stable = 0;
androidx_compose_ui_graphics_colorspace_Rgb$stable = 8;
androidx_compose_ui_graphics_colorspace_TransferParameters$stable = 0;
androidx_compose_ui_graphics_colorspace_WhitePoint$stable = 0;
androidx_compose_ui_graphics_colorspace_Xyz$stable = 0;
androidx_compose_ui_graphics_drawscope_CanvasDrawScope_DrawParams$stable = 8;
androidx_compose_ui_graphics_drawscope_CanvasDrawScope$stable = 0;
androidx_compose_ui_graphics_drawscope_DrawStyle$stable = 8;
androidx_compose_ui_graphics_drawscope_Fill$stable = 0;
androidx_compose_ui_graphics_drawscope_Stroke$stable = 8;
androidx_compose_ui_graphics_drawscope_EmptyCanvas$stable = 0;
androidx_compose_ui_graphics_layer_ChildLayerDependenciesTracker$stable = 8;
androidx_compose_ui_graphics_painter_BitmapPainter$stable = 8;
androidx_compose_ui_graphics_painter_BrushPainter$stable = 8;
androidx_compose_ui_graphics_painter_ColorPainter$stable = 8;
androidx_compose_ui_graphics_painter_Painter$stable = 8;
androidx_compose_ui_graphics_shadow_DropShadowPainter$stable = 8;
androidx_compose_ui_graphics_shadow_DropShadowRenderer$stable = 8;
androidx_compose_ui_graphics_shadow_InnerShadowPainter$stable = 8;
androidx_compose_ui_graphics_shadow_InnerShadowRenderer$stable = 8;
androidx_compose_ui_graphics_shadow_Shadow$stable = 0;
androidx_compose_ui_graphics_shadow_ShadowRenderer$stable = 8;
androidx_compose_ui_graphics_vector_PathBuilder$stable = 8;
androidx_compose_ui_graphics_vector_PathNode_Close$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeMoveTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_MoveTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeLineTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_LineTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeHorizontalTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_HorizontalTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeVerticalTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_VerticalTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeCurveTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_CurveTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeReflectiveCurveTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_ReflectiveCurveTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeQuadTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_QuadTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeReflectiveQuadTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_ReflectiveQuadTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_RelativeArcTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode_ArcTo$stable = 0;
androidx_compose_ui_graphics_vector_PathNode$stable = 0;
androidx_compose_ui_graphics_Shader$stable = 8;
androidx_compose_ui_graphics_TransformShader$stable = 8;
androidx_compose_ui_graphics_layer_GraphicsLayer$stable = 8;
androidx_compose_ui_graphics_platform_PlatformBlurFilter$stable = 8;
androidx_compose_ui_graphics_platform_PlatformColorFilter$stable = 8;
androidx_compose_ui_graphics_platform_PlatformGraphicsContext$stable = 8;
androidx_compose_ui_graphics_platform_PlatformGraphicsRegistry$stable = 0;
androidx_compose_ui_graphics_RenderEffect$stable = 0;
androidx_compose_ui_graphics_CustomPlatformRenderEffect$stable = 0;
androidx_compose_ui_graphics_BlurEffect$stable = 0;
androidx_compose_ui_graphics_OffsetEffect$stable = 0;
androidx_compose_ui_graphics_SkikoGraphicsCompatRegistry$stable = 0;
//endregion
//region block: exports
export {
  computeCubicVerticalBounds as computeCubicVerticalBoundse106b82in60d,
  evaluateCubic as evaluateCubiczqswofrromdd,
  findFirstCubicRoot as findFirstCubicRoottq5suyhwnejp,
};
//endregion

//# sourceMappingURL=compose-multiplatform-core-compose-ui-ui-graphics.mjs.map
