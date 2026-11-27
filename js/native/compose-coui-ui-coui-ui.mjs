import {
  CubicBezierEasing2lokozmur33uw as CubicBezierEasing,
  springm5n3xad0398a as spring,
} from './compose-multiplatform-core-compose-animation-animation-core.mjs';
import {
  protoOf180f3jzyo7rfj as protoOf,
  initMetadataForCompanion1wyw17z38v6ac as initMetadataForCompanion,
  VOID3gxj6tk5isa35 as VOID,
  isNaNymqb93xtq8w8 as isNaN_0,
  coerceAtLeast1b3m6f7g22ivr as coerceAtLeast,
  initMetadataForClassbxx6q50dy2s7 as initMetadataForClass,
  toString1pkumu07cwy4m as toString,
} from './kotlin-kotlin-stdlib.mjs';
//region block: imports
var sinh = Math.sinh;
var cosh = Math.cosh;
//endregion
//region block: pre-declaration
initMetadataForCompanion(Companion);
initMetadataForClass(COUISpringEasing, 'COUISpringEasing');
initMetadataForClass(SinkFeedback, 'SinkFeedback', SinkFeedback);
//endregion
var io_github_suqi8_coui_kmp_anim_AccelerateEasing$stable;
function get_COUIEaseEasing() {
  _init_properties_COUIEaseInterpolators_kt__jjs9pw();
  return COUIEaseEasing;
}
var COUIEaseEasing;
function get_COUIInEaseEasing() {
  _init_properties_COUIEaseInterpolators_kt__jjs9pw();
  return COUIInEaseEasing;
}
var COUIInEaseEasing;
function get_COUIMoveEaseEasing() {
  _init_properties_COUIEaseInterpolators_kt__jjs9pw();
  return COUIMoveEaseEasing;
}
var COUIMoveEaseEasing;
function get_COUIOutEaseEasing() {
  _init_properties_COUIEaseInterpolators_kt__jjs9pw();
  return COUIOutEaseEasing;
}
var COUIOutEaseEasing;
var properties_initialized_COUIEaseInterpolators_kt_lxkg1a;
function _init_properties_COUIEaseInterpolators_kt__jjs9pw() {
  if (!properties_initialized_COUIEaseInterpolators_kt_lxkg1a) {
    properties_initialized_COUIEaseInterpolators_kt_lxkg1a = true;
    COUIEaseEasing = new CubicBezierEasing(0.33, 0.0, 0.67, 1.0);
    COUIInEaseEasing = new CubicBezierEasing(0.0, 0.0, 0.1, 1.0);
    COUIMoveEaseEasing = new CubicBezierEasing(0.3, 0.0, 0.1, 1.0);
    COUIOutEaseEasing = new CubicBezierEasing(0.3, 0.0, 1.0, 1.0);
  }
}
var io_github_suqi8_coui_kmp_anim_COUISpringEasing$stable;
function raw($this, t) {
  // Inline function 'kotlin.math.exp' call
  var x = -$this.g4_1 * $this.f4_1 * t;
  var decay = Math.exp(x);
  var tmp;
  if ($this.g4_1 < 1.0) {
    // Inline function 'kotlin.math.cos' call
    var x_0 = $this.h4_1 * t;
    var tmp_0 = Math.cos(x_0);
    // Inline function 'kotlin.math.sin' call
    var x_1 = $this.h4_1 * t;
    var tmp$ret$2 = Math.sin(x_1);
    tmp = 1.0 - decay * (tmp_0 + $this.i4_1 * tmp$ret$2);
  } else if ($this.g4_1 === 1.0) {
    var tmp_1 = $this.i4_1 * t + 1.0;
    // Inline function 'kotlin.math.exp' call
    var x_2 = -$this.f4_1 * t;
    tmp = 1.0 - tmp_1 * Math.exp(x_2);
  } else {
    // Inline function 'kotlin.math.sqrt' call
    var x_3 = $this.g4_1 * $this.g4_1 - 1.0;
    var tmp$ret$4 = Math.sqrt(x_3);
    var s = $this.f4_1 * tmp$ret$4;
    var tmp_2 = decay / s;
    var tmp_3 = $this.g4_1 * $this.f4_1;
    // Inline function 'kotlin.math.sinh' call
    var x_4 = s * t;
    var tmp_4 = tmp_3 * sinh(x_4);
    // Inline function 'kotlin.math.cosh' call
    var x_5 = s * t;
    tmp = 1.0 - tmp_2 * (tmp_4 + s * cosh(x_5));
  }
  return tmp;
}
function Companion() {
  this.k4_1 = 1.15;
}
var Companion_instance;
function Companion_getInstance() {
  return Companion_instance;
}
function COUISpringEasing(response, bounce) {
  bounce = bounce === VOID ? 0.0 : bounce;
  this.d4_1 = response;
  this.e4_1 = bounce;
  this.f4_1 = 2.0 * 3.141592653589793 / (this.d4_1 === 0.0 ? 1.0 : this.d4_1);
  var tmp = this;
  // Inline function 'kotlin.let' call
  var it = 1.0 - this.e4_1;
  tmp.g4_1 = it <= 0.0 ? 1.15 : it;
  var tmp_0 = this;
  var tmp_1;
  if (this.g4_1 < 1.0) {
    // Inline function 'kotlin.math.sqrt' call
    var x = 1.0 - this.g4_1 * this.g4_1;
    tmp_1 = Math.sqrt(x) * this.f4_1;
  } else {
    tmp_1 = 0.0;
  }
  tmp_0.h4_1 = tmp_1;
  this.i4_1 = this.g4_1 < 1.0 ? this.g4_1 * this.f4_1 / this.h4_1 : this.g4_1 === 1.0 ? this.f4_1 : this.g4_1 * this.f4_1;
  var tmp_2 = this;
  // Inline function 'kotlin.let' call
  var it_0 = raw(this, 1.0);
  tmp_2.j4_1 = it_0 === 0.0 || isNaN_0(it_0) ? 1.0 : it_0;
}
protoOf(COUISpringEasing).b3 = function (fraction) {
  return raw(this, coerceAtLeast(fraction, 0.0)) / this.j4_1;
};
protoOf(COUISpringEasing).toString = function () {
  return 'COUISpringEasing(response=' + this.d4_1 + ', bounce=' + this.e4_1 + ')';
};
function couiSpring(response, bounce, visibilityThreshold) {
  bounce = bounce === VOID ? 0.0 : bounce;
  visibilityThreshold = visibilityThreshold === VOID ? null : visibilityThreshold;
  var omega = 2.0 * 3.141592653589793 / (response === 0.0 ? 1.0 : response);
  return spring(coerceAtLeast(1.0 - bounce, 0.0), omega * omega, visibilityThreshold);
}
var io_github_suqi8_coui_kmp_anim_DecelerateEasing$stable;
var io_github_suqi8_coui_kmp_basic_BreadcrumbItem$stable;
var io_github_suqi8_coui_kmp_basic_BreadcrumbBarDefaults$stable;
var io_github_suqi8_coui_kmp_basic_BreadcrumbBarColors$stable;
var PressedTintMinVisibleProgress;
var DescG2FontScale;
var io_github_suqi8_coui_kmp_basic_ButtonDefaults$stable;
var io_github_suqi8_coui_kmp_basic_ButtonColors$stable;
var io_github_suqi8_coui_kmp_basic_TextButtonColors$stable;
var io_github_suqi8_coui_kmp_basic_CameraInnerShadowLayer$stable;
var io_github_suqi8_coui_kmp_basic_CameraInnerShadowSpec$stable;
var io_github_suqi8_coui_kmp_basic_CameraInnerShadows$stable;
var io_github_suqi8_coui_kmp_basic_CameraLevelState$stable;
var io_github_suqi8_coui_kmp_basic_CameraLevelIndicatorDefaults$stable;
var io_github_suqi8_coui_kmp_basic_CameraLevelIndicatorColors$stable;
var RippleStartRadiusFraction;
var RippleFadeInDurationMillis;
var RippleGrowDurationMillis;
var RippleFadeOutDurationMillis;
var io_github_suqi8_coui_kmp_basic_CircularPressIndication$stable;
var io_github_suqi8_coui_kmp_basic_ColorSwatchPickerDefaults$stable;
var io_github_suqi8_coui_kmp_basic_BasicComponentDefaults$stable;
var io_github_suqi8_coui_kmp_basic_BasicComponentColors$stable;
var io_github_suqi8_coui_kmp_basic_CustomSnackbarDefaults$stable;
var io_github_suqi8_coui_kmp_basic_DateValue$stable;
var io_github_suqi8_coui_kmp_basic_DatePickerDefaults$stable;
var io_github_suqi8_coui_kmp_basic_DividerDefaults$stable;
var io_github_suqi8_coui_kmp_basic_EmptyStateDefaults$stable;
var io_github_suqi8_coui_kmp_basic_EmptyStateColors$stable;
var io_github_suqi8_coui_kmp_basic_FullPageStatementDefaults$stable;
var io_github_suqi8_coui_kmp_basic_FullPageStatementColors$stable;
var io_github_suqi8_coui_kmp_basic_IconButtonDefaults$stable;
var io_github_suqi8_coui_kmp_basic_ToolbarTextButtonColors$stable;
var io_github_suqi8_coui_kmp_basic_LinkTextDefaults$stable;
var io_github_suqi8_coui_kmp_basic_LinkTextColors$stable;
var io_github_suqi8_coui_kmp_basic_ListDetailLayoutDefaults$stable;
var DotCycleMillis;
var DotStaggerMillis;
var DotStartAlpha;
var DotMidAlpha;
var DotEndAlpha;
var io_github_suqi8_coui_kmp_basic_LoadingButtonDefaults$stable;
var io_github_suqi8_coui_kmp_basic_LunarDate$stable;
var io_github_suqi8_coui_kmp_basic_LunarCalendar$stable;
var io_github_suqi8_coui_kmp_basic_LunarDatePickerDefaults$stable;
var io_github_suqi8_coui_kmp_basic_MarqueeTextDefaults$stable;
var NumberPickerReferenceDensity;
var LabelCacheSize;
var io_github_suqi8_coui_kmp_basic_PickerSymbols$stable;
var io_github_suqi8_coui_kmp_basic_PopupSpotLight$stable;
var io_github_suqi8_coui_kmp_basic_PopupMenuIcons$stable;
var io_github_suqi8_coui_kmp_basic_PopupSurface$stable;
var io_github_suqi8_coui_kmp_basic_ResponsiveGridSpec_Grid$stable;
var io_github_suqi8_coui_kmp_basic_ResponsiveGridSpec_SpecificGap$stable;
var io_github_suqi8_coui_kmp_basic_ResponsiveGridSpec_SpecificSize$stable;
var io_github_suqi8_coui_kmp_basic_ResponsiveGridDefaults$stable;
var io_github_suqi8_coui_kmp_basic_ScrollBarColors$stable;
var io_github_suqi8_coui_kmp_basic_ScrollBarDefaults$stable;
var io_github_suqi8_coui_kmp_basic_LazyLineContentAdapter_VisibleLine$stable;
var io_github_suqi8_coui_kmp_basic_SearchBarCollapseGeometry$stable;
var io_github_suqi8_coui_kmp_basic_SearchBarCollapseDefaults$stable;
var io_github_suqi8_coui_kmp_basic_SideNavigationBarState$stable;
var io_github_suqi8_coui_kmp_basic_SideNavigationBarDefaults$stable;
var io_github_suqi8_coui_kmp_basic_SidePaneState$stable;
var io_github_suqi8_coui_kmp_basic_SidePaneLayoutDefaults$stable;
var io_github_suqi8_coui_kmp_basic_SmallTitleDefaults$stable;
var io_github_suqi8_coui_kmp_basic_StepperDefaults$stable;
var io_github_suqi8_coui_kmp_basic_StepperColors$stable;
var io_github_suqi8_coui_kmp_basic_SurfaceDefaults$stable;
var io_github_suqi8_coui_kmp_basic_TabWithSearchLayoutDefaults$stable;
var io_github_suqi8_coui_kmp_basic_TagViewColors$stable;
var io_github_suqi8_coui_kmp_basic_TagViewDefaults$stable;
var io_github_suqi8_coui_kmp_basic_TooltipArrowGeometry$stable;
var io_github_suqi8_coui_kmp_basic_TooltipMetrics$stable;
var io_github_suqi8_coui_kmp_basic_TooltipAnchorSpacing$stable;
var io_github_suqi8_coui_kmp_basic_TooltipPlacement$stable;
var io_github_suqi8_coui_kmp_basic_TopAppBarSearchState$stable;
var io_github_suqi8_coui_kmp_basic_TopAppBarSearchDefaults$stable;
var io_github_suqi8_coui_kmp_basic_TwoTextButtonDefaults$stable;
var io_github_suqi8_coui_kmp_color_core_Transforms$stable;
var io_github_suqi8_coui_kmp_color_space_Hsv$stable;
var io_github_suqi8_coui_kmp_color_space_OkHsv$stable;
var io_github_suqi8_coui_kmp_color_space_OkLab$stable;
var io_github_suqi8_coui_kmp_color_space_OkLch$stable;
var io_github_suqi8_coui_kmp_effect_TouchMotion$stable;
var io_github_suqi8_coui_kmp_effect_TouchMotionState$stable;
var io_github_suqi8_coui_kmp_effect_ConicLightShader$stable;
var io_github_suqi8_coui_kmp_effect_ConicLightState$stable;
var io_github_suqi8_coui_kmp_effect_MaterialStrokeParams$stable;
var io_github_suqi8_coui_kmp_effect_MaterialStrokePresets$stable;
var io_github_suqi8_coui_kmp_effect_SpringChainDefaults$stable;
var io_github_suqi8_coui_kmp_effect_SpringChainState$stable;
var _arrowRight;
var _arrowUpDown;
var _check;
var _close;
var _more;
var _reset;
var _search;
var _searchCleanup;
var _sidebar;
var io_github_suqi8_coui_kmp_interfaces_HoldDownInteraction_HoldDown$stable;
var io_github_suqi8_coui_kmp_interfaces_HoldDownInteraction_Release$stable;
var io_github_suqi8_coui_kmp_layout_InputDialogDefaults$stable;
var io_github_suqi8_coui_kmp_layout_ListDialogItem$stable;
var io_github_suqi8_coui_kmp_layout_ListDialogDefaults$stable;
var io_github_suqi8_coui_kmp_layout_ListDialogColors$stable;
var io_github_suqi8_coui_kmp_layout_NavigationPopupMenuDefaults$stable;
var io_github_suqi8_coui_kmp_layout_ProgressDialogDefaults$stable;
var io_github_suqi8_coui_kmp_theme_COUIFontScale$stable;
var io_github_suqi8_coui_kmp_theme_COUIRoundCorner_Normal$stable;
var io_github_suqi8_coui_kmp_theme_COUIRoundCorner_Large$stable;
var io_github_suqi8_coui_kmp_theme_COUIRoundCorner$stable;
var io_github_suqi8_coui_kmp_theme_COUITheme$stable;
var io_github_suqi8_coui_kmp_theme_COUIThemeColorTokens$stable;
var io_github_suqi8_coui_kmp_theme_COUIThemeColor$stable;
var io_github_suqi8_coui_kmp_theme_COUIThemeColors$stable;
var io_github_suqi8_coui_kmp_theme_MonetRoles$stable;
var io_github_suqi8_coui_kmp_utils_COUIFlingBehavior$stable;
var io_github_suqi8_coui_kmp_utils_COUILayoutGrid$stable;
var VerticalSpringBackTensionMultiple;
var HorizontalSpringBackTensionMultiple;
var io_github_suqi8_coui_kmp_utils_COUIPhysicalAnimation$stable;
var io_github_suqi8_coui_kmp_utils_COUIOverScrollRelease$stable;
var io_github_suqi8_coui_kmp_utils_COUIOverScrollAxis$stable;
var io_github_suqi8_coui_kmp_utils_COUISpringInterpolator$stable;
var io_github_suqi8_coui_kmp_utils_COUIReboundOverScroller$stable;
var io_github_suqi8_coui_kmp_utils_COUIOverscrollFactory$stable;
var io_github_suqi8_coui_kmp_utils_COUIOverscrollEffect$stable;
var io_github_suqi8_coui_kmp_utils_PercentWidthResult$stable;
var io_github_suqi8_coui_kmp_utils_PercentWidthDefaults$stable;
var io_github_suqi8_coui_kmp_utils_SinkFeedback$stable;
var io_github_suqi8_coui_kmp_utils_TiltFeedback$stable;
function SinkFeedback(sinkAmount, animationSpec) {
  sinkAmount = sinkAmount === VOID ? 0.94 : sinkAmount;
  animationSpec = animationSpec === VOID ? spring(0.8, 600.0) : animationSpec;
  this.l4_1 = sinkAmount;
  this.m4_1 = animationSpec;
}
protoOf(SinkFeedback).toString = function () {
  return 'SinkFeedback(sinkAmount=' + this.l4_1 + ', animationSpec=' + toString(this.m4_1) + ')';
};
var io_github_suqi8_coui_kmp_utils_PressableNode$stable;
var io_github_suqi8_coui_kmp_utils_AbstractPressableNode$stable;
var io_github_suqi8_coui_kmp_utils_PressGestureScopeImpl$stable;
var io_github_suqi8_coui_kmp_utils_SpringMath$stable;
var io_github_suqi8_coui_kmp_utils_SpringEngine$stable;
//region block: init
io_github_suqi8_coui_kmp_anim_AccelerateEasing$stable = 0;
io_github_suqi8_coui_kmp_anim_COUISpringEasing$stable = 0;
Companion_instance = new Companion();
io_github_suqi8_coui_kmp_anim_DecelerateEasing$stable = 0;
io_github_suqi8_coui_kmp_basic_BreadcrumbItem$stable = 0;
io_github_suqi8_coui_kmp_basic_BreadcrumbBarDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_BreadcrumbBarColors$stable = 0;
PressedTintMinVisibleProgress = 0.7;
DescG2FontScale = 1.15;
io_github_suqi8_coui_kmp_basic_ButtonDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_ButtonColors$stable = 0;
io_github_suqi8_coui_kmp_basic_TextButtonColors$stable = 0;
io_github_suqi8_coui_kmp_basic_CameraInnerShadowLayer$stable = 0;
io_github_suqi8_coui_kmp_basic_CameraInnerShadowSpec$stable = 0;
io_github_suqi8_coui_kmp_basic_CameraInnerShadows$stable = 0;
io_github_suqi8_coui_kmp_basic_CameraLevelState$stable = 0;
io_github_suqi8_coui_kmp_basic_CameraLevelIndicatorDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_CameraLevelIndicatorColors$stable = 0;
RippleStartRadiusFraction = 0.6;
RippleFadeInDurationMillis = 75;
RippleGrowDurationMillis = 225;
RippleFadeOutDurationMillis = 150;
io_github_suqi8_coui_kmp_basic_CircularPressIndication$stable = 0;
io_github_suqi8_coui_kmp_basic_ColorSwatchPickerDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_BasicComponentDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_BasicComponentColors$stable = 0;
io_github_suqi8_coui_kmp_basic_CustomSnackbarDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_DateValue$stable = 0;
io_github_suqi8_coui_kmp_basic_DatePickerDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_DividerDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_EmptyStateDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_EmptyStateColors$stable = 0;
io_github_suqi8_coui_kmp_basic_FullPageStatementDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_FullPageStatementColors$stable = 0;
io_github_suqi8_coui_kmp_basic_IconButtonDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_ToolbarTextButtonColors$stable = 0;
io_github_suqi8_coui_kmp_basic_LinkTextDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_LinkTextColors$stable = 0;
io_github_suqi8_coui_kmp_basic_ListDetailLayoutDefaults$stable = 0;
DotCycleMillis = 1332;
DotStaggerMillis = 333;
DotStartAlpha = 0.2;
DotMidAlpha = 0.5;
DotEndAlpha = 1.0;
io_github_suqi8_coui_kmp_basic_LoadingButtonDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_LunarDate$stable = 0;
io_github_suqi8_coui_kmp_basic_LunarCalendar$stable = 0;
io_github_suqi8_coui_kmp_basic_LunarDatePickerDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_MarqueeTextDefaults$stable = 0;
NumberPickerReferenceDensity = 3.5;
LabelCacheSize = 64;
io_github_suqi8_coui_kmp_basic_PickerSymbols$stable = 0;
io_github_suqi8_coui_kmp_basic_PopupSpotLight$stable = 0;
io_github_suqi8_coui_kmp_basic_PopupMenuIcons$stable = 0;
io_github_suqi8_coui_kmp_basic_PopupSurface$stable = 0;
io_github_suqi8_coui_kmp_basic_ResponsiveGridSpec_Grid$stable = 0;
io_github_suqi8_coui_kmp_basic_ResponsiveGridSpec_SpecificGap$stable = 0;
io_github_suqi8_coui_kmp_basic_ResponsiveGridSpec_SpecificSize$stable = 0;
io_github_suqi8_coui_kmp_basic_ResponsiveGridDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_ScrollBarColors$stable = 0;
io_github_suqi8_coui_kmp_basic_ScrollBarDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_LazyLineContentAdapter_VisibleLine$stable = 0;
io_github_suqi8_coui_kmp_basic_SearchBarCollapseGeometry$stable = 0;
io_github_suqi8_coui_kmp_basic_SearchBarCollapseDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_SideNavigationBarState$stable = 0;
io_github_suqi8_coui_kmp_basic_SideNavigationBarDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_SidePaneState$stable = 0;
io_github_suqi8_coui_kmp_basic_SidePaneLayoutDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_SmallTitleDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_StepperDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_StepperColors$stable = 0;
io_github_suqi8_coui_kmp_basic_SurfaceDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_TabWithSearchLayoutDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_TagViewColors$stable = 0;
io_github_suqi8_coui_kmp_basic_TagViewDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_TooltipArrowGeometry$stable = 0;
io_github_suqi8_coui_kmp_basic_TooltipMetrics$stable = 0;
io_github_suqi8_coui_kmp_basic_TooltipAnchorSpacing$stable = 0;
io_github_suqi8_coui_kmp_basic_TooltipPlacement$stable = 0;
io_github_suqi8_coui_kmp_basic_TopAppBarSearchState$stable = 0;
io_github_suqi8_coui_kmp_basic_TopAppBarSearchDefaults$stable = 0;
io_github_suqi8_coui_kmp_basic_TwoTextButtonDefaults$stable = 0;
io_github_suqi8_coui_kmp_color_core_Transforms$stable = 0;
io_github_suqi8_coui_kmp_color_space_Hsv$stable = 0;
io_github_suqi8_coui_kmp_color_space_OkHsv$stable = 0;
io_github_suqi8_coui_kmp_color_space_OkLab$stable = 0;
io_github_suqi8_coui_kmp_color_space_OkLch$stable = 0;
io_github_suqi8_coui_kmp_effect_TouchMotion$stable = 0;
io_github_suqi8_coui_kmp_effect_TouchMotionState$stable = 0;
io_github_suqi8_coui_kmp_effect_ConicLightShader$stable = 0;
io_github_suqi8_coui_kmp_effect_ConicLightState$stable = 0;
io_github_suqi8_coui_kmp_effect_MaterialStrokeParams$stable = 0;
io_github_suqi8_coui_kmp_effect_MaterialStrokePresets$stable = 0;
io_github_suqi8_coui_kmp_effect_SpringChainDefaults$stable = 0;
io_github_suqi8_coui_kmp_effect_SpringChainState$stable = 0;
_arrowRight = null;
_arrowUpDown = null;
_check = null;
_close = null;
_more = null;
_reset = null;
_search = null;
_searchCleanup = null;
_sidebar = null;
io_github_suqi8_coui_kmp_interfaces_HoldDownInteraction_HoldDown$stable = 0;
io_github_suqi8_coui_kmp_interfaces_HoldDownInteraction_Release$stable = 0;
io_github_suqi8_coui_kmp_layout_InputDialogDefaults$stable = 0;
io_github_suqi8_coui_kmp_layout_ListDialogItem$stable = 0;
io_github_suqi8_coui_kmp_layout_ListDialogDefaults$stable = 0;
io_github_suqi8_coui_kmp_layout_ListDialogColors$stable = 0;
io_github_suqi8_coui_kmp_layout_NavigationPopupMenuDefaults$stable = 0;
io_github_suqi8_coui_kmp_layout_ProgressDialogDefaults$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIFontScale$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIRoundCorner_Normal$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIRoundCorner_Large$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIRoundCorner$stable = 0;
io_github_suqi8_coui_kmp_theme_COUITheme$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIThemeColorTokens$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIThemeColor$stable = 0;
io_github_suqi8_coui_kmp_theme_COUIThemeColors$stable = 0;
io_github_suqi8_coui_kmp_theme_MonetRoles$stable = 0;
io_github_suqi8_coui_kmp_utils_COUIFlingBehavior$stable = 0;
io_github_suqi8_coui_kmp_utils_COUILayoutGrid$stable = 0;
VerticalSpringBackTensionMultiple = 2.15;
HorizontalSpringBackTensionMultiple = 3.2;
io_github_suqi8_coui_kmp_utils_COUIPhysicalAnimation$stable = 0;
io_github_suqi8_coui_kmp_utils_COUIOverScrollRelease$stable = 0;
io_github_suqi8_coui_kmp_utils_COUIOverScrollAxis$stable = 8;
io_github_suqi8_coui_kmp_utils_COUISpringInterpolator$stable = 8;
io_github_suqi8_coui_kmp_utils_COUIReboundOverScroller$stable = 8;
io_github_suqi8_coui_kmp_utils_COUIOverscrollFactory$stable = 0;
io_github_suqi8_coui_kmp_utils_COUIOverscrollEffect$stable = 0;
io_github_suqi8_coui_kmp_utils_PercentWidthResult$stable = 0;
io_github_suqi8_coui_kmp_utils_PercentWidthDefaults$stable = 0;
io_github_suqi8_coui_kmp_utils_SinkFeedback$stable = 0;
io_github_suqi8_coui_kmp_utils_TiltFeedback$stable = 0;
io_github_suqi8_coui_kmp_utils_PressableNode$stable = 8;
io_github_suqi8_coui_kmp_utils_AbstractPressableNode$stable = 8;
io_github_suqi8_coui_kmp_utils_PressGestureScopeImpl$stable = 0;
io_github_suqi8_coui_kmp_utils_SpringMath$stable = 0;
io_github_suqi8_coui_kmp_utils_SpringEngine$stable = 8;
//endregion
//region block: exports
export {
  get_COUIEaseEasing as get_COUIEaseEasing1qziozyu42jq3,
  get_COUIInEaseEasing as get_COUIInEaseEasing1fltnhkb2an9y,
  get_COUIMoveEaseEasing as get_COUIMoveEaseEasing10fp53f6449ps,
  get_COUIOutEaseEasing as get_COUIOutEaseEasing2elfmvnrle7gi,
  COUISpringEasing as COUISpringEasing3483417belkvv,
  couiSpring as couiSpringglxbjlayxbyn,
  SinkFeedback as SinkFeedbackmagtsu295yod,
};
//endregion

//# sourceMappingURL=compose-coui-ui-coui-ui.mjs.map
