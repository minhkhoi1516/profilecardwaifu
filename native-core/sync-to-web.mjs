#!/usr/bin/env node
// =============================================================================
// MINKOI 5.6 · ZERO-SKIKO VERIFICATION & STATIC DISTRIBUTION SYNC
// Verifies that compiled Kotlin/Wasm & Kotlin/JS distributions of `native-core`
// (linking real Maven Miuix 0.9.5-rc01 & COUI 2.1.0) have ZERO Skiko binary
// imports, strips only provably unused Skiko ESM wrapper lines when
// skikoImports === 0, copies only reachable static assets to js/native/, and
// executes a live Node smoke test of BOTH WASM and JS targets!
// =============================================================================
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pathToFileURL } from 'url';

const ROOT = path.resolve(process.cwd());
const WASM_DIST = path.join(ROOT, 'native-core', 'build', 'dist', 'wasmJs', 'productionLibrary');
const JS_DIST = path.join(ROOT, 'native-core', 'build', 'dist', 'js', 'productionLibrary');
const OUT_DIR = path.join(ROOT, 'js', 'native');

// 1. Verify WASM binary has strictly ZERO Skiko imports via WebAssembly.Module.imports
const wasmPath = path.join(WASM_DIST, 'minkoi-native-core-wasm.wasm');
if (!fs.existsSync(wasmPath)) {
    throw new Error(`Missing compiled WASM binary: ${wasmPath}`);
}
const wasmBytes = fs.readFileSync(wasmPath);
const wasmMod = new WebAssembly.Module(wasmBytes, {
    builtins: ['js-string'],
    importedStringConstants: "'"
});
const wasmImports = WebAssembly.Module.imports(wasmMod);
const skikoImports = wasmImports.filter(i => /skiko|skia/i.test(`${i.module}.${i.name}`));
if (skikoImports.length > 0) {
    throw new Error(`ABORT: Compiled WASM has ${skikoImports.length} Skiko binary imports: ${JSON.stringify(skikoImports)}`);
}
const wasmGzip = zlib.gzipSync(wasmBytes).length;
console.log(`[VERIFY WASM] raw=${wasmBytes.length}B gzip=${wasmGzip}B totalImports=${wasmImports.length} skikoImports=0 (PASS)`);

// 2. Trace reachable ES module graph of JS target & assert touchesSkiko === false
const jsVisited = new Set();
const jsQueue = ['minkoi-native-core-js.mjs'];
let jsTotalRaw = 0;
let jsTotalGzip = 0;
while (jsQueue.length) {
    const cur = jsQueue.shift();
    if (jsVisited.has(cur)) continue;
    const full = path.join(JS_DIST, cur);
    if (!fs.existsSync(full)) throw new Error(`Missing reachable JS module: ${full}`);
    if (/skiko|skia/i.test(cur)) {
        throw new Error(`ABORT: Reachable JS graph touches Skiko module: ${cur}`);
    }
    jsVisited.add(cur);
    const buf = fs.readFileSync(full);
    jsTotalRaw += buf.length;
    jsTotalGzip += zlib.gzipSync(buf).length;
    const text = buf.toString('utf8');
    for (const m of text.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)) {
        if (!jsVisited.has(m[1])) jsQueue.push(m[1]);
    }
}
console.log(`[VERIFY JS]   files=${jsVisited.size} raw=${jsTotalRaw}B gzip=${jsTotalGzip}B touchesSkiko=false (PASS)`);

// 3. Clean stale .mjs/.wasm/.d.mts in js/native/ (preserving THIRD_PARTY_LICENSES.md)
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const entry of fs.readdirSync(OUT_DIR)) {
    if (entry === 'THIRD_PARTY_LICENSES.md') continue;
    if (/\.(?:mjs|wasm|d\.mts)$/i.test(entry)) {
        fs.unlinkSync(path.join(OUT_DIR, entry));
    }
}

// 4. Copy WASM distribution, stripping ONLY dead unused `./skiko.mjs` glue lines proven unused by step 1
const wasmCopyFiles = [
    'minkoi-native-core-wasm.wasm',
    'minkoi-native-core-wasm.mjs',
    'minkoi-native-core-wasm.js-builtins.mjs',
    'minkoi-native-core-wasm.d.mts'
];
for (const f of wasmCopyFiles) {
    const src = path.join(WASM_DIST, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT_DIR, f));
}

