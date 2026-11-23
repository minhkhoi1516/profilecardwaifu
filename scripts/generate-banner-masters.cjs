// Run from the repository root after editing banner provenance.
const fs = require('node:fs');
const { banners } = JSON.parse(fs.readFileSync('docs/V55_BANNER_MANIFEST.json', 'utf8'));
const byMaster = new Map();
for (const [url, record] of Object.entries(banners)) {
    const master = record.sameMasterAs || record.source;
    const group = byMaster.get(master) || [];
    group.push(url.replace(/^assets\/banners\/|\.webp$/g, ''));
    byMaster.set(master, group);
}
const shared = [...byMaster.values()].filter(group => group.length > 1);
const output = `/* Generated from docs/V55_BANNER_MANIFEST.json by scripts/generate-banner-masters.cjs. */
const BANNER_MASTER_BY_URL = new Map([
${shared.map(group => `    ${JSON.stringify(group)},`).join('\n')}
].flatMap(group => group.map(path => [\`assets/banners/\${path}.webp\`, group[0]])));
`;
if (process.argv.includes('--check')) {
    if (fs.readFileSync('js/banner-masters.js', 'utf8').replace(/\r\n/g, '\n') !== output) {
        throw new Error('Banner provenance map is stale.');
    }
} else {
    fs.writeFileSync('js/banner-masters.js', output);
}
