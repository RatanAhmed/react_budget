import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const BILLING_CYCLES = ['monthly', 'yearly', 'lifetime'];

function PlanForm({ plan, services, onClose }) {
    const isEdit = !!plan;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:           plan?.name           ?? '',
        description:    plan?.description    ?? '',
        price:          plan?.price          ?? 0,
        billing_cycle:  plan?.billing_cycle  ?? 'monthly',
        duration_value: plan?.duration_value ?? 1,
        duration_unit:  plan?.duration_unit  ?? 'months',
        trial_days:     plan?.trial_days     ?? 0,
        features:       plan?.features       ?? [],
        is_active:      plan?.is_active      ?? true,
        sort_order:     plan?.sort_order     ?? 0,
        service_ids:    plan?.services?.map(s => s.id) ?? [],
    });

    const [featureInput, setFeatureInput] = useState('');

    function addFeature() {
        if (featureInput.trim()) {
            setData('features', [...data.features, featureInput.trim()]);
            setFeatureInput('');
        }
    }

    function removeFeature(i) {
        setData('features', data.features.filter((_, idx) => idx !== i));
    }

    function toggleService(id) {
        setData('service_ids',
            data.service_ids.includes(id)
                ? data.service_ids.filter(s => s !== id)
                : [...data.service_ids, id]
        );
    }

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.plans.update', plan.id), { onSuccess: onClose });
        } else {
            post(route('admin.plans.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">{isEdit ? 'Edit Plan' : 'New Plan'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Price (৳) *</label>
                            <input type="number" min="0" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Billing Cycle *</label>
                            <select value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {/* Duration — how long the subscription is valid */}
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Subscription Duration
                                <span className="ml-1 text-gray-400 font-normal">(leave value empty for lifetime)</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 1"
                                    value={data.duration_value ?? ''}
                                    onChange={e => setData('duration_value', e.target.value === '' ? null : Number(e.target.value))}
                                    className="w-24 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <select
                                    value={data.duration_unit}
                                    onChange={e => setData('duration_unit', e.target.value)}
                                    className="flex-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="days">Days</option>
                                    <option value="months">Months</option>
                                    <option value="years">Years</option>
                                </select>
                            </div>
                            {data.duration_value && (
                                <p className="text-xs text-indigo-600 mt-1">
                                    Subscription valid for {data.duration_value} {data.duration_unit} after activation.
                                </p>
                            )}
                            {!data.duration_value && (
                                <p className="text-xs text-gray-400 mt-1">No expiry — lifetime access.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Trial Days</label>
                            <input type="number" min="0" value={data.trial_days} onChange={e => setData('trial_days', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sort Order</label>
                            <input type="number" min="0" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea rows={2} value={data.description} onChange={e => setData('description', e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Features</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                placeholder="Add a feature…"
                                className="flex-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <button type="button" onClick={addFeature}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition">Add</button>
                        </div>
                        <ul className="space-y-1">
                            {data.features.map((f, i) => (
                                <li key={i} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <span>{f}</span>
                                    <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Included Services</label>
                        <div className="grid grid-cols-2 gap-2">
                            {services.map(s => (
                                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={data.service_ids.includes(s.id)}
                                        onChange={() => toggleService(s.id)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <span>{s.icon} {s.title}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="is_active" className="text-sm text-gray-600">Active (visible on pricing page)</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                            {processing ? 'Saving…' : isEdit ? 'Update Plan' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PlansIndex({ plans, services }) {
    const [showForm, setShowForm] = useState(false);
    const [editPlan, setEditPlan] = useState(null);

    function openEdit(plan) { setEditPlan(plan); setShowForm(true); }
    function closeForm()    { setEditPlan(null); setShowForm(false); }

    function deletePlan(id) {
        if (confirm('Delete this plan? (soft delete)')) {
            router.delete(route('admin.plans.destroy', id), { preserveScroll: true });
        }
    }

    function restorePlan(id) {
        router.post(route('admin.plans.restore', id), {}, { preserveScroll: true });
    }

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Plans</h2>}>
            <Head title="Admin — Plans" />

            {showForm && (
                <PlanForm plan={editPlan} services={services} onClose={closeForm} />
            )}

            <div className="space-y-4">
                <div className="flex justify-end">
                    <button onClick={() => { setEditPlan(null); setShowForm(true); }}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">
                        + New Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {plans.map(plan => (
                        <div key={plan.id} className={`bg-white rounded-xl shadow-sm border p-5 ${plan.deleted_at ? 'opacity-50 border-red-200' : 'border-gray-100'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                                    <p className="text-xs text-gray-400">{plan.slug}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {plan.is_active && !plan.deleted_at && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                                    )}
                                    {plan.deleted_at && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Deleted</span>
                                    )}
                                </div>
                            </div>

                            <p className="text-2xl font-bold text-gray-800 mb-1">
                                ৳{Number(plan.price).toLocaleString()}
                                <span className="text-sm font-normal text-gray-400"> / {plan.billing_cycle}</span>
                            </p>

                            <p className="text-xs text-indigo-600 font-medium mb-1">
                                {plan.duration_value
                                    ? `Valid for ${plan.duration_value} ${plan.duration_unit}`
                                    : 'Lifetime access'}
                            </p>

                            <p className="text-xs text-gray-500 mb-3">{plan.subscriptions_count} subscriptions</p>

                            {/* Services */}
                            {plan.services?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {plan.services.map(s => (
                                        <span key={s.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                            {s.icon} {s.title}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 mt-4">
                                {!plan.deleted_at ? (
                                    <>
                                        <button onClick={() => openEdit(plan)}
                                            className="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                            Edit
                                        </button>
                                        <button onClick={() => deletePlan(plan.id)}
                                            className="flex-1 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => restorePlan(plan.id)}
                                        className="flex-1 px-3 py-1.5 text-xs font-medium border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition">
                                        Restore
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
