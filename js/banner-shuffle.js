/* Session-local shuffle bags. Peeking (including preload) never counts as a view. */
function createBannerShuffle(pool, masterOf, random = Math.random) {
    const urls = [...new Set(pool.filter(Boolean))];
    const recent = [];
    let remaining = [];
    let cycle = 0;

    function refill() {
        remaining = urls.slice();
        for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        cycle++;
    }

    return {
        peek(recentMasters = [], excluded = new Set()) {
            if (!remaining.length) refill();
            const avoid = recent.slice(0, Math.min(3, urls.length - 1));
            const eligible = remaining.filter(src => !avoid.includes(src) && !excluded.has(src));
            // Keep shuffle order as the tiebreaker; relax oldest master first.
            for (let n = recentMasters.length; n >= 0; n--) {
                const masters = recentMasters.slice(0, n);
                const src = eligible.find(url => !masters.includes(masterOf(url)));
                if (src) return { src, cycle };
            }
            return null;
        },
        commit(pick) {
            if (pick?.cycle !== cycle) return false;
            const index = remaining.indexOf(pick.src);
            if (index < 0) return false;
            remaining.splice(index, 1);
            recent.unshift(pick.src);
            recent.length = Math.min(recent.length, 3);
            return true;
        }
    };
}
