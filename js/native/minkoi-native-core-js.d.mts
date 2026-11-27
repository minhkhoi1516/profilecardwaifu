type Nullable<T> = T | null | undefined
declare function KtSingleton<T>(): T & (abstract new() => any);
export declare function minkoiNativeVersion(): string;
export declare function minkoiNativeManifestJson(): string;
export declare function miuixFolmeStiffness(damping: number, response: number): number;
export declare function miuixFolmeStepValue(value: number, target: number, velocity: number, dt: number, damping: number, response: number): number;
export declare function couiSpringEasing(fraction: number, response: number, bounce: number): number;
export declare function couiBezierEasing(kind: number, fraction: number): number;
export declare function couiStiffnessFromResponse(response: number): number;
export declare function couiDampingFromBounce(bounce: number): number;
export declare function couiSpringStepValue(value: number, target: number, velocity: number, dt: number, response: number, bounce: number): number;
export declare function couiDefaultSinkAmount(): number;
export declare function miuixObtainDampingDistance(inputDistance: number, range: number): number;
export declare function miuixObtainTouchDistance(currentPixelOffset: number, range: number): number;
export declare function miuixPressStrength(widthPx: number, heightPx: number, density: number): number;
export declare function springStepValue(value: number, target: number, velocity: number, dt: number, dampingRatio: number, stiffness: number, mass: number): number;
export declare function springStepLastVelocity(): number;
export declare function backdropHighlightIntensity(coordX: number, coordY: number, width: number, height: number, radius: number, angleRad: number, falloff: number): number;
export declare function backdropRefractionMagnitude(coordX: number, coordY: number, width: number, height: number, radius: number, refractionHeight: number, refractionAmount: number): number;