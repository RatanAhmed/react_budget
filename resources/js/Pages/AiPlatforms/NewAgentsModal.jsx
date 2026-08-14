import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { X, ExternalLink, Sparkles, Search, CheckCircle2, PlusCircle, RefreshCw, Filter, MonitorDot } from 'lucide-react';
import Modal from '@/Components/Modal';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'AI IDE', 'Chat', 'Code', 'Image', 'Video', 'Audio', 'Writing', 'Productivity', 'Search'];

const CATEGORY_COLOR = {
    'AI IDE':     'bg-cyan-100 text-cyan-800',
    Chat:         'bg-indigo-100 text-indigo-700',
    Code:         'bg-emerald-100 text-emerald-700',
    Image:        'bg-pink-100 text-pink-700',
    Video:        'bg-rose-100 text-rose-700',
    Audio:        'bg-amber-100 text-amber-700',
    Writing:      'bg-teal-100 text-teal-700',
    Productivity: 'bg-lime-100 text-lime-700',
    Search:       'bg-sky-100 text-sky-700',
};

const TOKEN_LABEL = { monthly: 'Monthly reset', weekly: 'Weekly reset', daily: 'Daily reset', none: 'No reset' };

// ─────────────────────────────────────────────────────────────────────────────
// Agent Card
// ─────────────────────────────────────────────────────────────────────────────

