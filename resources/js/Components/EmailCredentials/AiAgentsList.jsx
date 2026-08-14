import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ExternalLink, BarChart2, Settings } from 'lucide-react';

/**
 * AiAgentsList
 *
 * Read-only card listing all active AI platforms.
 * For each platform it shows which emails are registered on it
 * and how many months of usage are logged (across all years).
 *
 * Props:
 *   platforms    – AiPlatform[] from Inertia props
 *   credentials  – EmailCredential[] (includes ai_usages + used_with)
 *   onUsage      – (credential) => void  – opens the matrix modal for that credential
 */

const TOKEN_BADGE = {
    monthly: { label: 'Resets monthly', cls: 'bg-violet-100 text-violet-600' },
    weekly:  { label: 'Resets weekly',  cls: 'bg-blue-100 text-blue-600' },
    daily:   { label: 'Resets daily',   cls: 'bg-orange-100 text-orange-600' },
    none:    { label: 'No reset',       cls: 'bg-gray-100 text-gray-400' },
};

const CATEGORY_COLOR = {
    Chat:         'bg-indigo-50 text-indigo-700 border-indigo-200',
    Image:        'bg-pink-50 text-pink-700 border-pink-200',
    Video:        'bg-rose-50 text-rose-700 border-rose-200',
    Audio:        'bg-amber-50 text-amber-700 border-amber-200',
    Code:         'bg-emerald-50 text-emerald-700 border-emerald-200',
    Search:       'bg-sky-50 text-sky-700 border-sky-200',
    Writing:      'bg-teal-50 text-teal-700 border-teal-200',
    Productivity: 'bg-lime-50 text-lime-700 border-lime-200',
};

/** Count total months used for a platform across ALL years from ai_usages */
function totalMonthsUsed(credential, platformName) {
    const usages = credential.ai_usages ?? {};
    return Object.entries(usages)
        .filter(([k]) => k.startsWith(`${platformName}|`))
        .reduce((sum, [, months]) => sum + (months?.length ?? 0), 0);
}

export default function AiAgentsList({ platforms, credentials, onUsage }) {
    const [filter, setFilter] = useState('');

    if (!platforms.length) return null;

    const filtered = filter
        ? platforms.filter((p) =>
            p.name.toLowerCase().includes(filter.toLowerCase()) ||
            (p.category ?? '').toLowerCase().includes(filter.toLowerCase())
        )
        : platforms;

    // Group by category for display
    const grouped = filtered.reduce((acc, p) => {
        const cat = p.category ?? 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-white border-b border-gray-100">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">AI Platforms</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {platforms.length} platform{platforms.length !== 1 ? 's' : ''} — showing registered emails and usage per platform
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filter input */}
                    <input
                        type="search"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter platforms…"
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 w-44"
                    />
                    {/* Manage link */}
                    <Link
                        href={route('ai-platforms.index')}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    >
                        <Settings size={13} /> Manage
                    </Link>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
                {Object.keys(grouped).sort().map((category) => (
                    <div key={category}>
                        {/* Category heading */}
                        <h3 className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 ${CATEGORY_COLOR[category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {category}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {grouped[category].map((platform) => {
                                const token = TOKEN_BADGE[platform.token_reset] ?? TOKEN_BADGE.none;

                                // Credentials registered on this platform
                                const registeredCreds = credentials.filter((c) =>
                                    (c.used_with ?? []).includes(platform.name)
                                );

                                return (
                                    <div key={platform.id}
                                        className="border border-gray-200 rounded-lg p-3 hover:border-violet-300 hover:shadow-sm transition"
                                    >
                                        {/* Platform name + token reset badge */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-gray-800 text-sm truncate">
                                                        {platform.name}
                                                    </span>
                                                    {platform.website && (
                                                        <a
                                                            href={platform.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-300 hover:text-indigo-500 transition shrink-0"
                                                            title={platform.website}
                                                        >
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                {platform.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                        {platform.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${token.cls}`}>
                                                {token.label}
                                            </span>
                                        </div>

                                        {/* Registered credentials */}
                                        {registeredCreds.length > 0 ? (
                                            <div className="space-y-1">
                                                {registeredCreds.map((cred) => {
                                                    const months = totalMonthsUsed(cred, platform.name);
                                                    return (
                                                        <div key={cred.id}
                                                            className="flex items-center justify-between gap-2 bg-gray-50 rounded-md px-2 py-1.5"
                                                        >
                                                            <span className="text-xs text-gray-600 truncate flex-1">
                                                                {cred.email}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {months > 0 && (
                                                                    <span className="text-xs text-violet-600 font-semibold">
                                                                        {months}mo
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onUsage(cred)}
                                                                    title="View AI usage matrix"
                                                                    className="text-violet-300 hover:text-violet-600 transition"
                                                                >
                                                                    <BarChart2 size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-300 italic">No emails registered</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No platforms match your filter.</p>
                )}
            </div>
        </div>
    );
}
