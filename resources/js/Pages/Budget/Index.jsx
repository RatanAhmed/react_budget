import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useForm, Head, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { CirclePlus, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const selectCls = 'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_LABEL     = { 1: 'Once', 2: 'Daily', 3: 'Weekly', 4: 'Monthly', 5: 'Quarterly', 6: 'Biannually', 7: 'Annually', 0: 'Others' };
const PRIORITY_LABEL = { 1: 'Regular', 2: 'Urgent', 3: 'Weekly' };
const STATUS_LABEL   = { 1: 'Active', 0: 'Inactive' };

const blankBudget = (month, year) => ({
    title: '', amount: '', description: '', type: '4', priority: '1', status: '1', month, year,
});

// ── Edit modal (single budget) ────────────────────────────────────────────────

function EditBudgetModal({ show, onClose, budget, filterMonth, filterYear }) {
    const date = new Date();

    const { data, setData, post, processing, errors, reset } = useForm({
        id:          budget.id,
        title:       budget.title,
        amount:      budget.amount,
        description: budget.description ?? '',
        status:      String(budget.status),
        type:        String(budget.type),
        priority:    String(budget.priority),
        month:       budget.month ?? filterMonth,
        year:        budget.year  ?? filterYear,
    });

    function submit(e) {
        e.preventDefault();
        router.post(route('budget.store'), { ...data }, {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Edit Budget</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Title *" />
                        <TextInput className="mt-1 block w-full" value={data.title}
                            onChange={e => setData('title', e.target.value)} required />
                        <InputError className="mt-1" message={errors.title} />
                    </div>
                    <div>
                        <InputLabel value="Amount *" />
                        <TextInput type="number" min="0" step="0.01" className="mt-1 block w-full"
                            value={data.amount} onChange={e => setData('amount', e.target.value)} required />
                        <InputError className="mt-1" message={errors.amount} />
                    </div>
                </div>

                <div>
                    <InputLabel value="Description *" />
                    <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                        rows={2} className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm" required />
                    <InputError className="mt-1" message={errors.description} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                        <InputLabel value="Type" />
                        <select value={data.type} onChange={e => setData('type', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Priority" />
                        <select value={data.priority} onChange={e => setData('priority', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Status" />
                        <select value={data.status} onChange={e => setData('status', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Month" />
                        <select value={data.month} onChange={e => setData('month', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {MONTH_NAMES.slice(1).map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Year" />
                        <select value={data.year} onChange={e => setData('year', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <DangerButton type="button" onClick={onClose}>Cancel</DangerButton>
                    <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={() => reset()}>Reset</SecondaryButton>
                        <PrimaryButton disabled={processing}>Update</PrimaryButton>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

// ── Bulk create modal (multiple budgets) ──────────────────────────────────────

function CreateBudgetsModal({ show, onClose, filterMonth, filterYear }) {
    const date = new Date();
    const defMonth = filterMonth ?? date.getMonth() + 1;
    const defYear  = filterYear  ?? date.getFullYear();

    // Shared defaults applied to all rows
    const [shared, setShared] = useState({
        type: '4', priority: '1', status: '1',
        month: defMonth, year: defYear,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        items: [blankBudget(defMonth, defYear)],
    });

    // When shared settings change, propagate to all rows
    function updateShared(field, val) {
        setShared(s => ({ ...s, [field]: val }));
        setData('items', data.items.map(item => ({ ...item, [field]: val })));
    }

    const setItem = (i, field, val) =>
        setData('items', data.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

    const addRow = () =>
        setData('items', [...data.items, { ...blankBudget(defMonth, defYear), ...shared }]);

    const removeRow = (i) => {
        if (data.items.length === 1) return;
        setData('items', data.items.filter((_, idx) => idx !== i));
    };

    const total = data.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

    function submit(e) {
        e.preventDefault();
        post(route('budget.store.bulk'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Add Budgets</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>

                {/* Shared settings bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="col-span-2 sm:col-span-1">
                        <InputLabel value="Type (all)" />
                        <select value={shared.type} onChange={e => updateShared('type', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Priority (all)" />
                        <select value={shared.priority} onChange={e => updateShared('priority', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Status (all)" />
                        <select value={shared.status} onChange={e => updateShared('status', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Month (all)" />
                        <select value={shared.month} onChange={e => updateShared('month', Number(e.target.value))} className={`mt-1 ${selectCls}`}>
                            {MONTH_NAMES.slice(1).map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Year (all)" />
                        <select value={shared.year} onChange={e => updateShared('year', Number(e.target.value))} className={`mt-1 ${selectCls}`}>
                            {Array.from({ length: 10 }, (_, i) => date.getFullYear() - 3 + i).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Column headers */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_120px_1fr_28px] gap-2 px-1">
                    {['Title *', 'Amount *', 'Description *', ''].map(h => (
                        <span key={h} className="text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</span>
                    ))}
                </div>

                {/* Rows */}
                {data.items.map((item, i) => (
                    <div key={i}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_120px_1fr_28px] gap-2 items-start p-2 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0">
                        <div>
                            <span className="sm:hidden text-xs text-gray-500 mb-1 block">Title *</span>
                            <TextInput className="block w-full text-sm" value={item.title}
                                onChange={e => setItem(i, 'title', e.target.value)}
                                placeholder="Budget title" required />
                            <InputError message={errors[`items.${i}.title`]} />
                        </div>
                        <div>
                            <span className="sm:hidden text-xs text-gray-500 mb-1 block">Amount *</span>
                            <TextInput type="number" min="0" step="0.01" className="block w-full text-sm"
                                value={item.amount}
                                onChange={e => setItem(i, 'amount', e.target.value)}
                                placeholder="0.00" required />
                            <InputError message={errors[`items.${i}.amount`]} />
                        </div>
                        <div>
                            <span className="sm:hidden text-xs text-gray-500 mb-1 block">Description *</span>
                            <TextInput className="block w-full text-sm" value={item.description}
                                onChange={e => setItem(i, 'description', e.target.value)}
                                placeholder="Short description" required />
                            <InputError message={errors[`items.${i}.description`]} />
                        </div>
                        <div className="flex items-center justify-end sm:justify-center pt-1 sm:pt-0">
                            <button type="button" onClick={() => removeRow(i)}
                                disabled={data.items.length === 1}
                                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-between pt-1">
                    <button type="button" onClick={addRow}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition">
                        <Plus size={14} /> Add row
                    </button>
                    {data.items.length > 1 && (
                        <span className="text-xs text-gray-500 tabular-nums">
                            Total: <strong>{total.toLocaleString()}</strong>
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <DangerButton type="button" onClick={onClose}>Cancel</DangerButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving…' : `Save${data.items.length > 1 ? ` (${data.items.length})` : ''}`}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Index({ auth, budgets, filterMonth, filterYear }) {
    const date = new Date();

    const [createModal, setCreateModal] = useState(false);
    const [editBudget, setEditBudget]   = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const navigateMonth = (dir) => {
        let m = filterMonth + dir, y = filterYear;
        if (m < 1)  { m = 12; y--; }
        if (m > 12) { m = 1;  y++; }
        router.get(route('budget.index'), { month: m, year: y }, { preserveState: true });
    };

    const goToMonth = (m, y) =>
        router.get(route('budget.index'), { month: m, year: y }, { preserveState: true });

    const handleDelete = () => {
        if (!confirmDelete) return;
        router.delete(route('budget.destroy', confirmDelete.id), {
            data: { month: filterMonth, year: filterYear },
            preserveScroll: true,
            onSuccess: () => setConfirmDelete(null),
        });
    };

    const total = (budgets ?? []).reduce((sum, b) => sum + Number(b.amount), 0);

    const columns = [
        { key: 'title', label: 'Title', className: 'text-left font-medium' },
        { key: 'description', label: 'Description', className: 'text-left text-gray-500 text-sm', render: r => r.description || '—' },
        { key: 'type', label: 'Type', headerClassName: 'w-24', className: 'text-center',
          render: r => <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{TYPE_LABEL[r.type] ?? r.type}</span> },
        { key: 'priority', label: 'Priority', headerClassName: 'w-24', className: 'text-center',
          render: r => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.priority == 2 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{PRIORITY_LABEL[r.priority] ?? r.priority}</span> },
        { key: 'status', label: 'Status', headerClassName: 'w-24', className: 'text-center',
          render: r => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status == 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{STATUS_LABEL[r.status] ?? r.status}</span> },
        { key: 'amount', label: 'Amount', headerClassName: 'w-28 text-right', className: 'text-right font-medium tabular-nums',
          render: r => Number(r.amount).toLocaleString() },
        { key: 'actions', label: '', headerClassName: 'w-10', className: 'text-center',
          render: r => (
              <button type="button" onClick={e => { e.stopPropagation(); setConfirmDelete(r); }}
                  className="text-gray-400 hover:text-red-500 transition" aria-label="Delete">
                  <Trash2 size={15} />
              </button>
          )},
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Budgets" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Budgets</h1>
                        <PrimaryButton type="button" onClick={() => setCreateModal(true)}>
                            Add Budget <CirclePlus size={16} className="ml-1" />
                        </PrimaryButton>
                    </div>

                    {/* Month Picker */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <button type="button" onClick={() => navigateMonth(-1)}
                            className="p-1 rounded hover:bg-gray-200 transition text-gray-500"><ChevronLeft size={18} /></button>
                        <div className="flex items-center gap-2">
                            <select value={filterMonth} onChange={e => goToMonth(Number(e.target.value), filterYear)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1">
                                {MONTH_NAMES.slice(1).map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
                            </select>
                            <select value={filterYear} onChange={e => goToMonth(filterMonth, Number(e.target.value))}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1">
                                {Array.from({ length: 10 }, (_, i) => date.getFullYear() - 3 + i).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={() => navigateMonth(1)}
                            className="p-1 rounded hover:bg-gray-200 transition text-gray-500"><ChevronRight size={18} /></button>
                        <span className="ml-auto text-xs text-gray-400">{MONTH_NAMES[filterMonth]} {filterYear}</span>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium text-gray-800">Total:</span>
                            <span className="text-base font-semibold text-indigo-700">{total.toLocaleString()}</span>
                            <span className="text-gray-400 text-xs ml-1">for {MONTH_NAMES[filterMonth]} {filterYear}</span>
                        </div>
                        <DataTable columns={columns} data={budgets ?? []} rowKey="id" perPage={20}
                            emptyText={`No budgets found for ${MONTH_NAMES[filterMonth]} ${filterYear}.`}
                            onRowClick={setEditBudget} />
                    </div>
                </div>
            </div>

            {/* Bulk create modal */}
            <CreateBudgetsModal
                key={createModal ? 'open' : 'closed'}
                show={createModal}
                onClose={() => setCreateModal(false)}
                filterMonth={filterMonth}
                filterYear={filterYear}
            />

            {/* Single edit modal */}
            {editBudget && (
                <EditBudgetModal
                    key={editBudget.id}
                    show={Boolean(editBudget)}
                    onClose={() => setEditBudget(null)}
                    budget={editBudget}
                    filterMonth={filterMonth}
                    filterYear={filterYear}
                />
            )}

            {/* Delete confirm */}
            <Modal show={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Delete Budget</h2>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Delete <span className="font-medium text-gray-800">{confirmDelete?.title}</span>? This cannot be undone.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(null)}>Cancel</SecondaryButton>
                        <DangerButton type="button" onClick={handleDelete}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
