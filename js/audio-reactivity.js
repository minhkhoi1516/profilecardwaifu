/* MINKOI V4 REFINED · AUDIO FEATURES
   Read-only analysis of the existing graph. No contexts, sources or output nodes.
   Bands describe frequency energy, not isolated vocals, instruments or BPM. */
(function (global) {
    'use strict';

    const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
    const follow = (x, target, dt, attack, release) => x + (target - x) *
        (1 - Math.exp(-dt / (target > x ? attack : release)));
    const compress = x => Math.min(1.15, Math.log1p(Math.max(0, x) * 2) / Math.log(5));
    const COUNT = 48;

    // One analyser read per animation frame, shared by every consumer. The
    // soundstage and the fluid background run in separate RAF callbacks but
    // describe the same instant; a second getByteFrequencyData is redundant.
    let spectrumNode = null;
    let spectrumBuffer = null;
    let spectrumAt = -Infinity;
    function getSpectrum(node, frameTime) {
        if (!node) return null;
        // RAF callbacks in one frame receive the same timestamp. Do not use a
        // time window: it can merge distinct frames on high-refresh displays.
        const fresh = Number.isFinite(frameTime) && node === spectrumNode &&
            spectrumBuffer && spectrumBuffer.length === node.frequencyBinCount && frameTime === spectrumAt;
        if (!fresh) {
            if (!spectrumBuffer || spectrumBuffer.length !== node.frequencyBinCount) {
                spectrumBuffer = new Uint8Array(node.frequencyBinCount);
            }
            node.getByteFrequencyData(spectrumBuffer);
            spectrumNode = node;
            spectrumAt = frameTime;
        }
        return spectrumBuffer;
    }

    function create() {
        let analyser = null;
        let frequency = new Uint8Array(0);
        let time = new Float32Array(0);
        const amplitude = new Float32Array(256);
        const starts = new Uint16Array(COUNT);
        const ends = new Uint16Array(COUNT);
        const previous = new Float32Array(COUNT);
        const means = new Float32Array(COUNT).fill(0.006);
        const levels = new Float32Array(COUNT);
        const waveform = new Float32Array(64);
        const history = new Float32Array(COUNT * 16);
        const historyTimes = new Float64Array(16).fill(-100);
        const statistics = new Float32Array(96).fill(-32);
        const sorted = new Float32Array(96);
        let historyHead = 0;
        let statisticsHead = 0;
        let statisticsCount = 0;
        let statisticsClock = 0;
        let reference = 0.025;
        let wantedReference = reference;
        let fluxMean = 0.005;
        let fluxVariance = 0.0001;
        let clock = 0;
        let lastOnset = -1;
        let holdOnsets = 0;
        let silenceTime = 0;
        let sampleRate = 48000;
        let binHz = 48000 / 2048;
        let minDb = -95;
        let maxDb = -15;

        const features = {
            bass: 0, mid: 0, treble: 0, envelope: 0, rms: 0,
            rawBass: 0, rawMid: 0, rawTreble: 0,
            flux: 0, onset: 0, kick: 0, silent: true,
            reference, bands: levels, waveform, bandCount: COUNT
        };

        function attach(node) {
            if (!node) return false;
            if (analyser === node && time.length === node.fftSize && sampleRate === node.context.sampleRate &&
                minDb === node.minDecibels && maxDb === node.maxDecibels) return true;
            analyser = node;
            minDb = node.minDecibels;
            maxDb = node.maxDecibels;
            sampleRate = node.context.sampleRate;
            binHz = sampleRate / node.fftSize;
            frequency = new Uint8Array(node.frequencyBinCount);
            time = new Float32Array(node.fftSize);
            for (let i = 0; i < 256; i++) {
                // getByteFrequencyData is linear in dB, not linear amplitude.
                amplitude[i] = i ? Math.pow(10, (node.minDecibels +
                    i / 255 * (node.maxDecibels - node.minDecibels)) / 20) : 0;
            }
            const upper = Math.min(14000, sampleRate * 0.45);
            for (let i = 0; i < COUNT; i++) {
                const low = 40 * Math.pow(upper / 40, i / COUNT);
                const high = 40 * Math.pow(upper / 40, (i + 1) / COUNT);
                starts[i] = clamp(Math.round(low / binHz), 1, frequency.length - 1);
                ends[i] = clamp(Math.max(starts[i] + 1, Math.round(high / binHz)), 2, frequency.length);
            }
            previous.fill(0);
            holdOnsets = 0.15;
            return true;
        }

        function energy(low, high) {
            const start = Math.max(1, Math.floor(low / binHz));
            const end = Math.min(frequency.length, Math.ceil(high / binHz));
            let sum = 0;
            for (let i = start; i < end; i++) {
                const a = amplitude[frequency[i]];
                sum += a * a;
            }
            // Integrate power across the band. Averaging by bin count would
            // artificially suppress wide mid/treble bands relative to bass.
            return Math.sqrt(sum);
        }

        function updateStatistics(rms, dt) {
            statisticsClock += dt;
            if (statisticsClock < 0.1 || rms < 0.00025) return;
            statisticsClock %= 0.1;
            statistics[statisticsHead] = clamp(20 * Math.log10(rms), -84, -6);
            statisticsHead = (statisticsHead + 1) % statistics.length;
            statisticsCount = Math.min(statistics.length, statisticsCount + 1);
            // A rolling 75th percentile rejects isolated peaks; adaptation is
            // deliberately slower than musical phrases, preserving dynamics.
            if (statisticsHead % 3 === 0) {
                sorted.set(statistics);
                sorted.subarray(0, statisticsCount).sort();
                wantedReference = clamp(Math.pow(10, sorted[Math.floor((statisticsCount - 1) * 0.75)] / 20), 0.0015, 0.18);
            }
        }

        function readWaveform(rms, dt) {
            // Align to a real positive zero crossing, not a decorative sine.
            // Choose a nearby low-slope crossing to reduce phase flicker.
            let anchor = 0;
            let best = Infinity;
            const searchEnd = Math.min(512, time.length / 3);
            for (let i = 1; i < searchEnd; i++) {
                if (time[i - 1] <= 0 && time[i] > 0) {
                    const score = Math.abs(time[i] - time[i - 1]) + i * 0.000003;
                    if (score < best) { best = score; anchor = i; }
                }
            }
            const windowLength = Math.min(1024, time.length - anchor - 1);
            const stride = windowLength / waveform.length;
            const smoothing = 1 - Math.exp(-dt / 0.045);
            const gain = 1 / Math.max(rms * 1.7, reference * 0.2, 0.001);
            for (let i = 0; i < waveform.length; i++) {
                const from = anchor + Math.floor(i * stride);
                const to = Math.min(time.length, from + Math.max(1, Math.floor(stride)));
                let sum = 0;
                for (let j = from; j < to; j++) sum += time[j];
                const value = clamp(sum / Math.max(1, to - from) * gain, -1, 1);
                waveform[i] += (value - waveform[i]) * smoothing;
            }
        }

        function sample(node, dt, reactivity, frameTime) {
            if (!attach(node) || node.context.state !== 'running') return decay(dt);
            clock += dt;
            holdOnsets = Math.max(0, holdOnsets - dt);
            const bins = getSpectrum(node, frameTime);
            if (!bins) return decay(dt);
            frequency = bins;
            node.getFloatTimeDomainData(time);
            let sum = 0, squares = 0;
            for (let i = 0; i < time.length; i++) {
                sum += time[i];
                squares += time[i] * time[i];
            }
            const rms = Math.sqrt(Math.max(0, squares / time.length - Math.pow(sum / time.length, 2)));
            const bass = energy(40, 220);
            const mid = energy(220, 4000);
            const treble = energy(4000, Math.min(14000, sampleRate * 0.45));
            const audible = rms > 0.00025;
            silenceTime = audible ? 0 : silenceTime + dt;
            features.silent = silenceTime > 0.12;
            features.rms = rms;
            features.rawBass = bass;
            features.rawMid = mid;
            features.rawTreble = treble;
            updateStatistics(rms, dt);
            reference = follow(reference, wantedReference, dt, 1.2, 3.5);
            features.reference = reference;
            const sensitivity = clamp(reactivity, 0.45, 1.45);
            const absoluteLoudness = compress(rms / 0.06);
            const envelope = audible ? compress(rms / Math.max(0.0015, reference) * sensitivity) * 0.78 + absoluteLoudness * 0.22 : 0;
            features.envelope = follow(features.envelope, envelope, dt, 0.024, 0.24);
            // Blackman-windowed FFT amplitudes are lower than the PCM RMS.
            // Calibrate those domains before compression; the absolute floor
            // still prevents quiet codec noise from receiving unlimited gain.
            const common = Math.max(0.001, reference * 0.32);
            features.bass = follow(features.bass, audible ? compress(bass / common * sensitivity) : 0, dt, 0.025, 0.22);
            features.mid = follow(features.mid, audible ? compress(mid / (common * 0.6) * sensitivity) : 0, dt, 0.045, 0.27);
            features.treble = follow(features.treble, audible ? compress(treble / (common * 0.22) * sensitivity) : 0, dt, 0.018, 0.16);

            let flux = 0, lowFlux = 0;
            for (let i = 0; i < COUNT; i++) {
                let p = 0;
                for (let j = starts[i]; j < ends[i]; j++) {
                    const a = amplitude[frequency[j]];
                    p += a * a;
                }
                const value = Math.sqrt(p);
                const positive = Math.max(0, value - previous[i]);
                flux += positive;
                if (i < 14) lowFlux += positive;
                previous[i] = value;
                means[i] = follow(means[i], value, dt, 2.5, 5);
                const localReference = common * 0.72 + Math.min(common * 2, means[i]) * 0.28;
                // Local normalization is blended with the common reference:
                // quiet treble cannot normalize itself into a constant maximum.
                const target = audible ? compress(value / Math.max(0.0005, localReference) * sensitivity) * (0.7 + absoluteLoudness * 0.3) : 0;
                levels[i] = follow(levels[i], target, dt, 0.018, 0.16);
            }
            const fluxTimeScale = clamp((1 / 60) / Math.max(0.004, dt), 0.3, 3);
            lowFlux *= fluxTimeScale;
            flux *= fluxTimeScale / (COUNT * Math.max(reference, 0.002));
            const difference = flux - fluxMean;
            const historyWeight = 1 - Math.exp(-dt / 2.5);
            const threshold = Math.max(0.012, fluxMean + Math.sqrt(fluxVariance) * 1.35);
            features.onset = 0;
            features.kick = 0;
            if (audible && !holdOnsets && clock - lastOnset > 0.14 && flux > threshold) {
                features.onset = clamp((flux - threshold) / (threshold + 0.04), 0, 1);
                features.kick = features.onset * clamp(lowFlux / Math.max(0.00001, flux * COUNT * reference) * 2, 0, 1);
                lastOnset = clock;
            }
            fluxMean += difference * historyWeight;
            fluxVariance += (difference * difference - fluxVariance) * historyWeight;
            features.flux = flux;
            readWaveform(rms, dt);
            historyHead = (historyHead + 1) % 16;
            historyTimes[historyHead] = clock;
            history.set(levels, historyHead * COUNT);
            return features;
        }

        function decay(dt) {
            clock += dt;
            const k = Math.exp(-dt / 0.17);
            features.bass *= k;
            features.mid *= k;
            features.treble *= k;
            features.envelope *= k;
            features.rms = 0;
            features.rawBass = 0;
            features.rawMid = 0;
            features.rawTreble = 0;
            features.flux = 0;
            features.onset = 0;
            features.kick = 0;
            features.silent = true;
            for (let i = 0; i < COUNT; i++) levels[i] *= k;
            for (let i = 0; i < waveform.length; i++) waveform[i] *= k;
            return features;
        }

        function delayed(index, delay) {
            const wanted = clock - delay;
            for (let i = 0; i < 16; i++) {
                const row = (historyHead - i + 16) % 16;
                if (historyTimes[row] <= wanted) return history[row * COUNT + index];
            }
            return levels[index];
        }

        function reset(trackChange) {
            previous.fill(0);
            history.fill(0);
            historyTimes.fill(-100);
            holdOnsets = 0.18;
            fluxMean = 0.005;
            fluxVariance = 0.0001;
            if (trackChange) {
                statistics.fill(-32);
                means.fill(0.006);
                wantedReference = 0.025;
                statisticsHead = 0;
                statisticsCount = 0;
            }
        }

        return Object.freeze({ sample, decay, delayed, reset, features });
    }

    // Analytic damped oscillator: stable at 60/90/120Hz and after long frames.
    // Each vector shares coefficients; no per-bar spring objects or RAFs.
    function springVector(position, velocity, targets, dt, omega, damping) {
        const z = clamp(damping, 0.55, 0.98);
        const w = omega * Math.sqrt(1 - z * z);
        const e = Math.exp(-z * omega * dt);
        const c = Math.cos(w * dt);
        const s = Math.sin(w * dt) / w;
        for (let i = 0; i < position.length; i++) {
            const x = position[i] - targets[i];
            const v = velocity[i];
            position[i] = targets[i] + e * (x * c + (v + z * omega * x) * s);
            velocity[i] = e * (v * c - (z * omega * v + omega * omega * x) * s);
            if (Math.abs(position[i] - targets[i]) < 0.0001 && Math.abs(velocity[i]) < 0.001) {
                position[i] = targets[i];
                velocity[i] = 0;
            }
        }
    }

    global.MinkoiAudioFeatures = Object.freeze({ create, springVector, getSpectrum });
})(window);
