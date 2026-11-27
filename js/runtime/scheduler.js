/* ==========================================================================
   MINKOI 5.6 · ADAPTIVE CPU TASK SCHEDULER
   Application-level priority scheduler (NOT native OS kernel scheduling):
   - 10 explicit task categories with priority ordering & cancellation
   - Bounded queue backpressure (prevents unbounded queues)
   - Audio & interaction safety guard (yields background work during scrub/play)
   - Single persistent pooled Web Worker with crash recovery & main-thread fallback
   ========================================================================== */
(function (global) {
    'use strict';

    const CATEGORIES = Object.freeze({
        'critical-ui': 0,
        'audio': 1,
        'lyrics': 2,
        'visualizer': 3,
        'banner': 4,
        'decode': 5,
        'shader': 6,
        'particles': 7,
        'precompute': 8,
        'cache': 9
    });

    const MAX_QUEUE_DEPTH = 48;
    const FRAME_BUDGET_MS = 6;
    const WORKER_MAX_RESTARTS = 2;

    const queue = [];
    let flushScheduled = false;
    let interactionUntil = 0;
    let totalExecuted = 0;
    let totalDropped = 0;
    let totalCancelled = 0;
    let peakQueueDepth = 0;
    let maxTaskDurationMs = 0;

    // Single persistent lazy worker (never created per animation frame)
    let worker = null;
    let workerHealthy = false;
    let workerRestarts = 0;
    let workerDropped = 0;
    let maxWorkerQueue = 0;
    let workerJobSeq = 0;
    const workerPending = new Map();

    function getPriority(category) {
        return Object.prototype.hasOwnProperty.call(CATEGORIES, category) ? CATEGORIES[category] : 8;
    }

    function isInteracting() {
        return performance.now() < interactionUntil;
    }

    function markInteraction(durationMs = 280) {
        const until = performance.now() + Math.max(50, Math.min(2000, durationMs));
        if (until > interactionUntil) interactionUntil = until;
    }

    function releaseInteraction(tailMs = 0) {
        const target = performance.now() + Math.max(0, Math.min(250, tailMs));
        if (interactionUntil > target) interactionUntil = target;
    }

    function ensureWorker() {
        if (worker && workerHealthy) return worker;
        if (workerRestarts >= WORKER_MAX_RESTARTS) return null;
        if (typeof global.Worker === 'undefined' || global.location?.protocol === 'file:') return null;
        try {
            const url = new URL('js/runtime/compute-worker.js', global.location?.href || 'http://localhost/').href;
            worker = new global.Worker(url);
            workerHealthy = true;
            worker.onmessage = (ev) => {
                const msg = ev.data;
                if (!msg || !msg.id) return;
                const entry = workerPending.get(msg.id);
                if (!entry) return;
                workerPending.delete(msg.id);
                if (msg.ok) entry.resolve(msg.result);
                else entry.reject(new Error(msg.error || 'Worker task failed'));
            };
            worker.onerror = (err) => {
                workerHealthy = false;
                workerRestarts++;
                const pending = Array.from(workerPending.values());
                workerPending.clear();
                pending.forEach(p => p.reject(new Error(err?.message || 'Worker crashed')));
                try { worker?.terminate(); } catch (_) {}
                worker = null;
            };
            return worker;
        } catch (_) {
            workerHealthy = false;
            workerRestarts = WORKER_MAX_RESTARTS;
            return null;
        }
    }

    function runInWorker(type, payload, transfer = []) {
        const w = ensureWorker();
        if (!w) return Promise.reject(new Error('Worker unavailable'));
        if (workerPending.size >= 16) {
            workerDropped++;
            return Promise.reject(new Error('Worker backpressure limit reached'));
        }
        const id = ++workerJobSeq;
        if (workerPending.size + 1 > maxWorkerQueue) maxWorkerQueue = workerPending.size + 1;
        return new Promise((resolve, reject) => {
            const timer = global.setTimeout(() => {
                if (workerPending.has(id)) {
                    workerPending.delete(id);
                    reject(new Error(`Worker timeout (${type})`));
                }
            }, 8000);
            workerPending.set(id, {
                resolve: (val) => { global.clearTimeout(timer); resolve(val); },
                reject: (err) => { global.clearTimeout(timer); reject(err); }
            });
            try {
                w.postMessage({ id, type, payload }, transfer);
            } catch (err) {
                global.clearTimeout(timer);
                workerPending.delete(id);
                reject(err);
            }
        });
    }

    function scheduleFlush(delayMs = 0) {
        if (flushScheduled) return;
        flushScheduled = true;
        if (delayMs > 0) {
            global.setTimeout(() => { flushScheduled = false; flushQueue(); }, delayMs);
            return;
        }
        if (typeof global.requestIdleCallback === 'function' && queue.length && queue[0].priority >= 5) {
            global.requestIdleCallback(() => { flushScheduled = false; flushQueue(); }, { timeout: 120 });
        } else {
            global.setTimeout(() => { flushScheduled = false; flushQueue(); }, 0);
        }
    }

    function flushQueue() {
        if (queue.length === 0) return;
        const start = performance.now();
        const interacting = isInteracting();

        while (queue.length > 0) {
            const next = queue[0];
            // Protect UI & Audio: defer background work (>= priority 5) while actively interacting
            if (interacting && next.priority >= 5) {
                scheduleFlush(Math.max(40, Math.round(interactionUntil - performance.now()) + 16));
                return;
            }
            // Yield back to browser input if pending or frame slice budget exceeded
            if (totalExecuted > 0 && next.priority >= 4) {
                if (global.navigator?.scheduling?.isInputPending?.()) {
                    scheduleFlush(16);
                    return;
                }
                if (performance.now() - start >= FRAME_BUDGET_MS) {
                    scheduleFlush(16);
                    return;
                }
            }
            queue.shift();
            if (next.cancelled || next.signal?.aborted) {
                totalCancelled++;
                continue;
            }
            const t0 = performance.now();
            try {
                next.fn();
            } catch (_) {
                /* isolate scheduled background task errors */
            }
            const dur = performance.now() - t0;
            if (dur > maxTaskDurationMs) maxTaskDurationMs = Number(dur.toFixed(2));
            totalExecuted++;
        }
    }

    function schedule(category, fn, options = {}) {
        if (typeof fn !== 'function') return { cancel() {} };
        const priority = getPriority(category);
        const key = options.key || null;

        // Deduplicate queued tasks with same key (keeps latest intent)
        if (key) {
            for (let i = queue.length - 1; i >= 0; i--) {
                if (queue[i].key === key) {
                    queue.splice(i, 1);
                    totalCancelled++;
                }
            }
        }

        // Backpressure: drop lowest-priority background task if queue is full
        if (queue.length >= MAX_QUEUE_DEPTH) {
            if (priority >= queue[queue.length - 1].priority) {
                totalDropped++;
                return { cancel() {} };
            }
            queue.pop();
            totalDropped++;
        }

        const task = {
            category,
            priority,
            key,
            fn,
            signal: options.signal || null,
            cancelled: false
        };

        // Insert in ascending priority order (lower number = higher priority)
        let inserted = false;
        for (let i = 0; i < queue.length; i++) {
            if (priority < queue[i].priority) {
                queue.splice(i, 0, task);
                inserted = true;
                break;
            }
        }
        if (!inserted) queue.push(task);
        if (queue.length > peakQueueDepth) peakQueueDepth = queue.length;

        if (priority <= 1 && !options.defer) {
            scheduleFlush(0);
        } else {
            scheduleFlush(isInteracting() && priority >= 5 ? 80 : 0);
        }

        return {
            cancel() { task.cancelled = true; }
        };
    }

    function dispose() {
        queue.length = 0;
        workerPending.clear();
        try { worker?.terminate(); } catch (_) {}
        worker = null;
        workerHealthy = false;
    }

    global.addEventListener('pagehide', () => {
        // Cancel non-critical background precompute/cache tasks on pagehide without touching audio
        for (let i = queue.length - 1; i >= 0; i--) {
            if (queue[i].priority >= 5) {
                queue.splice(i, 1);
                totalCancelled++;
            }
        }
    });

    global.MinkoiScheduler = Object.freeze({
        CATEGORIES,
        schedule,
        runInWorker,
        markInteraction,
        releaseInteraction,
        isInteracting,
        getStats: () => ({
            queueDepth: queue.length,
            peakQueueDepth,
            totalExecuted,
            totalDropped,
            totalCancelled,
            maxTaskDurationMs,
            workerActive: Boolean(worker && workerHealthy),
            workerRestarts,
            workerDropped,
            maxWorkerQueue,
            workerPendingCount: workerPending.size
        }),
        dispose
    });
})(typeof window !== 'undefined' ? window : globalThis);
