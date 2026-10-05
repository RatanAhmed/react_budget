import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';
import Modal from '@/Components/Modal';
import {
    MONTHS, MONTH_FULL, CURRENT_YEAR,
    usageKey, getMonths, toggleMonth,
} from './constants';

/**
 * AiUsageMatrixModal
 *
 * Opens a full-width modal showing the 10×12 AI usage grid for one credential.
 * The user can navigate years, check/uncheck months per agent, then save.
 *
 * Props:
 *   show        – boolean
 *   onClose     – () => void
 *   credential  – the credential object (id, email, ai_usages)
 */
export default function AiUsageMatrixModal({ show, onClose, credential, platforms = [] }) {
    const [year, setYear]             = useState(CURRENT_YEAR);
    const [localUsages, setLocalUsages] = useState(null);   // null = unmodified
    const [saving, setSaving]         = useState(false);

    // Reset local state whenever the modal opens for a new credential
    useEffect(() => {
        if (show) {
            setYear(CURRENT_YEAR);
            setLocalUsages(null);
        }
    }, [show, credential?.id]);

    if (!credential) return null;

    const aiUsages = localUsages ?? credential.ai_usages ?? {};
    const isDirty  = localUsages !== null;

    const registeredOn = new Set(credential.used_with ?? []);
    const agentNames = platforms.map((p) => p.name).filter((name) => registeredOn.has(name));

    const toggle = (agent, monthNum) => {
        setLocalUsages(toggleMonth(aiUsages, agent, year, monthNum));
    };

    const save = () => {
        setSaving(true);
        router.post(
            route('email-credentials.ai-usages'),
            { id: credential.id, ai_usages: aiUsages },
            {
                preserveScroll: true,
                onSuccess: () => { setLocalUsages(null); setSaving(false); onClose(); },
                onError:   () => setSaving(false),
            },
        );
    };

    const discard = () => setLocalUsages(null);

    // Select / deselect all months for a single agent in the current year
    const toggleAllForAgent = (agent) => {
        const current = getMonths(aiUsages, agent, year);
        const allSelected = current.length === 12;
        const k = usageKey(agent, year);
        const updated = { ...aiUsages };
        if (allSelected) {
            delete updated[k];
        } else {
            updated[k] = [1,2,3,4,5,6,7,8,9,10,11,12];
        }
        setLocalUsages(updated);
    };

    // Column totals (how many agents used a given month)
    const colTotal = (monthNum) =>
        agentNames.filter((a) => getMonths(aiUsages, a, year).includes(monthNum)).length;

    // Grand total
    const grandTotal = agentNames.reduce(
        (sum, a) => sum + getMonths(aiUsages, a, year).length, 0
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="flex flex-col max-h-[90vh]">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 shrink-0">
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                            <span className="font-semibold">{credential.email}</span> — mark months where token was consumed
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">

                        {/* Year navigator */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-0.5">
                            <button
                                type="button"
                                onClick={() => setYear((y) => y - 1)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
                                aria-label="Previous year"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            <span className="text-sm font-bold text-gray-700 w-11 text-center select-none">
                                {year}
                            </span>
                            <button
                                type="button"
                                onClick={() => setYear((y) => y + 1)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
                                aria-label="Next year"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>

                        {/* Discard */}
                        {isDirty && (
                            <button
                                type="button"
                                onClick={discard}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                            >
                                <RotateCcw size={13} /> Discard
                            </button>
                        )}

                        {/* Save */}
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving || !isDirty}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={13} />
                            {saving ? 'Saving…' : 'Save'}
                        </button>

                        {/* Close */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition p-1"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable matrix ────────────────────────────────────── */}
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm border-collapse min-w-[700px]">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                {/* Agent header */}
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-44 sticky left-0 bg-gray-50 z-30 border-r border-gray-200">
                                    AI Agent
                                </th>
                                {/* Month headers */}
                                {MONTHS.map((m, i) => (
                                    <th key={m} className={`text-center text-xs font-semibold uppercase tracking-wide px-2 py-3 w-12 ${
                                        i + 1 === new Date().getMonth() + 1 && year === CURRENT_YEAR
                                            ? 'text-violet-600 bg-violet-50'
                                            : 'text-gray-500'
                                    }`}>
                                        {m}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {agentNames.map((agent, rowIdx) => {
                                const usedMonths = getMonths(aiUsages, agent, year);
                                const count      = usedMonths.length;
                                const allChecked = count === 12;
                                const rowBg      = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';

                                return (
                                    <tr key={agent}
                                        className={`${rowBg} hover:bg-violet-50/30 transition-colors border-b border-gray-100 last:border-0`}
                                    >
                                        {/* Agent name + select-all toggle */}
                                        <td className={`text-start px-4 py-2.5 sticky left-0 z-10 border-r border-gray-200 ${rowBg}`}>
                                            <span className="font-medium text-gray-700 text-sm truncate">
                                                {agent}
                                            </span>
                                        </td>

                                        {/* Month checkboxes */}
                                        {MONTHS.map((_, monthIdx) => {
                                            const monthNum = monthIdx + 1;
                                            const checked  = usedMonths.includes(monthNum);
                                            const isCurrent = monthNum === new Date().getMonth() + 1 && year === CURRENT_YEAR;
                                            return (
                                                <td key={monthIdx}
                                                    className={`text-center px-2 py-2.5 ${isCurrent ? 'bg-violet-50/50' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggle(agent, monthNum)}
                                                        title={`${agent} — ${MONTH_FULL[monthIdx]} ${year}`}
                                                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>

                        {/* Footer: column totals */}
                        {/* <tfoot className="sticky bottom-0 z-20">
                            <tr className="border-t-2 border-gray-300 bg-gray-100">
                                <td className="px-4 py-2.5 text-xs font-bold text-gray-600 sticky left-0 bg-gray-100 border-r border-gray-200 z-30">
                                    Total
                                </td>
                                {MONTHS.map((_, monthIdx) => {
                                    const monthNum = monthIdx + 1;
                                    const total    = colTotal(monthNum);
                                    const isCurrent = monthNum === new Date().getMonth() + 1 && year === CURRENT_YEAR;
                                    return (
                                        <td key={monthIdx}
                                            className={`text-center px-2 py-2.5 text-xs font-bold ${isCurrent ? 'bg-violet-100' : ''}`}
                                        >
                                            {total > 0
                                                ? <span className="text-violet-700">{total}</span>
                                                : <span className="text-gray-300">0</span>
                                            }
                                        </td>
                                    );
                                })}
                            </tr>
                        </tfoot> */}
                    </table>
                </div>

                {/* Unsaved changes banner */}
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
