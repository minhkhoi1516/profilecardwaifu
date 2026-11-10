/* ========================================================
   MINKOI STUDIO · PERFORMANCE & HARDWARE PROFILER (MIUIX/HYPEROS)
   Tự động kiểm tra CPU / RAM và kích hoạt chế độ tiết kiệm tài nguyên
======================================================== */
(function() {
    'use strict';

    function initHardwareProfiler() {
        // Kiểm tra số luồng xử lý CPU (logical cores) và dung lượng RAM (GB)
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;

        // Nếu máy yếu: CPU <= 4 luồng HOẶC RAM <= 4GB
        const isLowEnd = cores <= 4 || memory <= 4;

        if (isLowEnd) {
            document.body.classList.add('low-end');
            document.documentElement.classList.add('low-end-device');
            console.info(`[HyperOS Perf] Chế độ máy yếu được kích hoạt (Cores: ${cores}, RAM: ~${memory}GB). Đã tắt kính mờ và giảm tải GPU.`);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHardwareProfiler);
    } else {
        initHardwareProfiler();
    }

    window.__initHardwareProfiler = initHardwareProfiler;
})();
