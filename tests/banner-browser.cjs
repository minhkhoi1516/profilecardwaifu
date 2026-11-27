// Serve the repository first, then: node tests/banner-browser.cjs
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const BASE = process.env.MINKOI_BASE || 'http://127.0.0.1:8099/';
const view = (page, key, role, previous = '') => page.waitForFunction(
    ([key, role, previous]) => {
        const src = getCurrentBanner();
        const layer = document.querySelector('.banner-layer.active');
        return src !== previous && src.startsWith(`assets/banners/${key}/${role}/`) &&
            getComputedStyle(layer).backgroundImage.includes(src) && src;
    }, [key, role, previous]
).then(async h => {
    try { return await h.jsonValue(); } finally { await h.dispose(); }
});

(async () => {
    const browser = await chromium.launch();
    try {
        const viewports = process.argv.includes('--race-only') ? [] : [[1366, 768, 'pc'], [390, 844, 'phone']];
        for (const [width, height, role] of viewports) {
            const page = await browser.newPage({
                viewport: { width, height }, isMobile: role === 'phone', hasTouch: role === 'phone',
                reducedMotion: 'reduce'
            });
            page.setDefaultTimeout(30000);
            await page.route(url => url.origin !== new URL(BASE).origin, route => route.abort());
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(() => {
                const set = Map.prototype.set;
                window.decodedBannerHighWater = 0;
                Map.prototype.set = function (key, value) {
                    const result = set.call(this, key, value);
                    if (typeof key === 'string' && key.startsWith('assets/banners/') && value instanceof HTMLImageElement) {
                        queueMicrotask(() => {
                            decodedBannerHighWater = Math.max(decodedBannerHighWater, this.size);
                        });
                    }
                    return result;
                };
            });
            const bootRequests = new Set();
            page.on('request', r => {
                if (r.url().includes('/assets/banners/')) bootRequests.add(r.url());
            });
            await page.goto(BASE, { waitUntil: 'domcontentloaded' });
            const first = await view(page, 'alya', role);
            assert(bootRequests.size <= 3, 'Boot eagerly loaded banner pool');
            const pools = await page.evaluate(async ({ first, role }) => {
                const personas = CONFIG.personas.filter(p => p.available);
                if (personas.length !== 8) {
                    throw new Error(`Expected 8 available personas in CONFIG.personas, got ${personas.length}`);
                }
                for (const p of personas) {
                    if (!Array.isArray(p.banners?.[role]) || p.banners[role].length === 0) {
                        throw new Error(`Missing ${role} banner pool for persona ${p.key}`);
                    }
                }
                const histories = new Map(personas.map(p => [p.key, []]));
                histories.get('alya').push(first);
                const switchTo = async key => {
                    const history = histories.get(key);
                    await setPersona(key, false);
                    const deadline = performance.now() + 15000;
                    while (performance.now() < deadline) {
                        const src = getCurrentBanner();
                        const layer = document.querySelector('.banner-layer.active');
                        if (src !== history.at(-1) && src.startsWith(`assets/banners/${key}/${role}/`) &&
                            getComputedStyle(layer).backgroundImage.includes(src)) {
                            if (history.slice(-3).includes(src)) throw new Error(`Repeated ${src}`);
                            history.push(src);
                            return;
                        }
                        await new Promise(requestAnimationFrame);
                    }
                    throw new Error(`No visible banner commit for ${key}/${role}`);
                };
                // 100 committed views per pool, with repeated equip and A → B → A jumps.
                await switchTo('alya');
                await switchTo('alya');
                for (let i = 0; i < 100; i++) {
                    for (const { key } of personas) if (histories.get(key).length <= i) await switchTo(key);
                }
                return personas.map(({ key, banners }) => [banners[role], histories.get(key)]);
            }, { first, role });
            for (const [urls, history] of pools) {
                assert.equal(history.length, 100);
                for (let i = 0; i < history.length; i += urls.length) {
                    const cycle = history.slice(i, i + urls.length);
                    assert.equal(new Set(cycle).size, cycle.length);
                    if (cycle.length === urls.length) assert.deepEqual(cycle.sort(), [...urls].sort());
                }
            }
            assert.deepEqual(errors, []);
            assert.equal(await page.evaluate(() => decodedBannerHighWater), 5);
            console.log(`PASS ${role}: 100 actual DOM commits x 8 personas`);
            await page.close();
        }

        const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
        page.setDefaultTimeout(30000);
        await page.route(url => url.origin !== new URL(BASE).origin, route => route.abort());
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
            const decode = HTMLImageElement.prototype.decode;
            window.bannerFaults = {};
            window.faultLog = [];
            HTMLImageElement.prototype.decode = async function () {
                const match = this.src.match(/\/assets\/banners\/([^/]+)\//);
                const rule = match && bannerFaults[match[1]];
                if (rule?.failOnce > 0) {
                    rule.failOnce--;
                    faultLog.push(this.src);
                    throw new Error('Simulated decode error');
                }
                if (rule?.delay) {
                    faultLog.push(this.src);
                    await new Promise(resolve => setTimeout(resolve, rule.delay));
                }
                return decode.call(this);
            };
        });
        const delayedRequests = [];
        await page.route('**/assets/banners/hinako/pc/*.webp', async route => {
            delayedRequests.push(route.request().url());
            await new Promise(resolve => setTimeout(resolve, 550));
            await route.continue();
        });
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        const initial = await view(page, 'alya', 'pc');
        await page.evaluate(() => {
            window.blankBannerFrames = [];
            const sampleLayers = () => {
                const layers = [...document.querySelectorAll('.banner-layer')].map(layer => {
                    const css = getComputedStyle(layer);
                    return { background: css.backgroundImage, opacity: css.opacity, active: layer.classList.contains('active'),
                        inline: layer.style.cssText };
                });
                if (!layers.some(layer => layer.background !== 'none' && Number(layer.opacity) > 0)) {
                    blankBannerFrames.push({ src: getCurrentBanner(), layers, mode: document.body.className });
                }
                requestAnimationFrame(sampleLayers);
            };
            requestAnimationFrame(sampleLayers);
            bannerFaults.hinako = { delay: 700 };
            setPersona('hinako', true);
        });
        await page.waitForFunction(() => faultLog.length);
        assert.equal(await page.evaluate(() => getCurrentBanner()), initial);
        await page.evaluate(() => {
            document.querySelector('#zen-mode-toggle').click();
            if (!document.body.classList.contains('zen-mode')) throw new Error('Zen did not open');
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        });
        await page.waitForFunction(() => !document.body.classList.contains('zen-mode'));
        await page.evaluate(() => setPersona('sakuramiku', true));
        await view(page, 'sakuramiku', 'pc');
        const interrupted = await page.evaluate(() => faultLog[0].split('/assets/')[1]);
        await page.evaluate(() => setPersona('hinako', true));
        assert.equal(await view(page, 'hinako', 'pc'), `assets/${interrupted}`);
        assert(delayedRequests.length);

        await page.evaluate(() => {
            bannerFaults.umi = { failOnce: 1 };
            setPersona('umi', true);
        });
        const alternate = await view(page, 'umi', 'pc');
        const failed = await page.evaluate(() => faultLog.find(url => url.includes('/umi/')).split('/assets/')[1]);
        assert.notEqual(alternate, `assets/${failed}`);
        await page.evaluate(() => setPersona('umi', true));
        assert.equal(await view(page, 'umi', 'pc', alternate), `assets/${failed}`);
        await page.setViewportSize({ width: 430, height: 932 });
        await view(page, 'umi', 'phone');
        await page.setViewportSize({ width: 1920, height: 1080 });
        await view(page, 'umi', 'pc');
        assert.deepEqual(await page.evaluate(() => blankBannerFrames), []);
        console.log('PASS interrupted slow decode, failed decode and retry, Zen enter/exit, viewport changes; zero blank layer frames');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
