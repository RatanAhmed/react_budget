import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useForm, Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import ExpenseFilter from './ExpenseFilter';
import { CirclePlus, Plus, Trash2, X } from 'lucide-react';

const blankItem = () => ({ details: '', amount: '', category_id: '' });

const selectCls =
    'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

export default function Index({ auth, expenses, incomes, budgets, categories }) {
    const date = new Date();
    const today = date.toISOString().split('T')[0];

    // ── Single form for both create and edit ──────────────────────────────────
    const { data, setData, post, processing, reset, errors } = useForm({
        editId: null,       // null = create, number = edit
        date: today,
        income_id: '',
        budget_id: '',
        items: [blankItem()],
    });

    const isEditing = Boolean(data.editId);

    // ── Modal ─────────────────────────────────────────────────────────────────
    const [modal, setModal] = useState(false);

    const openCreate = () => {
        reset();
        setData({ editId: null, date: today, income_id: '', budget_id: '', items: [blankItem()] });
        setModal(true);
    };

    const openEdit = (row) => {
        setData({
            editId: row.id,
            date: row.date,
            income_id: row.income_id ?? '',
            budget_id: row.budget_id ?? '',
            items: [{
                details: row.details,
                amount: row.amount,
                category_id: row.category_id ?? '',
            }],
        });
        setModal(true);
    };

    const closeModal = () => { setModal(false); reset(); };

    // ── Line-item helpers ─────────────────────────────────────────────────────
    const setItem = (index, field, value) =>
        setData('items', data.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));

    const addItem = () => setData('items', [...data.items, blankItem()]);

    const removeItem = (index) => {
        if (data.items.length === 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const itemsTotal = data.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // ── Submit — shape the payload based on create vs edit ────────────────────
    const submit = (e) => {
        e.preventDefault();

        // Edit: send flat single-record shape the controller expects
        if (isEditing) {
            const item = data.items[0];
            post(route('expense.store'), {
                data: {
                    id:          data.editId,
                    date:        data.date,
                    income_id:   data.income_id || null,
                    budget_id:   data.budget_id || null,
                    details:     item.details,
                    amount:      item.amount,
                    category_id: item.category_id || null,
                },
                onSuccess: closeModal,
            });
            return;
        }

        // Create: send bulk shape
        post(route('expense.store'), { onSuccess: closeModal });
    };

    // ── Table ─────────────────────────────────────────────────────────────────
    const rows = expenses?.data ?? expenses ?? [];
    const total = rows.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const columns = [
        {
            key: 'date',
            label: 'Date',
            headerClassName: 'w-28',
            className: 'whitespace-nowrap text-center',
        },
        {
            key: 'details',
            label: 'Details',
            render: (row) => (
                <span className="flex flex-wrap items-center gap-1">
                    {row?.category?.name && (
                        <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                            {row.category.name}
                        </span>
                    )}
                    <span>{row.details}</span>
                    {row?.income?.details && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                            {row.income.details}
                        </span>
                    )}
                    {row?.budget?.title && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded">
                            {row.budget.title}
                        </span>
                    )}
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            headerClassName: 'w-28 text-right',
            className: 'text-right font-medium tabular-nums',
            render: (row) => Number(row.amount).toLocaleString(),
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Expenses" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Expense List</h1>
                        <PrimaryButton type="button" onClick={openCreate}>
                            Add Expense <CirclePlus size={16} className="ml-1" />
                        </PrimaryButton>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium text-gray-800">Total:</span>
                                <span className="text-base font-semibold text-indigo-700">
                                    {total.toLocaleString()}
                                </span>
                            </div>
                            <ExpenseFilter
                                categories={categories}
                                today={today}
                                incomes={incomes}
                                budgets={budgets}
                            />
                        </div>

                        <DataTable
                            columns={columns}
                            data={expenses}
                            rowKey="id"
                            perPage={15}
                            emptyText="No expenses found."
                            onRowClick={openEdit}
                        />
                    </div>
                </div>
            </div>

            {/* ── Modal (create + edit) ─────────────────────────────────────── */}
            <Modal show={modal} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditing ? 'Edit Expense' : 'Add Expenses'}
                        </h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 transition"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Shared top fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <InputLabel value="Date *" />
                            <TextInput
                                type="date"
                                className="mt-1 block w-full"
                                value={data.date || ''}
                                onChange={(e) => setData('date', e.target.value)}
                                required
                            />
                            <InputError className="mt-1" message={errors.date} />
                        </div>
                        <div>
                            <InputLabel value="Income Source" />
                            <select
                                value={data.income_id ?? ''}
                                onChange={(e) => setData('income_id', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="">— None —</option>
                                {incomes?.map((inc) => (
                                    <option key={inc.id} value={inc.id}>{inc.details}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.income_id} />
                        </div>
                        <div>
                            <InputLabel value="Budget" />
                            <select
                                value={data.budget_id ?? ''}
                                onChange={(e) => setData('budget_id', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="">— None —</option>
                                {budgets?.map((b) => (
                                    <option key={b.id} value={b.id}>{b.title}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.budget_id} />
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2">
                        {/* Desktop column headers */}
                        <div className="hidden sm:grid sm:grid-cols-[1fr_120px_160px_32px] gap-2 px-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details *</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount *</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
                            <span />
                        </div>

                        {data.items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_160px_32px] gap-2 items-start p-2 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0"
                            >
                                {/* Details */}
                                <div>
                                    <span className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Details *</span>
                                    <TextInput
                                        type="text"
                                        className="block w-full text-sm"
                                        value={item.details}
                                        onChange={(e) => setItem(index, 'details', e.target.value)}
                                        placeholder="What was this expense for?"
                                        required
                                    />
                                    <InputError className="mt-1" message={errors[`items.${index}.details`]} />
                                </div>

                                {/* Amount */}
                                <div>
                                    <span className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Amount *</span>
                                    <TextInput
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="block w-full text-sm"
                                        value={item.amount}
                                        onChange={(e) => setItem(index, 'amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    <InputError className="mt-1" message={errors[`items.${index}.amount`]} />
                                </div>

                                {/* Category */}
                                <div>
                                    <span className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Category</span>
                                    <select
                                        value={item.category_id ?? ''}
                                        onChange={(e) => setItem(index, 'category_id', e.target.value)}
                                        className={selectCls}
                                    >
                                        <option value="">— None —</option>
                                        {categories?.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1" message={errors[`items.${index}.category_id`]} />
                                </div>

                                {/* Remove row — hidden in edit mode (only one row) */}
                                {!isEditing && (
                                    <div className="flex items-center justify-end sm:justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={data.items.length === 1}
                                            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            aria-label="Remove row"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add row + running total — create mode only */}
                        {!isEditing && (
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
                                >
                                    <Plus size={15} /> Add row
                                </button>
                                {data.items.length > 1 && (
                                    <span className="text-sm text-gray-500">
                                        Total:{' '}
                                        <span className="font-semibold text-gray-800">
                                            {itemsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <DangerButton type="button" onClick={closeModal}>Cancel</DangerButton>
                        <div className="flex gap-2">
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    if (isEditing) { reset(); }
                                    else { reset(); setData('items', [blankItem()]); }
                                }}
                            >
                                Reset
                            </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Update' : 'Save'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
