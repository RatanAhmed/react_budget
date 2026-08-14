import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X, Eye, EyeOff } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { selectCls, toggleItem } from './constants';

/**
 * CredentialFormModal
 *
 * Handles both create and edit.
 *
 * Props:
 *   show      – boolean
 *   onClose   – () => void
 *   initial   – row object to edit, or null for create
 */
export default function CredentialFormModal({ show, onClose, initial = null, platforms = [] }) {
    const isEditing = Boolean(initial?.id);

    const { data, setData, post, processing, reset, errors } = useForm({
        id:           initial?.id           ?? null,
        email:        initial?.email        ?? '',
        password:     '',
        device_count: initial?.device_count ?? 1,
        used_with:    initial?.used_with    ?? [],
        notes:        initial?.notes        ?? '',
        status:       initial?.status       ?? true,
    });

    const [showPwd, setShowPwd] = useState(false);

    const handleClose = () => { reset(); onClose(); };

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            email:        data.email,
            password:     data.password,
            device_count: data.device_count,
            used_with:    data.used_with,
            notes:        data.notes,
            status:       data.status,
        };
        if (isEditing) {
            router.post(
                route('email-credentials.store'),
                { ...payload, id: data.id },
                { preserveScroll: true, onSuccess: handleClose },
            );
        } else {
            post(route('email-credentials.store'), { onSuccess: handleClose });
        }
    };

    const handleReset = () => {
        if (isEditing) {
            // Only reset volatile fields, keep id/email intact
            setData((prev) => ({ ...prev, password: '', notes: initial?.notes ?? '' }));
        } else {
            reset();
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <form onSubmit={submit} className="flex flex-col max-h-[90vh]">

                {/* ── Sticky header ─────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditing ? 'Edit Credential' : 'Add Credential'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEditing
                                ? 'Update the email details. Leave password blank to keep the current one.'
                                : 'Password is encrypted with AES-256 before being stored.'
                            }
                        </p>
                    </div>
                    <button type="button" onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable body ────────────────────────────────────── */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                    {/* Email + Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Email Address *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                            <InputError className="mt-1" message={errors.email} />
                        </div>

                        <div>
                            <InputLabel value={isEditing ? 'New Password (leave blank to keep)' : 'Password *'} />
                            <div className="relative mt-1">
                                <TextInput
                                    type={showPwd ? 'text' : 'password'}
                                    className="block w-full pr-10"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={isEditing ? '••••••••' : 'Enter password'}
                                    required={!isEditing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-indigo-600 transition"
                                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <InputError className="mt-1" message={errors.password} />
                        </div>
                    </div>

                    {/* Device count + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Device Count *" />
                            <TextInput
                                type="number" min={0} max={9999}
                                className="mt-1 block w-full"
                                value={data.device_count}
                                onChange={(e) => setData('device_count', parseInt(e.target.value, 10) || 0)}
                                required
                            />
                            <InputError className="mt-1" message={errors.device_count} />
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

                    {/* Registered on (platforms) */}
                    <div>
                        <InputLabel value="Registered On (AI Platforms)" />
                        <p className="text-xs text-gray-400 mt-0.5 mb-2">
                            Select all platforms this email is registered on.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {platforms.map((p) => (
                                <label key={p.id}
                                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={data.used_with.includes(p.name)}
                                        onChange={() => setData('used_with', toggleItem(data.used_with, p.name))}
                                    />
                                    {p.name}
                                </label>
                            ))}
                        </div>
                        <InputError className="mt-1" message={errors.used_with} />
                    </div>

                    {/* Notes */}
                    <div>
                        <InputLabel value="Notes" />
                        <textarea
                            rows={3}
                            className={`mt-1 ${selectCls}`}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Recovery codes, 2FA status, linked accounts…"
                        />
                        <InputError className="mt-1" message={errors.notes} />
                    </div>

                </div>

                {/* ── Sticky footer ──────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg shrink-0">
                    <DangerButton type="button" onClick={handleClose}>Cancel</DangerButton>
                    <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={handleReset}>Reset</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Update' : 'Save'}
                        </PrimaryButton>
                    </div>
                </div>

            </form>
        </Modal>
    );
}
