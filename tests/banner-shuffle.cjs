// node tests/banner-shuffle.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
execFileSync(process.execPath, ['scripts/generate-banner-masters.cjs', '--check']);
const ctx = vm.createContext({});
for (const name of ['config', 'banner-masters', 'banner-shuffle']) {
    vm.runInContext(fs.readFileSync(`js/${name}.js`, 'utf8'), ctx);
}
const { CONFIG } = ctx;
const { create, masterOf } = vm.runInContext(
    '({create: createBannerShuffle, masterOf: src => BANNER_MASTER_BY_URL.get(src) || src})', ctx
);
const manifest = JSON.parse(fs.readFileSync('docs/V55_BANNER_MANIFEST.json', 'utf8')).banners;
const configured = CONFIG.personas.filter(p => p.available).flatMap(p => Object.values(p.banners).flat());
assert.deepEqual([...configured].sort(), Object.keys(manifest).sort());
for (const { key, banners } of CONFIG.personas.filter(p => p.available)) {
    let seed = 405;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
    const bags = { pc: create(banners.pc, masterOf, random), phone: create(banners.phone, masterOf, random) };
    const history = { pc: [], phone: [] };
    const cycle = { pc: new Set(), phone: new Set() };
    const masters = [];
    for (let i = 0; i < 100; i++) {
        for (const role of i % 2 ? ['phone', 'pc'] : ['pc', 'phone']) {
            const pool = banners[role];
            const bag = bags[role];
            const pick = bag.peek(masters);
            assert.equal(bag.peek(masters).src, pick.src, 'Cancelled request consumed a draw');
            assert(!history[role].slice(-3).includes(pick.src), 'Repeated a recent URL');
            assert(!cycle[role].has(pick.src), 'Repeated a URL before cycle end');
            const eligible = pool.filter(url => !cycle[role].has(url) && !history[role].slice(-3).includes(url));
            if (eligible.some(url => !masters.includes(masterOf(url)))) {
                assert(!masters.includes(masterOf(pick.src)), 'Ignored a different eligible master');
            }
            assert(bag.commit(pick));
            assert(!bag.commit(pick), 'Same reservation committed twice');
            cycle[role].add(pick.src);
            history[role].push(pick.src);
            masters.unshift(masterOf(pick.src));
            masters.splice(3);
            if (cycle[role].size === pool.length) cycle[role].clear();
        }
    }
    for (const role of ['pc', 'phone']) {
        assert.equal(new Set(history[role]).size, banners[role].length);
        console.log(`PASS ${key}/${role}: 100 commits; ${Math.floor(100 / banners[role].length)} complete cycles`);
    }
}

const retry = create(['a', 'b', 'c', 'd', 'e'], src => src, () => .5);
const failed = retry.peek();
const alternate = retry.peek([], new Set([failed.src]));
assert.notEqual(alternate.src, failed.src);
assert(retry.commit(alternate));
assert.equal(retry.peek().src, failed.src, 'Failed URL was lost from the bag');

const shared = create(['a', 'b', 'c', 'd'], () => 'only-master', () => .5);
const previous = [];
for (let i = 0; i < 24; i++) {
    const next = shared.peek(['only-master']);
    assert(!previous.slice(-3).includes(next.src), 'Master fallback broke the URL constraint');
    assert(shared.commit(next));
    previous.push(next.src);
}