// Sanitize dead unreferenced skiko glue lines in import-object.mjs (strictly because skikoImports === 0)
let importObjSrc = fs.readFileSync(path.join(WASM_DIST, 'minkoi-native-core-wasm.import-object.mjs'), 'utf8');
const requiredImportNames = new Set(wasmImports.map(i => `${i.module}:${i.name}`));
importObjSrc = importObjSrc
    .split('\n')
    .filter(line => {
        if (/from\s+['"]\.\/skiko\.mjs['"]/.test(line)) return false;
        if (/Li9za2lrby5tanM/.test(line)) return false;
        if (/'\.\/skiko\.mjs'\s*:/.test(line)) return false;
        return true;
    })
    .join('\n');
fs.writeFileSync(path.join(OUT_DIR, 'minkoi-native-core-wasm.import-object.mjs'), importObjSrc);

// 5. Copy reachable JS modules + TypeScript definitions
for (const f of jsVisited) {
    fs.copyFileSync(path.join(JS_DIST, f), path.join(OUT_DIR, f));
}
const jsDts = path.join(JS_DIST, 'minkoi-native-core-js.d.mts');
if (fs.existsSync(jsDts)) {
    fs.copyFileSync(jsDts, path.join(OUT_DIR, 'minkoi-native-core-js.d.mts'));
}

// 6. Live smoke test of BOTH synced targets in Node!
const wasmApi = await import(pathToFileURL(path.join(OUT_DIR, 'minkoi-native-core-wasm.mjs')).href);
const jsApi = await import(pathToFileURL(path.join(OUT_DIR, 'minkoi-native-core-js.mjs')).href);

function assertClose(label, a, b, tol = 1e-4) {
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > tol) {
        throw new Error(`Parity mismatch on ${label}: wasm=${a} vs js=${b}`);
    }
}

assertClose('miuixFolmeStiffness', wasmApi.miuixFolmeStiffness(0.85, 0.35), jsApi.miuixFolmeStiffness(0.85, 0.35));
assertClose('miuixFolmeStepValue', wasmApi.miuixFolmeStepValue(0, 1, 0, 0.016, 0.85, 0.35), jsApi.miuixFolmeStepValue(0, 1, 0, 0.016, 0.85, 0.35));
assertClose('couiSpringEasing', wasmApi.couiSpringEasing(0.5, 0.35, 0.2), jsApi.couiSpringEasing(0.5, 0.35, 0.2));
assertClose('couiBezierEasing(0)', wasmApi.couiBezierEasing(0, 0.5), jsApi.couiBezierEasing(0, 0.5));
assertClose('couiSpringStepValue', wasmApi.couiSpringStepValue(0, 1, 0, 0.016, 0.35, 0.2), jsApi.couiSpringStepValue(0, 1, 0, 0.016, 0.35, 0.2));
assertClose('couiDefaultSinkAmount', wasmApi.couiDefaultSinkAmount(), jsApi.couiDefaultSinkAmount());
assertClose('miuixObtainDampingDistance', wasmApi.miuixObtainDampingDistance(50, 100), jsApi.miuixObtainDampingDistance(50, 100));
assertClose('miuixPressStrength', wasmApi.miuixPressStrength(480, 320, 1), jsApi.miuixPressStrength(480, 320, 1));
assertClose('backdropHighlightIntensity', wasmApi.backdropHighlightIntensity(210, 0, 420, 44, 22, -1.5708, 1.5), jsApi.backdropHighlightIntensity(210, 0, 420, 44, 22, -1.5708, 1.5));
assertClose('backdropRefractionMagnitude', wasmApi.backdropRefractionMagnitude(2, 22, 420, 44, 22, 14, 8), jsApi.backdropRefractionMagnitude(2, 22, 420, 44, 22, 14, 8));

console.log('[SMOKE PASS] Direct Maven Miuix + COUI WASM & JS parity verified!', {
    wasmVer: wasmApi.minkoiNativeVersion(),
    jsVer: jsApi.minkoiNativeVersion(),
    miuixStiff: Number(wasmApi.miuixFolmeStiffness(0.85, 0.35).toFixed(3)),
    couiEase05: Number(wasmApi.couiSpringEasing(0.5, 0.35, 0.2).toFixed(5)),
    couiSink: wasmApi.couiDefaultSinkAmount(),
    press480: wasmApi.miuixPressStrength(480, 320, 1),
    requiredImports: requiredImportNames.size
});
