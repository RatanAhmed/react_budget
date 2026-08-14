import React, { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import NewAgentsModal from './NewAgentsModal';
import { CirclePlus, X, Sparkles, ExternalLink } from 'lucide-react';
import axios from 'axios';

// ── Constants ─────────────────────────────────────────────────────────────────

const selectCls = 'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

const TOKEN_RESET_LABELS = {
    monthly: { label: 'Monthly', cls: 'bg-violet-100 text-violet-700' },
    weekly:  { label: 'Weekly',  cls: 'bg-blue-100 text-blue-700' },
    daily:   { label: 'Daily',   cls: 'bg-orange-100 text-orange-700' },
    none:    { label: 'None',    cls: 'bg-gray-100 text-gray-500' },
};

const CATEGORIES = ['Chat', 'Image', 'Video', 'Audio', 'Code', 'Search', 'Writing', 'Productivity', 'Other'];

// ── Suggestion dropdown ───────────────────────────────────────────────────────

function SuggestionDropdown({ query, onSelect, excludeNames }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        clearTimeout(timerRef.current);
        if (!query.trim()) { setSuggestions([]); return; }
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(route('ai-platforms.suggestions'), { params: { q: query } });
                setSuggestions(res.data.filter(s => !excludeNames.includes(s.name)));
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 280);
        return () => clearTimeout(timerRef.current);
    }, [query]);

    if (!query.trim() || (!loading && !suggestions.length)) return null;

    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {loading ? (
                <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="animate-pulse text-violet-400" /> Looking for suggestions…
                </div>
            ) : (
                <>
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100 flex items-center gap-1">
                        <Sparkles size={11} className="text-violet-400" /> Suggestions
                    </div>
                    {suggestions.map((s) => (
                        <button
                            key={s.name}
                            type="button"
                            onClick={() => onSelect(s)}
                            className="w-full text-left px-3 py-2 hover:bg-violet-50 transition flex items-center justify-between group"
                        >
                            <div>
                                <span className="text-sm font-medium text-gray-800">{s.name}</span>
                                {s.category && (
                                    <span className="ml-2 text-xs text-gray-400">{s.category}</span>
                                )}
                            </div>
                            {s.website && (
                                <span className="text-xs text-gray-300 group-hover:text-violet-400 flex items-center gap-0.5">
                                    <ExternalLink size={11} /> {new URL(s.website).hostname}
                                </span>
                            )}
                        </button>
                    ))}
                </>
            )}
        </div>
    );
}

// ── Platform form modal ───────────────────────────────────────────────────────

