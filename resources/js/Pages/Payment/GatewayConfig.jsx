import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, X, Eye, EyeOff, RotateCcw, Trash2, Settings } from 'lucide-react';

const GATEWAY_CREDENTIAL_FIELDS = {
    bkash: [
        { key: 'app_key',    label: 'App Key',    type: 'text' },
        { key: 'app_secret', label: 'App Secret', type: 'password' },
        { key: 'username',   label: 'Username',   type: 'text' },
        { key: 'password',   label: 'Password',   type: 'password' },
    ],
    nagad: [
        { key: 'merchant_id',          label: 'Merchant ID',          type: 'text' },
        { key: 'merchant_private_key', label: 'Merchant Private Key', type: 'textarea' },
        { key: 'nagad_public_key',     label: 'Nagad Public Key',     type: 'textarea' },
    ],
    card: [
        { key: 'store_id',     label: 'Store ID',       type: 'text' },
        { key: 'store_passwd', label: 'Store Password', type: 'password' },
    ],
    cash: [],
};

const STATUS_BADGE = ({ active, deleted }) => {
    if (deleted) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Deleted</span>;
    return active
        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
        : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>;
};

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function GatewayConfig({ auth, gateways }) {
    const { flash } = usePage().props;
    const [modal, setModal]           = useState(false);
    const [editing, setEditing]       = useState(null);
    const [showSecrets, setShowSecrets] = useState({});
    const [form, setForm]             = useState(defaultForm());
    const [processing, setProcessing] = useState(false);

    function defaultForm(gw = null) {
        return {
            name:        gw?.name        ?? '',
            slug:        gw?.slug        ?? '',
            color:       gw?.color       ?? '#2563EB',
            description: gw?.description ?? '',
            is_active:   gw?.is_active   ?? false,
            is_sandbox:  gw?.is_sandbox  ?? true,
            sort_order:  gw?.sort_order  ?? 0,
            settings:    gw?.settings    ?? { fee_type: 'percent', fee_value: 0 },
            credentials: {},   // always blank — user must re-enter to update
        };
    }

    const openCreate = () => {
        setEditing(null);
        setForm(defaultForm());
        setModal(true);
    };

    const openEdit = (gw) => {
        setEditing(gw);
        setForm(defaultForm(gw));
        setModal(true);
    };

    const closeModal = () => { setModal(false); setEditing(null); };

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const setCred  = (key, value) => setForm(f => ({ ...f, credentials: { ...f.credentials, [key]: value } }));
    const setSetting = (key, value) => setForm(f => ({ ...f, settings: { ...f.settings, [key]: value } }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const payload = { ...form };
        // Strip empty credential values — don't overwrite with blanks
        const creds = Object.fromEntries(
            Object.entries(payload.credentials).filter(([, v]) => v !== '')
        );
        payload.credentials = Object.keys(creds).length ? creds : undefined;

        if (editing) {
            router.put(route('admin.payment-gateways.update', editing.id), payload, {
                onFinish: () => { setProcessing(false); closeModal(); },
            });
        } else {
            router.post(route('admin.payment-gateways.store'), payload, {
                onFinish: () => { setProcessing(false); closeModal(); },
            });
        }
    };

    const destroy = (gw) => {
        if (!confirm(`Remove ${gw.name}?`)) return;
        router.delete(route('admin.payment-gateways.destroy', gw.id));
    };

    const restore = (gw) => {
        router.post(route('admin.payment-gateways.restore', gw.id));
    };

    const credFields = GATEWAY_CREDENTIAL_FIELDS[form.slug] ?? [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Payment Gateways" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Payment Gateways</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Configure bKash, Nagad, Card, and Cash payment methods.</p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            <CirclePlus size={15} /> Add Gateway
                        </button>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mx-4 mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                            {flash.success}
                        </div>
                    )}

                    {/* Gateway cards */}
                    <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gateways.map(gw => (
                            <div
                                key={gw.id}
                                className={`rounded-xl border p-4 flex flex-col gap-3 ${gw.deleted_at ? 'opacity-60 border-dashed border-gray-300' : 'border-gray-200'}`}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{ backgroundColor: gw.color }}
                                        >
                                            {gw.name.charAt(0)}
                                        </span>
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm">{gw.name}</div>
                                            <div className="text-xs text-gray-400">{gw.slug}</div>
                                        </div>
                                    </div>
                                    <STATUS_BADGE active={gw.is_active} deleted={!!gw.deleted_at} />
                                </div>

                                {/* Description */}
                                {gw.description && (
                                    <p className="text-xs text-gray-500 leading-relaxed">{gw.description}</p>
                                )}

                                {/* Meta */}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${gw.is_sandbox ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {gw.is_sandbox ? 'Sandbox' : 'Live'}
                                    </span>
                                    {gw.settings?.fee_value > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            Fee: {gw.settings.fee_value}{gw.settings.fee_type === 'percent' ? '%' : ' BDT'}
                                        </span>
                                    )}
                                    {gw.credential_keys?.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                            {gw.credential_keys.length} credential{gw.credential_keys.length > 1 ? 's' : ''} set
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                                    {gw.deleted_at ? (
                                        <button
                                            onClick={() => restore(gw)}
                                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                                        >
                                            <RotateCcw size={13} /> Restore
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => openEdit(gw)}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                <Settings size={13} /> Configure
                                            </button>
                                            <button
                                                onClick={() => destroy(gw)}
                                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium ml-auto"
                                            >
                                                <Trash2 size={13} /> Remove
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Modal ──────────────────────────────────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <form onSubmit={submit}>
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                                <h2 className="text-base font-bold text-gray-800">
                                    {editing ? `Configure ${editing.name}` : 'Add Payment Gateway'}
                                </h2>
                                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-5">

                                {/* Basic info */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                                        <input value={form.name} onChange={e => setField('name', e.target.value)}
                                            className={inputCls} placeholder="e.g. bKash" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
                                        <input value={form.slug} onChange={e => setField('slug', e.target.value.toLowerCase())}
                                            className={inputCls} placeholder="e.g. bkash"
                                            disabled={!!editing} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Brand Color</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={form.color}
                                                onChange={e => setField('color', e.target.value)}
                                                className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5" />
                                            <input value={form.color} onChange={e => setField('color', e.target.value)}
                                                className={inputCls} placeholder="#E2136E" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
                                        <input type="number" value={form.sort_order}
                                            onChange={e => setField('sort_order', parseInt(e.target.value))}
                                            className={inputCls} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                                        rows={2} className={inputCls} placeholder="Short description shown to users" />
                                </div>

                                {/* Toggles */}
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" checked={form.is_active}
                                            onChange={e => setField('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" checked={form.is_sandbox}
                                            onChange={e => setField('is_sandbox', e.target.checked)}
                                            className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400" />
                                        <span className="text-sm text-gray-700">Sandbox / Test mode</span>
                                    </label>
                                </div>

                                {/* Fee settings */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Fee Settings</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Fee Type</label>
                                            <select value={form.settings?.fee_type ?? 'percent'}
                                                onChange={e => setSetting('fee_type', e.target.value)}
                                                className={inputCls}>
                                                <option value="percent">Percentage (%)</option>
                                                <option value="fixed">Fixed (BDT)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Fee Value</label>
                                            <input type="number" step="0.01" min="0"
                                                value={form.settings?.fee_value ?? 0}
                                                onChange={e => setSetting('fee_value', parseFloat(e.target.value))}
                                                className={inputCls} />
                                        </div>
                                    </div>
                                </div>

                                {/* Credentials */}
                                {credFields.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                            API Credentials
                                            {editing && <span className="ml-2 text-gray-400 font-normal normal-case">(leave blank to keep existing)</span>}
                                        </label>
                                        <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            {credFields.map(field => (
                                                <div key={field.key}>
                                                    <label className="block text-xs text-gray-600 mb-1">{field.label}</label>
                                                    {field.type === 'textarea' ? (
                                                        <textarea
                                                            value={form.credentials[field.key] ?? ''}
                                                            onChange={e => setCred(field.key, e.target.value)}
                                                            rows={3}
                                                            className={`${inputCls} font-mono text-xs`}
                                                            placeholder={`Paste ${field.label} here`}
                                                        />
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                                                                value={form.credentials[field.key] ?? ''}
                                                                onChange={e => setCred(field.key, e.target.value)}
                                                                className={`${inputCls} pr-9 font-mono`}
                                                                placeholder={editing ? '••••••••' : `Enter ${field.label}`}
                                                            />
                                                            {field.type === 'password' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowSecrets(s => ({ ...s, [field.key]: !s[field.key] }))}
                                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    tabIndex={-1}
                                                                >
                                                                    {showSecrets[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal footer */}
                            <div className="px-6 pb-5 flex gap-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                                    {processing ? 'Saving…' : editing ? 'Save Changes' : 'Add Gateway'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
