import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useForm, Head, router, Link } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import ExpenseFilter from './ExpenseFilter';
import { CirclePlus, Plus, Trash2, X } from 'lucide-react';

const blankItem = () => ({ details: '', amount: '', category_id: '' });

const selectCls =
    'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

// ── Quick-add Income modal ────────────────────────────────────────────────────

function QuickAddIncome({ show, onClose }) {
    const d = new Date();
    const { data, setData, post, processing, reset, errors } = useForm({
        source: '', amount: '', details: '', status: '1', type: '1',
        month: d.getMonth() + 1, year: d.getFullYear(),
    });
    const submit = (e) => {
        e.preventDefault();
        post(route('income.store'), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Add Income Source</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Source *" />
                        <TextInput className="mt-1 block w-full" value={data.source}
                            onChange={(e) => setData('source', e.target.value)} placeholder="e.g. Employer" required />
                        <InputError className="mt-1" message={errors.source} />
                    </div>
                    <div>
                        <InputLabel value="Amount *" />
                        <TextInput type="number" min="0" className="mt-1 block w-full" value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)} placeholder="0.00" required />
                        <InputError className="mt-1" message={errors.amount} />
                    </div>
                </div>
                <div>
                    <InputLabel value="Details *" />
                    <TextInput className="mt-1 block w-full" value={data.details}
                        onChange={(e) => setData('details', e.target.value)} placeholder="Description" required />
                    <InputError className="mt-1" message={errors.details} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                        <InputLabel value="Type" />
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Salary</option>
                            <option value="2">Partial</option>
                            <option value="0">Others</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Status" />
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Month" />
                        <TextInput type="number" min="1" max="12" className="mt-1 block w-full" value={data.month}
                            onChange={(e) => setData('month', e.target.value)} />
                    </div>
                    <div>
                        <InputLabel value="Year" />
                        <TextInput type="number" min="2020" max="2035" className="mt-1 block w-full" value={data.year}
                            onChange={(e) => setData('year', e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <PrimaryButton disabled={processing}>Save Income</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Quick-add Budget modal ────────────────────────────────────────────────────

function QuickAddBudget({ show, onClose }) {
    const d = new Date();
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '', amount: '', description: '', status: '1', type: '4', priority: '1',
        month: d.getMonth() + 1, year: d.getFullYear(),
    });
    const submit = (e) => {
        e.preventDefault();
        post(route('budget.store'), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Add Budget</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Title *" />
                        <TextInput className="mt-1 block w-full" value={data.title}
                            onChange={(e) => setData('title', e.target.value)} required />
                        <InputError className="mt-1" message={errors.title} />
                    </div>
                    <div>
                        <InputLabel value="Amount *" />
                        <TextInput type="number" min="0" className="mt-1 block w-full" value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)} placeholder="0.00" required />
                        <InputError className="mt-1" message={errors.amount} />
                    </div>
                </div>
                <div>
                    <InputLabel value="Description *" />
                    <TextInput className="mt-1 block w-full" value={data.description}
                        onChange={(e) => setData('description', e.target.value)} required />
                    <InputError className="mt-1" message={errors.description} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                        <InputLabel value="Type" />
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Once</option><option value="2">Daily</option>
                            <option value="3">Weekly</option><option value="4">Monthly</option>
                            <option value="5">Quarterly</option><option value="6">Biannually</option>
                            <option value="7">Annually</option><option value="0">Others</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Priority" />
                        <select value={data.priority} onChange={(e) => setData('priority', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Regular</option><option value="2">Urgent</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Status" />
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Active</option><option value="0">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Month" />
                        <TextInput type="number" min="1" max="12" className="mt-1 block w-full" value={data.month}
                            onChange={(e) => setData('month', e.target.value)} />
                    </div>
                    <div>
                        <InputLabel value="Year" />
                        <TextInput type="number" min="2020" max="2035" className="mt-1 block w-full" value={data.year}
                            onChange={(e) => setData('year', e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <PrimaryButton disabled={processing}>Save Budget</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Main Expense page ─────────────────────────────────────────────────────────

export default function Index({ auth, expenses, incomes, budgets, categories, filters = {} }) {
    const date = new Date();
    const today = date.toISOString().split('T')[0];

    // Derive display month from active filter
    const activeMonthDate = filters.date_from
        ? new Date(filters.date_from + 'T00:00:00')
        : new Date();
    const activeMonthLabel = activeMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

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
    const [incomeModal, setIncomeModal] = useState(false);
    const [budgetModal, setBudgetModal] = useState(false);

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

        // Edit: first item updates the existing record; extra items are created as new
        if (isEditing) {
            const [first, ...rest] = data.items;
            router.post(route('expense.store'), {
                id:          data.editId,
                date:        data.date,
                income_id:   data.income_id || null,
                budget_id:   data.budget_id || null,
                details:     first.details,
                amount:      first.amount,
                category_id: first.category_id || null,
                extra_items: rest.length > 0 ? rest : undefined,
            }, {
                preserveScroll: true,
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
            className: 'whitespace-nowrap text-start',
        },
        {
            key: 'details',
            label: 'Details',
            className: 'text-left',
            render: (row) => (
                <span className="">
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
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Expense List</h1>
                            <p className="text-xs text-gray-500 mt-0.5">{activeMonthLabel}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Quick-nav buttons */}
                            <Link
                                href={route('income.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Income
                            </Link>
                            <Link
                                href={route('budget.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Budget
                            </Link>
                            <Link
                                href={route('category.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Category
                            </Link>
                            <Link
                                href={route('loans.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Loans
                            </Link>
                            <PrimaryButton type="button" onClick={openCreate}>
                                Add Expense <CirclePlus size={16} className="ml-1" />
                            </PrimaryButton>
                        </div>
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
                                initialFilters={filters}
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
                            <div className="flex gap-1 mt-1">
                                <select
                                    value={data.income_id ?? ''}
                                    onChange={(e) => setData('income_id', e.target.value)}
                                    className={selectCls}
                                >
                                    <option value="">— None —</option>
                                    {incomes?.map((inc) => (
                                        <option key={inc.id} value={inc.id}>{inc.details}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setIncomeModal(true)}
                                    className="shrink-0 p-1.5 rounded border border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition"
                                    title="Add new income source">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <InputError className="mt-1" message={errors.income_id} />
                        </div>
                        <div>
                            <InputLabel value="Budget" />
                            <div className="flex gap-1 mt-1">
                                <select
                                    value={data.budget_id ?? ''}
                                    onChange={(e) => setData('budget_id', e.target.value)}
                                    className={selectCls}
                                >
                                    <option value="">— None —</option>
                                    {budgets?.map((b) => (
                                        <option key={b.id} value={b.id}>{b.title}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setBudgetModal(true)}
                                    className="shrink-0 p-1.5 rounded border border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition"
                                    title="Add new budget">
                                    <Plus size={14} />
                                </button>
                            </div>
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

                                {/* Remove row */}
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
                            </div>
                        ))}

                        {/* Add row + running total — always shown */}
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
            {/* ── Quick-add modals ─────────────────────────────────────────── */}
            <QuickAddIncome show={incomeModal} onClose={() => setIncomeModal(false)} />
            <QuickAddBudget show={budgetModal} onClose={() => setBudgetModal(false)} />
        </AuthenticatedLayout>
    );
}
