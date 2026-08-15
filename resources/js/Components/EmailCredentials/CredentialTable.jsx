import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, BarChart2, CirclePlus, CalendarDays } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import DataTable from '@/Components/DataTable';
import axios from 'axios';

/**
 * CredentialTable
 *
 * Props:
 *   credentials   – array from Inertia props
 *   onAdd         – () => void  — open create modal
 *   onEdit        – (row) => void — open edit modal
 *   onUsage       – (row) => void — open AI usage modal for this row
 */
export default function CredentialTable({ credentials, onAdd, onEdit, onUsage, onMonthUsage }) {
    const [revealed, setRevealed]     = useState({});   // id → plaintext
    const [loadingPwd, setLoadingPwd] = useState(null);

    // ── Reveal / hide password ────────────────────────────────────────────────
    const revealPassword = async (row) => {
        if (revealed[row.id] !== undefined) {
            setRevealed((prev) => { const n = { ...prev }; delete n[row.id]; return n; });
            return;
        }
        setLoadingPwd(row.id);
        try {
            const res = await axios.get(route('email-credentials.password', row.id));
            setRevealed((prev) => ({ ...prev, [row.id]: res.data.password }));
        } catch {
            alert('Could not reveal password.');
        } finally {
            setLoadingPwd(null);
        }
    };

    const destroy = (row) => {
        if (!confirm(`Delete credential for "${row.email}"?`)) return;
        router.delete(route('email-credentials.destroy', row.id), { preserveScroll: true });
    };

    // ── Column definitions ────────────────────────────────────────────────────
    const columns = [
        {
            key: 'email', label: 'Email',
            className: 'text-left font-medium text-gray-800',
        },
        {
            key: 'device_count', label: 'Devices',
            headerClassName: 'w-20', className: 'text-center',
            render: (row) => (
                <span className="text-sm text-gray-700">{row.device_count ?? 0}</span>
            ),
        },
        {
            key: 'used_with', label: 'Registered On',
            className: 'text-left',
            render: (row) => {
                const list = row.used_with ?? [];
                if (!list.length) return <span className="text-gray-400 text-xs">—</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {list.map((p) => (
                            <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                                {p}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'password', label: 'Password',
            headerClassName: 'w-40', className: 'text-left',
            render: (row) => {
                const plain     = revealed[row.id];
                const isLoading = loadingPwd === row.id;
                return (
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono tracking-wider">
                            {plain ? plain : '••••••••'}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); revealPassword(row); }}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-indigo-600 transition"
                            aria-label={plain ? 'Hide password' : 'Reveal password'}
                        >
                            {isLoading
                                ? <span className="text-xs text-gray-400">…</span>
                                : plain ? <EyeOff size={14} /> : <Eye size={14} />
                            }
                        </button>
                    </div>
                );
            },
        },
        {
            key: 'status', label: 'Status',
            headerClassName: 'w-24', className: 'text-center',
            render: (row) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    {row.status ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: '_actions', label: '',
            headerClassName: 'w-24', className: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    {/* AI Usage button */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onUsage(row); }}
                        title="AI monthly usage"
                        className="text-violet-400 hover:text-violet-600 transition"
                    >
                        <BarChart2 size={15} />
                    </button>
                    {/* Delete */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); destroy(row); }}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">Email Credentials</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Passwords are AES-256 encrypted and never shown in the listing.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onMonthUsage}
                        className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 transition font-medium"
                    >
                        <CalendarDays size={15} />
                        This Month
                    </button>
                    <PrimaryButton type="button" onClick={onAdd}>
                        Add Credential <CirclePlus size={16} className="ml-1" />
                    </PrimaryButton>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <DataTable
                    columns={columns}
                    data={credentials}
                    rowKey="id"
                    perPage={20}
                    emptyText="No email credentials yet. Add one above."
                    onRowClick={onEdit}
                />
            </div>
        </div>
    );
}
