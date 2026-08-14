// ── NOTE ─────────────────────────────────────────────────────────────────────
// AI_AGENTS are no longer hardcoded here. They come from the `ai_platforms`
// table via Inertia props. Components receive a `platforms` prop instead.
// ─────────────────────────────────────────────────────────────────────────────

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const MONTH_FULL = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

export const CURRENT_YEAR = new Date().getFullYear();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shared Tailwind select class */
export const selectCls =
    'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

/** Toggle an item in/out of an array */
export function toggleItem(arr, item) {
    return arr.includes(item)
        ? arr.filter((v) => v !== item)
        : [...arr, item];
}

/** Storage key for ai_usages map: "Agent|YYYY" */
export const usageKey = (agent, year) => `${agent}|${year}`;

/** Read the month-numbers array for an agent+year */
export function getMonths(aiUsages, agent, year) {
    return aiUsages[usageKey(agent, year)] ?? [];
}

/** Return a new aiUsages map with month toggled (1-indexed) */
export function toggleMonth(aiUsages, agent, year, month) {
    const k   = usageKey(agent, year);
    const cur = aiUsages[k] ?? [];
    const next = cur.includes(month)
        ? cur.filter((m) => m !== month)
        : [...cur, month].sort((a, b) => a - b);
    const updated = { ...aiUsages };
    if (next.length === 0) delete updated[k];
    else updated[k] = next;
    return updated;
}
