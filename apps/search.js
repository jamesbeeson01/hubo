// Decides what the Results list shows for the text typed in the omnibox.
// Open mode: the text matches an app name (any type), so show those apps.
// Prompt mode: it matches nothing, so show the AIs the text could be sent to.
// Matching is name-only; swap `rankName` for fuzzy matching later.

function rankName(name, query) {
    const n = name.toLowerCase();
    if (n.startsWith(query)) return 0;
    if (n.includes(query)) return 1;
    return -1;
}

function search(registry, pinnedId, text) {
    const query = text.trim().toLowerCase();
    if (!query) return { mode: 'none', results: [] };

    const matches = registry
        .map((app, index) => ({ app, index, rank: rankName(app.name, query) }))
        .filter(m => m.rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .map(m => m.app);
    if (matches.length) return { mode: 'open', results: matches };

    const ais = registry.filter(app => app.type === 'ai');
    const pinned = ais.filter(app => app.id === pinnedId);
    return { mode: 'prompt', results: [...pinned, ...ais.filter(app => app.id !== pinnedId)] };
}

module.exports = { search };