function PlatformFormModal({ show, onClose, initial, existingNames }) {
    const isEditing = Boolean(initial?.id);

    const { data, setData, post, processing, reset, errors } = useForm({
        id:          initial?.id          ?? null,
        name:        initial?.name        ?? '',
        website:     initial?.website     ?? '',
        category:    initial?.category    ?? '',
        token_reset: initial?.token_reset ?? 'monthly',
        description: initial?.description ?? '',
        status:      initial?.status      ?? true,
    });

    const [showDropdown, setShowDropdown] = useState(false);
    const nameRef = useRef(null);

    const handleClose = () => { reset(); onClose(); };

    const fillFromSuggestion = (s) => {
        setData((prev) => ({
            ...prev,
            name:        s.name        ?? prev.name,
            website:     s.website     ?? prev.website,
            category:    s.category    ?? prev.category,
            token_reset: s.token_reset ?? prev.token_reset,
        }));
        setShowDropdown(false);
        nameRef.current?.focus();
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            name:        data.name,
            website:     data.website,
            category:    data.category,
            token_reset: data.token_reset,
            description: data.description,
            status:      data.status,
        };
        if (isEditing) {
            router.post(route('ai-platforms.store'), { ...payload, id: data.id },
                { preserveScroll: true, onSuccess: handleClose });
        } else {
            post(route('ai-platforms.store'), { onSuccess: handleClose });
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="xl">
            <form onSubmit={submit} className="flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditing ? 'Edit AI Platform' : 'Add AI Platform'}
                        </h2>
                        {!isEditing && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Sparkles size={11} className="text-violet-400" />
                                Start typing the name for smart suggestions
                            </p>
                        )}
                    </div>
                    <button type="button" onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

                    {/* Name with suggestion dropdown */}
                    <div>
                        <InputLabel value="Platform Name *" />
                        <div className="relative mt-1">
                            <TextInput
                                ref={nameRef}
                                className="block w-full"
                                value={data.name}
                                onChange={(e) => { setData('name', e.target.value); if (!isEditing) setShowDropdown(true); }}
                                onFocus={() => { if (!isEditing && data.name) setShowDropdown(true); }}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                                placeholder="e.g. ChatGPT"
                                required
                                autoComplete="off"
                            />
                            {!isEditing && showDropdown && (
                                <SuggestionDropdown
                                    query={data.name}
                                    onSelect={fillFromSuggestion}
                                    excludeNames={existingNames}
                                />
                            )}
                        </div>
                        <InputError className="mt-1" message={errors.name} />
                    </div>

                    {/* Website + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Website" />
                            <TextInput
                                type="url"
                                className="mt-1 block w-full"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                placeholder="https://example.com"
                            />
                            <InputError className="mt-1" message={errors.website} />
                        </div>
                        <div>
                            <InputLabel value="Category" />
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="">— Select —</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.category} />
                        </div>
                    </div>

                    {/* Token reset + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Token Reset *" />
                            <select
                                required
                                value={data.token_reset}
                                onChange={(e) => setData('token_reset', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="daily">Daily</option>
                                <option value="none">None (unlimited)</option>
                            </select>
                            <InputError className="mt-1" message={errors.token_reset} />
                        </div>
                        <div>
                            <InputLabel value="Status *" />
                            <select
                                required
                                value={data.status ? '1' : '0'}
                                onChange={(e) => setData('status', e.target.value === '1')}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <InputError className="mt-1" message={errors.status} />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <InputLabel value="Description" />
                        <textarea
                            rows={2}
                            className={`mt-1 ${selectCls}`}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Short description of the platform…"
                        />
                        <InputError className="mt-1" message={errors.description} />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg shrink-0">
                    <DangerButton type="button" onClick={handleClose}>Cancel</DangerButton>
                    <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={() => reset()}>Reset</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Update' : 'Save'}
                        </PrimaryButton>
                    </div>
                </div>

            </form>
        </Modal>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Index({ auth, platforms }) {
    const [modal, setModal]             = useState(false);
    const [editTarget, setTarget]       = useState(null);
    const [discoverModal, setDiscover]  = useState(false);

    const openCreate = () => { setTarget(null); setModal(true); };
    const openEdit   = (row) => { setTarget(row); setModal(true); };
    const closeModal = () => { setModal(false); setTarget(null); };

    const destroy = (row) => {
        if (!confirm(`Delete "${row.name}"?`)) return;
        router.delete(route('ai-platforms.destroy', row.id), { preserveScroll: true });
    };

    const existingNames = platforms.map((p) => p.name);

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns = [
        {
            key: 'name', label: 'Name',
            className: 'text-left font-medium text-gray-800',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span>{row.name}</span>
                    {row.website && (
                        <a href={row.website} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-300 hover:text-indigo-500 transition"
                            title={row.website}>
                            <ExternalLink size={13} />
                        </a>
                    )}
                </div>
            ),
        },
        {
            key: 'category', label: 'Category',
            headerClassName: 'w-28', className: 'text-left',
            render: (row) => row.category
                ? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{row.category}</span>
                : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            key: 'token_reset', label: 'Token Reset',
            headerClassName: 'w-28', className: 'text-center',
            render: (row) => {
                const t = TOKEN_RESET_LABELS[row.token_reset] ?? TOKEN_RESET_LABELS.none;
                return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.cls}`}>{t.label}</span>;
            },
        },
        {
            key: 'description', label: 'Description',
            className: 'text-left text-gray-500 text-sm',
            render: (row) => row.description
                ? <span className="truncate max-w-xs block">{row.description}</span>
                : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            key: 'status', label: 'Status',
            headerClassName: 'w-24', className: 'text-center',
            render: (row) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                    {row.status ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: '_actions', label: '',
            headerClassName: 'w-16', className: 'text-right',
            render: (row) => (
                <button type="button"
                    onClick={(e) => { e.stopPropagation(); destroy(row); }}
                    className="text-xs text-red-400 hover:text-red-600 transition">
                    Delete
                </button>
            ),
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="AI Platforms" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-violet-50 to-white border-b border-gray-100">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">AI Platforms</h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Manage the AI platforms used across email credentials and usage tracking.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setDiscover(true)}
                                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 transition font-medium"
                            >
                                <Sparkles size={15} /> Discover New
                            </button>
                            <PrimaryButton type="button" onClick={openCreate}>
                                Add Platform <CirclePlus size={16} className="ml-1" />
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={platforms}
                            rowKey="id"
                            perPage={25}
                            emptyText="No AI platforms yet."
                            onRowClick={openEdit}
                        />
                    </div>
                </div>
            </div>

            <PlatformFormModal
                show={modal}
                onClose={closeModal}
                initial={editTarget}
                existingNames={existingNames}
            />

            <NewAgentsModal
                show={discoverModal}
                onClose={() => setDiscover(false)}
                onAdded={() => router.reload({ only: ['platforms'] })}
            />
        </AuthenticatedLayout>
    );
}