function AgentCard({ agent, onAdd, added }) {
    const catCls  = CATEGORY_COLOR[agent.category] ?? 'bg-gray-100 text-gray-600';
    const isIde   = agent.category === 'AI IDE';

    return (
        <div className={`relative flex flex-col border rounded-xl p-4 transition-all ${
            added
                ? 'border-green-300 bg-green-50/50'
                : isIde
                    ? 'border-cyan-200 bg-white hover:border-cyan-400 hover:shadow-md'
                    : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-md'
        }`}>

            {/* IDE corner ribbon */}
            {isIde && !added && (
                <div className="absolute top-0 right-0 overflow-hidden w-14 h-14 pointer-events-none">
                    <div className="absolute top-2.5 right-[-14px] rotate-45 bg-cyan-500 text-white text-[9px] font-bold px-5 py-0.5 shadow-sm">
                        IDE
                    </div>
                </div>
            )}

            {/* Added checkmark */}
            {added && (
                <div className="absolute top-3 right-3">
                    <CheckCircle2 size={18} className="text-green-500" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-2 mb-2 pr-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {isIde && <MonitorDot size={13} className="text-cyan-500 shrink-0" />}
                        <span className="font-semibold text-gray-800 text-sm">{agent.name}</span>
                        {agent.website && (
                            <a href={agent.website} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-300 hover:text-indigo-500 transition shrink-0"
                            >
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{agent.description}</p>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {agent.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catCls}`}>
                        {agent.category}
                    </span>
                )}
                {agent.launched && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        🚀 {agent.launched}
                    </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    agent.token_reset === 'none' ? 'bg-gray-100 text-gray-500' : 'bg-violet-100 text-violet-600'
                }`}>
                    {TOKEN_LABEL[agent.token_reset] ?? agent.token_reset}
                </span>
            </div>

            {/* Free tier */}
            <div className={`rounded-lg px-3 py-2 mb-3 text-xs flex-1 ${
                agent.free_tier
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
            }`}>
                <span className={`font-semibold block mb-0.5 ${agent.free_tier ? 'text-green-700' : 'text-gray-500'}`}>
                    {agent.free_tier ? '✓ Free tier available' : '✗ No free tier'}
                </span>
                {agent.free_details && (
                    <p className={`leading-snug ${agent.free_tier ? 'text-green-600' : 'text-gray-400'}`}>
                        {agent.free_details}
                    </p>
                )}
            </div>

            {/* Add button */}
            {!added ? (
                <button
                    type="button"
                    onClick={() => onAdd(agent)}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition ${
                        isIde
                            ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                >
                    <PlusCircle size={14} /> Add to My List
                </button>
            ) : (
                <div className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-green-100 text-green-700">
                    <CheckCircle2 size={14} /> Added
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NewAgentsModal
 *
 * Props:
 *   show      – boolean
 *   onClose   – () => void
 *   onAdded   – () => void — called after adding so the page can refresh
 */
export default function NewAgentsModal({ show, onClose, onAdded }) {
    const [agents, setAgents]       = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);
    const [search, setSearch]       = useState('');
    const [category, setCategory]   = useState('All');
    const [freeOnly, setFreeOnly]   = useState(false);
    const [addedIds, setAddedIds]   = useState(new Set()); // track added names
    const [adding, setAdding]       = useState(null);      // name being added

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(route('ai-platforms.new-agents'), {
                params: {
                    q:         search,
                    category:  category === 'All' ? '' : category,
                    free_only: freeOnly ? 1 : 0,
                },
            });
            setAgents(res.data);
        } catch (e) {
            setError('Could not load agents. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [search, category, freeOnly]);

    // Fetch on open and when filters change
    useEffect(() => {
        if (!show) return;
        const t = setTimeout(fetchAgents, search ? 300 : 0);
        return () => clearTimeout(t);
    }, [show, fetchAgents]);

    // Reset state on open
    useEffect(() => {
        if (show) { setAddedIds(new Set()); setSearch(''); setCategory('All'); setFreeOnly(false); }
    }, [show]);

    const handleAdd = (agent) => {
        if (addedIds.has(agent.name) || adding === agent.name) return;
        setAdding(agent.name);
        router.post(
            route('ai-platforms.store'),
            {
                name:        agent.name,
                website:     agent.website     ?? '',
                category:    agent.category    ?? '',
                token_reset: agent.token_reset ?? 'monthly',
                description: agent.description ?? '',
                status:      true,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddedIds((prev) => new Set([...prev, agent.name]));
                    setAdding(null);
                    // Remove from list so it won't show after refresh
                    setAgents((prev) => prev.filter((a) => a.name !== agent.name));
                    onAdded?.();
                },
                onError: () => setAdding(null),
            }
        );
    };

    const totalResults = agents.length;

    return (
        <Modal show={show} onClose={onClose} maxWidth="screen">
            <div className="flex flex-col max-h-[92vh]">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-violet-50 to-white">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Sparkles size={18} className="text-violet-500" />
                            Discover New AI Agents
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Recently launched platforms not yet in your list — including agentic AI IDEs with free tier details.
                            Click "Add to My List" to save any platform.
                        </p>
                    </div>
                    <button type="button" onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition shrink-0 p-1" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Filters ─────────────────────────────────────────────── */}
                <div className="px-6 py-3 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex flex-wrap items-center gap-3">

                        {/* Search */}
                        <div className="relative flex-1 min-w-48">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search agents…"
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                        </div>

                        {/* Category pills */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <Filter size={13} className="text-gray-400 mr-0.5" />
                            {CATEGORIES.map((cat) => (
                                <button key={cat} type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                                        category === cat
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Free only toggle */}
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none shrink-0">
                            <input
                                type="checkbox"
                                checked={freeOnly}
                                onChange={(e) => setFreeOnly(e.target.checked)}
                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            Free tier only
                        </label>

                        {/* Refresh */}
                        <button type="button" onClick={fetchAgents}
                            disabled={loading}
                            className="text-gray-400 hover:text-violet-600 transition disabled:opacity-40"
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>

                        {/* Result count */}
                        {!loading && (
                            <span className="text-xs text-gray-400 ml-auto">
                                {totalResults} agent{totalResults !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                <div className="overflow-y-auto flex-1 p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                            <Sparkles size={18} className="animate-pulse text-violet-400" />
                            <span className="text-sm">Loading agents…</span>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="text-center py-12">
                            <p className="text-sm text-red-500 mb-3">{error}</p>
                            <button type="button" onClick={fetchAgents}
                                className="text-xs px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition">
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && agents.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Sparkles size={32} className="mx-auto mb-3 text-violet-200" />
                            <p className="text-sm font-medium text-gray-500">All caught up!</p>
                            <p className="text-xs mt-1">
                                {search || category !== 'All' || freeOnly
                                    ? 'No agents match your filters.'
                                    : 'All known agents are already in your list.'}
                            </p>
                        </div>
                    )}

                {!loading && !error && agents.length > 0 && (
                    <>
                        {/* AI IDE callout banner */}
                        {category === 'AI IDE' && (
                            <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200">
                                <MonitorDot size={18} className="text-cyan-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-cyan-800">Agentic AI-Powered IDEs</p>
                                    <p className="text-xs text-cyan-700 mt-0.5 leading-relaxed">
                                        These are full development environments where the AI doesn't just suggest code —
                                        it <strong>plans, writes, runs, tests and iterates</strong> autonomously across your entire codebase.
                                        Many are free to start. Hover any card for details.
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {agents.map((agent) => (
                                <AgentCard
                                    key={agent.name}
                                    agent={agent}
                                    added={addedIds.has(agent.name)}
                                    onAdd={adding === agent.name ? () => {} : handleAdd}
                                />
                            ))}
                        </div>
                    </>
                )}
                </div>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 shrink-0 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Free tier details are curated and may change — always verify on the platform's website.
                    </p>
                    <button type="button" onClick={onClose}
                        className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
                        Close
                    </button>
                </div>

            </div>
        </Modal>
    );
}
