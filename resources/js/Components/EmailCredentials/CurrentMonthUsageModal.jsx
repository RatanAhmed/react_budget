import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Save, RotateCcw, CalendarDays } from 'lucide-react';
import Modal from '@/Components/Modal';
import { MONTH_FULL, CURRENT_YEAR, getMonths, toggleMonth } from './constants';

/**
 * CurrentMonthUsageModal
 *
 * Rows    = email credentials
 * Columns = AI platforms (only those each email is registered on)
 * Cell    = ✗ (red X) if used this month, empty if not — click to toggle
 *
 * Props:
 *   show        – boolean
 *   onClose     – () => void
 *   credentials – full credentials array (id, email, used_with, ai_usages)
 *   platforms   – AiPlatform[] (id, name)
 */
export default function CurrentMonthUsageModal({ show, onClose, credentials = [], platforms = [] }) {
    const now        = new Date();
    const thisMonth  = now.getMonth() + 1;   // 1-indexed
    const thisYear   = CURRENT_YEAR;
    const monthLabel = `${MONTH_FULL[thisMonth - 1]} ${thisYear}`;

    // localChanges: map of credentialId → new ai_usages object (only dirty ones)
    const [localChanges, setLocalChanges] = useState({});
    const [saving, setSaving]             = useState(false);

    // Reset on open
    useEffect(() => {
        if (show) setLocalChanges({});
    }, [show]);

    if (!show) return null;

    // Get the working ai_usages for a credential (local override or persisted)
    const getUsages = (cred) => localChanges[cred.id] ?? cred.ai_usages ?? {};

    // Is a cell marked as used?
    const isUsed = (cred, agentName) =>
        getMonths(getUsages(cred), agentName, thisYear).includes(thisMonth);

    // Toggle a cell
    const toggle = (cred, agentName) => {
        const current = getUsages(cred);
        const updated = toggleMonth(current, agentName, thisYear, thisMonth);
        setLocalChanges((prev) => ({ ...prev, [cred.id]: updated }));
    };

    const isDirty = Object.keys(localChanges).length > 0;

    // Save all dirty credentials in sequence
    const save = async () => {
        setSaving(true);
        const dirtyIds = Object.keys(localChanges);
        let remaining  = dirtyIds.length;

        if (remaining === 0) { setSaving(false); onClose(); return; }

        dirtyIds.forEach((credId) => {
            router.post(
                route('email-credentials.ai-usages'),
                { id: Number(credId), ai_usages: localChanges[credId] },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        remaining -= 1;
                        if (remaining === 0) {
                            setSaving(false);
                            setLocalChanges({});
                            onClose();
                        }
                    },
                    onError: () => { setSaving(false); },
                }
            );
        });
    };

    const discard = () => setLocalChanges({});

    // Platforms to show as columns — only those that appear on at least one credential's used_with
    const activePlatformNames = platforms
        .map((p) => p.name)
        .filter((name) => credentials.some((c) => (c.used_with ?? []).includes(name)));

    // Credentials that have at least one registered platform
    const activeCredentials = credentials.filter(
        (c) => (c.used_with ?? []).some((name) => activePlatformNames.includes(name))
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col max-h-[90vh]">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-violet-50 to-white">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <CalendarDays size={18} className="text-violet-500" />
                            AI Current Month Usage
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            <span className="font-semibold text-violet-600">{monthLabel}</span>
                            {' '}— click a cell to mark{' '}
                            <span className="font-mono font-bold text-red-500">x</span>
                            {' '}when a token has been used this month.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {isDirty && (
                            <button type="button" onClick={discard}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
                                <RotateCcw size={13} /> Discard
                            </button>
                        )}
                        <button type="button" onClick={save}
                            disabled={saving || !isDirty}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            <Save size={13} />
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition p-1" aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ── Table ──────────────────────────────────────────────── */}
                <div className="overflow-auto flex-1">
                    {activeCredentials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <CalendarDays size={36} className="mb-3 text-violet-200" />
                            <p className="text-sm font-medium text-gray-500">No credentials with registered platforms yet.</p>
                            <p className="text-xs mt-1">Add credentials and register them on AI platforms first.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-20">
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    {/* Email column header */}
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 sticky left-0 bg-gray-50 z-30 border-r border-gray-200 whitespace-nowrap">
                                        Email
                                    </th>
                                    {/* AI platform headers */}
                                    {activePlatformNames.map((name) => (
                                        <th key={name}
                                            className="text-center px-3 py-3 min-w-28 border-r border-gray-100 last:border-r-0">
                                            <span className="block text-xs font-semibold text-gray-600 truncate max-w-24 mx-auto"
                                                title={name}>
                                                {name}
                                            </span>
                                        </th>
                                    ))}
                                    {/* Row summary header */}
                                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-3 border-l border-gray-200 w-16">
                                        Used
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {activeCredentials.map((cred, rowIdx) => {
                                    const registeredOn = cred.used_with ?? [];
                                    const rowBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';

                                    // Count how many platforms this cred used this month
                                    const usedCount = activePlatformNames.filter(
                                        (name) => registeredOn.includes(name) && isUsed(cred, name)
                                    ).length;

                                    return (
                                        <tr key={cred.id}
                                            className={`${rowBg} hover:bg-violet-50/20 transition-colors border-b border-gray-100 last:border-0`}>

                                            {/* Email */}
                                            <td className={`px-4 py-3 sticky left-0 z-10 border-r border-gray-200 whitespace-nowrap ${rowBg}`}>
                                                <span className="font-medium text-gray-800 text-sm"
                                                    title={cred.email}>
                                                    {cred.email}
                                                </span>
                                            </td>

                                            {/* Platform cells */}
                                            {activePlatformNames.map((name) => {
                                                const registered = registeredOn.includes(name);
                                                const used       = registered && isUsed(cred, name);

                                                return (
                                                    <td key={name}
                                                        className={`text-center px-3 py-3 border-r border-gray-100 last:border-r-0 ${
                                                            !registered ? 'bg-gray-50/60' : ''
                                                        }`}>
                                                        {registered ? (
                                                            /* Clickable toggle cell */
                                                            <button
                                                                type="button"
                                                                onClick={() => toggle(cred, name)}
                                                                title={`${used ? 'Mark unused' : 'Mark used'}: ${name} — ${cred.email}`}
                                                                className={`w-6 h-6 mx-auto rounded-lg flex items-center justify-center transition-all font-bold text-base select-none ${
                                                                    used
                                                                        ? 'bg-red-100 text-red-500 hover:bg-red-200 ring-1 ring-red-300'
                                                                        : 'bg-gray-100 text-gray-300 hover:bg-violet-100 hover:text-violet-400'
                                                                }`}
                                                                aria-label={`${name} ${used ? 'used' : 'not used'} for ${cred.email}`}
                                                            >
                                                                {used ? 'x' : ''}
                                                            </button>
                                                        ) : (
                                                            /* Not registered — greyed out dash */
                                                            <span className="text-gray-200 text-lg select-none" title="Not registered on this platform">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {/* Row usage count */}
                                            <td className="text-center px-3 py-3 border-l border-gray-200">
                                                {usedCount > 0 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                                                        {usedCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* Footer: column totals */}
                            {/* <tfoot className="sticky bottom-0 z-20">
                                <tr className="border-t-2 border-gray-200 bg-gray-100">
                                    <td className="px-4 py-2.5 text-xs font-bold text-gray-600 sticky left-0 bg-gray-100 border-r border-gray-200 z-30">
                                        Total used
                                    </td>
                                    {activePlatformNames.map((name) => {
                                        const total = activeCredentials.filter(
                                            (c) => (c.used_with ?? []).includes(name) && isUsed(c, name)
                                        ).length;
                                        return (
                                            <td key={name} className="text-center px-3 py-2.5 border-r border-gray-100 last:border-r-0">
                                                {total > 0 ? (
                                                    <span className="text-xs font-bold text-red-500">{total}</span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">0</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="border-l border-gray-200 text-center px-3 py-2.5 bg-gray-100">
                                        <span className="text-xs font-bold text-red-500">
                                            {activeCredentials.reduce((sum, c) =>
                                                sum + activePlatformNames.filter(
                                                    (name) => (c.used_with ?? []).includes(name) && isUsed(c, name)
                                                ).length, 0
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot> */}
                        </table>
                    )}
                </div>

                {/* Unsaved banner */}
                {isDirty && (
                    <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 text-xs text-amber-700 flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        <span className="font-semibold">Unsaved changes</span>
                        <span className="text-amber-600">— click Save to persist or Discard to revert.</span>
                    </div>
                )}

            </div>
        </Modal>
    );
}
