import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { CirclePlus, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TRANSACTION_TYPES = [
    { value: 'income',           label: 'Income',           color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
    { value: 'expense',          label: 'Expense',          color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
    { value: 'lend',             label: 'Lend',             color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'borrow',           label: 'Borrow',           color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
    { value: 'lend_repayment',   label: 'Lend Repayment',   color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200' },
    { value: 'borrow_repayment', label: 'Borrow Repayment', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
    { value: 'saving',           label: 'Saving',           color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    { value: 'transfer',         label: 'Transfer',         color: 'text-gray-700',   bg: 'bg-gray-50',   border: 'border-gray-200' },
];

const typeInfo = (type) => TRANSACTION_TYPES.find(t => t.value === type) ?? TRANSACTION_TYPES[1];

const selectCls = 'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';
const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];
const blankItem = () => ({ amount: '', description: '', category_id: '', budget_id: '' });

// ── Helpers ───────────────────────────────────────────────────────────────────

// Types that support bulk items (shared top fields + per-row amount/desc/cat)
const BULK_TYPES = new Set(['income', 'expense', 'saving']);

// Types that show a loan selector
const REPAYMENT_TYPES = new Set(['lend_repayment', 'borrow_repayment']);

// ── Transaction form modal ────────────────────────────────────────────────────

function TransactionFormModal({ show, onClose, editTxn, accounts, categories, budgets, openLoans }) {
    const isEdit = !!editTxn;

    const { data, setData, post, processing, errors, reset } = useForm({
        id:             editTxn?.id             ?? '',
        account_id:     editTxn?.account_id     ?? (accounts?.[0]?.id ?? ''),
        to_account_id:  editTxn?.transfer_pair_id ? editTxn.transfer_pair_id : '',
        type:           editTxn?.type           ?? 'expense',
        date:           editTxn?.date           ?? today(),
        reference_type: editTxn?.reference_type ?? '',
        reference_id:   editTxn?.reference_id   ?? '',
        // Single-entry fields (used for edit and non-bulk types)
        amount:         editTxn?.amount         ?? '',
        description:    editTxn?.description    ?? '',
        category_id:    editTxn?.category_id    ?? '',
        budget_id:      editTxn?.budget_id      ?? '',
        // Bulk items (only used in create mode for bulk types)
        items: [blankItem()],
    });

    const isBulk       = !isEdit && BULK_TYPES.has(data.type);
    const isTransfer   = data.type === 'transfer';
    const isRepayment  = REPAYMENT_TYPES.has(data.type);
    const showCategory = data.type === 'expense' || data.type === 'income';
    const showBudget   = data.type === 'expense' || data.type === 'saving';
    const info         = typeInfo(data.type);

    const relevantLoans = openLoans?.filter(l =>
        data.type === 'lend_repayment' ? l.type === 'lend' : l.type === 'borrow'
    ) ?? [];

    // When editing, the linked loan might be 'paid' already but we still need
    // to show it so the select has a valid selected option.
    const editLinkedLoan = (isEdit && data.reference_id && !relevantLoans.find(l => l.id == data.reference_id))
        ? openLoans?.find(l => l.id == data.reference_id)
        : null;

    const loansForSelect = editLinkedLoan
        ? [editLinkedLoan, ...relevantLoans]
        : relevantLoans;

    function handleTypeChange(val) {
        setData(d => ({
            ...d,
            type: val,
            reference_type: REPAYMENT_TYPES.has(val) ? 'loan' : '',
            reference_id: '',
            items: [blankItem()],
        }));
    }

    // ── Item helpers ──────────────────────────────────────────────────────────
    const setItem = (i, field, val) =>
        setData('items', data.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

    const addItem = () => setData('items', [...data.items, blankItem()]);

    const removeItem = (i) => {
        if (data.items.length === 1) return;
        setData('items', data.items.filter((_, idx) => idx !== i));
    };

    const itemsTotal = data.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

    function submit(e) {
        e.preventDefault();
        post(route('transactions.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">
                        {isEdit ? 'Edit Transaction' : 'Add Transactions'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>

                {/* Show all validation errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field}>• {field}: {message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Type selector */}
                <div>
                    <InputLabel value="Type *" />
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {TRANSACTION_TYPES.map(t => (
                            <button key={t.value} type="button"
                                onClick={() => handleTypeChange(t.value)}
                                className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                                    data.type === t.value
                                        ? `${t.bg} ${t.color} ${t.border} shadow-sm`
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <InputError className="mt-1" message={errors.type} />
                </div>

                {/* Shared top fields */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Account *" />
                        <select value={data.account_id} onChange={e => setData('account_id', e.target.value)}
                            className={`mt-1 ${selectCls}`} required>
                            <option value="">— Select account —</option>
                            {accounts?.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                            ))}
                        </select>
                        <InputError className="mt-1" message={errors.account_id} />
                    </div>
                    <div>
                        <InputLabel value="Date *" />
                        <TextInput type="date" className="mt-1 block w-full"
                            value={data.date} onChange={e => setData('date', e.target.value)} required />
                        <InputError className="mt-1" message={errors.date} />
                    </div>

                    {/* Transfer destination */}
                    {data.type === 'transfer' && (
                        <div className="col-span-2">
                            <InputLabel value="Transfer To *" />
                            <select value={data.to_account_id} onChange={e => setData('to_account_id', e.target.value)}
                                className={`mt-1 ${selectCls}`} required>
                                <option value="">— Select destination account —</option>
                                {accounts?.map(a => (
                                    a.id !== data.account_id && (
                                        <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                                    )
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.to_account_id} />
                        </div>
                    )}

                    {isRepayment && (
                        <div className="col-span-2">
                            <InputLabel value="Linked Loan *" />
                            <select value={data.reference_id}
                                onChange={e => setData('reference_id', e.target.value)}
                                className={`mt-1 ${selectCls}`} required>
                                <option value="">— Select loan —</option>
                                {loansForSelect.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.person_name} — {fmt(l.amount)}
                                    </option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.reference_id} />
                        </div>
                    )}
                </div>

                {/* ── BULK mode: line items ────────────────────────────────── */}
                {isBulk ? (
                    <div className="space-y-2">
                        {/* Column headers */}
                        <div className="hidden sm:grid sm:grid-cols-[1fr_120px_150px_150px_28px] gap-2 px-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount *</span>
                            {showCategory && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>}
                            {showBudget   && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</span>}
                            <span />
                        </div>

                        {data.items.map((item, i) => (
                            <div key={i}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_150px_150px_28px] gap-2 items-start p-2 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0">

                                <div>
                                    <span className="sm:hidden text-xs text-gray-500 mb-1 block">Description</span>
                                    <TextInput className="block w-full text-sm"
                                        value={item.description}
                                        onChange={e => setItem(i, 'description', e.target.value)}
                                        placeholder="What was this for?" />
                                    <InputError message={errors[`items.${i}.description`]} />
                                </div>

                                <div>
                                    <span className="sm:hidden text-xs text-gray-500 mb-1 block">Amount *</span>
                                    <TextInput type="number" min="0.01" step="0.01" className="block w-full text-sm"
                                        value={item.amount}
                                        onChange={e => setItem(i, 'amount', e.target.value)}
                                        placeholder="0.00" required />
                                    <InputError message={errors[`items.${i}.amount`]} />
                                </div>

                                {showCategory && (
                                    <div>
                                        <span className="sm:hidden text-xs text-gray-500 mb-1 block">Category</span>
                                        <select value={item.category_id}
                                            onChange={e => setItem(i, 'category_id', e.target.value)}
                                            className={selectCls}>
                                            <option value="">— None —</option>
                                            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {showBudget && (
                                    <div>
                                        <span className="sm:hidden text-xs text-gray-500 mb-1 block">Budget</span>
                                        <select value={item.budget_id}
                                            onChange={e => setItem(i, 'budget_id', e.target.value)}
                                            className={selectCls}>
                                            <option value="">— None —</option>
                                            {budgets?.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center justify-end sm:justify-center pt-1 sm:pt-0">
                                    <button type="button" onClick={() => removeItem(i)}
                                        disabled={data.items.length === 1}
                                        className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add row + total */}
                        <div className="flex items-center justify-between pt-1">
                            <button type="button" onClick={addItem}
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition">
                                <Plus size={14} /> Add row
                            </button>
                            {data.items.length > 1 && (
                                <span className="text-xs text-gray-500 tabular-nums">
                                    Total: <strong>{fmt(itemsTotal)}</strong>
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── SINGLE mode: one amount + description ─────────────── */
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Amount *" />
                            <TextInput type="number" min="0.01" step="0.01" className="mt-1 block w-full"
                                value={data.amount} onChange={e => setData('amount', e.target.value)}
                                placeholder="0.00" required />
                            <InputError className="mt-1" message={errors.amount} />
                        </div>

                        <div>
                            <InputLabel value="Description" />
                            <TextInput className="mt-1 block w-full"
                                value={data.description} onChange={e => setData('description', e.target.value)}
                                placeholder="What was this for?" />
                            <InputError className="mt-1" message={errors.description} />
                        </div>

                        {showCategory && (
                            <div>
                                <InputLabel value="Category" />
                                <select value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className={`mt-1 ${selectCls}`}>
                                    <option value="">— None —</option>
                                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <InputError className="mt-1" message={errors.category_id} />
                            </div>
                        )}

                        {showBudget && (
                            <div>
                                <InputLabel value="Budget" />
                                <select value={data.budget_id}
                                    onChange={e => setData('budget_id', e.target.value)}
                                    className={`mt-1 ${selectCls}`}>
                                    <option value="">— None —</option>
                                    {budgets?.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                </select>
                                <InputError className="mt-1" message={errors.budget_id} />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving…' : isEdit ? 'Update' : `Save${isBulk && data.items.length > 1 ? ` (${data.items.length})` : ''}`}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxnRow({ txn, onEdit, onDelete, runningBalance }) {
    const info = typeInfo(txn.type);
    const isCredit = txn.direction === 'credit';

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition" onClick={() => onEdit(txn)}>
            <td className="px-3 py-2.5 text-sm text-gray-500 whitespace-nowrap">{txn.date}</td>
            <td className="px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex text-xs px-1.5 py-0.5 rounded-full font-medium ${info.bg} ${info.color}`}>
                        {info.label}
                    </span>
                    <span className="text-sm text-gray-800">
                        {txn.type === 'transfer'
                            ? `${txn.description || '—'} ${isCredit ? 'from' : 'to'} ${txn.transfer_to_account || '—'}`
                            : (txn.description || '—')
                        }
                    </span>
                    {txn.category_name && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{txn.category_name}</span>
                    )}
                    {txn.budget_title && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">{txn.budget_title}</span>
                    )}
                    <span className="text-xs text-gray-400">{txn.account_name}</span>
                </div>
            </td>
            <td className={`px-3 py-2.5 text-right text-sm font-semibold tabular-nums ${isCredit ? 'text-green-700' : 'text-red-600'}`}>
                {isCredit ? '+' : '−'} {fmt(txn.amount)}
            </td>
            <td className="px-3 py-2.5 text-right text-sm tabular-nums text-gray-600">{fmt(runningBalance)}</td>
            <td className="px-3 py-2.5 text-center">
                <button onClick={e => { e.stopPropagation(); onDelete(txn); }}
                    className="text-gray-300 hover:text-red-500 transition" aria-label="Delete">
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TransactionsIndex({
    auth, transactions, openingBalance, closingBalance, summary,
    accounts, accountBalances, categories, budgets, openLoans,
    filterMonth, filterYear, filters,
}) {
    const { flash } = usePage().props;
    const date = new Date();

    const [modal, setModal]           = useState(false);
    const [editTxn, setEditTxn]       = useState(null);
    const [confirmDelete, setConfirm] = useState(null);

    function openCreate() { setEditTxn(null); setModal(true); }
    function openEdit(t)  { setEditTxn(t);    setModal(true); }
    function closeModal() { setModal(false);  setEditTxn(null); }

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(route('transactions.destroy', confirmDelete.id), {
            preserveScroll: true,
            onSuccess: () => setConfirm(null),
        });
    }

    function navigateMonth(dir) {
        let m = filterMonth + dir, y = filterYear;
        if (m < 1)  { m = 12; y--; }
        if (m > 12) { m = 1;  y++; }
        router.get(route('transactions.index'), { month: m, year: y }, { preserveState: true });
    }

    function goToMonth(m, y) {
        router.get(route('transactions.index'), { month: m, year: y, ...filters }, { preserveState: true });
    }

    let running = openingBalance;
    const rowsWithBalance = (transactions ?? []).map(t => {
        running += t.direction === 'credit' ? t.amount : -t.amount;
        return { ...t, runningBalance: running };
    });

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Transactions" />

            <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Transactions</h1>
                        <div className="flex items-center gap-2">
                            <Link href={route('accounts.index')} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Accounts</Link>
                            <Link href={route('budget.index')}   className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Budgets</Link>
                            <Link href={route('loans.index')}    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Loans</Link>
                            <PrimaryButton type="button" onClick={openCreate}>
                                Add <CirclePlus size={15} className="ml-1" />
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Month picker */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 flex-wrap">
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => navigateMonth(-1)}
                                className="p-1 rounded hover:bg-gray-200 transition text-gray-500"><ChevronLeft size={18} /></button>
                            <select value={filterMonth} onChange={e => goToMonth(Number(e.target.value), filterYear)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1">
                                {MONTH_NAMES.slice(1).map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
                            </select>
                            <select value={filterYear} onChange={e => goToMonth(filterMonth, Number(e.target.value))}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1">
                                {Array.from({ length: 10 }, (_, i) => date.getFullYear() - 3 + i).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button type="button" onClick={() => navigateMonth(1)}
                                className="p-1 rounded hover:bg-gray-200 transition text-gray-500"><ChevronRight size={18} /></button>
                            <span className="text-xs text-gray-400 ml-2">{MONTH_NAMES[filterMonth]} {filterYear}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <label className="text-xs text-gray-500 whitespace-nowrap">Account:</label>
                            <select value={filters.account_id ?? ''} 
                                onChange={e => router.get(route('transactions.index'), 
                                    { month: filterMonth, year: filterYear, account_id: e.target.value ? parseInt(e.target.value) : '', ...filters },
                                    { preserveState: true })}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1">
                                <option value="">All Accounts</option>
                                {accounts?.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Summary strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                        {[
                            { label: 'Opening Balance', val: openingBalance, cls: openingBalance < 0 ? 'text-red-600' : 'text-gray-700' },
                            { label: 'Income',   val: summary.total_income,  cls: 'text-green-700', prefix: '+' },
                            { label: 'Expense',  val: summary.total_expense, cls: 'text-red-600',   prefix: '−' },
                            { label: 'Closing Balance', val: closingBalance, cls: closingBalance < 0 ? 'text-red-600' : 'text-indigo-700' },
                        ].map(({ label, val, cls, prefix }) => (
                            <div key={label} className="px-4 py-3 text-center">
                                <p className="text-xs text-gray-400">{label}</p>
                                <p className={`text-base font-bold tabular-nums ${cls}`}>{prefix}{fmt(val)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                        {flash?.success && <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">{flash.success}</div>}
                        {flash?.error   && <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{flash.error}</div>}

                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                        <th className="px-3 py-2 text-left w-28">Date</th>
                                        <th className="px-3 py-2 text-left">Description</th>
                                        <th className="px-3 py-2 text-right w-32">Amount</th>
                                        <th className="px-3 py-2 text-right w-32">Balance</th>
                                        <th className="px-3 py-2 w-8" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Opening row */}
                                    <tr className="bg-indigo-50 border-b border-indigo-100">
                                        <td className="px-3 py-2 text-xs text-indigo-500 font-medium" colSpan={2}>
                                            Opening Balance — {MONTH_NAMES[filterMonth]} {filterYear}
                                        </td>
                                        <td /><td className={`px-3 py-2 text-right text-sm font-bold tabular-nums ${openingBalance < 0 ? 'text-red-600' : 'text-indigo-700'}`}>{fmt(openingBalance)}</td>
                                        <td />
                                    </tr>

                                    {rowsWithBalance.length === 0 ? (
                                        <tr><td colSpan={5} className="px-3 py-12 text-center text-gray-400">
                                            No transactions for {MONTH_NAMES[filterMonth]} {filterYear}.{' '}
                                            <button onClick={openCreate} className="text-indigo-600 hover:underline">Add one →</button>
                                        </td></tr>
                                    ) : rowsWithBalance.map(t => (
                                        <TxnRow key={t.id} txn={t} onEdit={openEdit} onDelete={setConfirm} runningBalance={t.runningBalance} />
                                    ))}

                                    {/* Closing row */}
                                    <tr className="bg-gray-50 border-t border-gray-200">
                                        <td className="px-3 py-2.5 text-xs text-gray-500 font-medium" colSpan={2}>Closing Balance</td>
                                        <td className="px-3 py-2.5 text-right text-sm tabular-nums text-gray-500">
                                            Net: {closingBalance - openingBalance >= 0 ? '+' : ''}{fmt(closingBalance - openingBalance)}
                                        </td>
                                        <td className={`px-3 py-2.5 text-right text-base font-bold tabular-nums ${closingBalance < 0 ? 'text-red-600' : 'text-indigo-700'}`}>{fmt(closingBalance)}</td>
                                        <td />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Account balances sidebar */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Account Balances</h2>
                        <div className="space-y-3">
                            {!accountBalances?.length ? (
                                <p className="text-xs text-gray-400">No accounts.</p>
                            ) : (
                                accountBalances.map(acc => (
                                    <div key={acc.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition cursor-pointer"
                                        onClick={() => router.get(route('transactions.index'), 
                                            { month: filterMonth, year: filterYear, account_id: acc.id },
                                            { preserveState: true })}>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-700">{acc.name}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{acc.type}</span>
                                        </div>
                                        <p className={`text-sm font-bold tabular-nums ${acc.balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                            {acc.currency} {fmt(acc.balance)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <TransactionFormModal
                key={modal ? (editTxn?.id ?? 'new') : 'closed'}
                show={modal} onClose={closeModal}
                editTxn={editTxn} accounts={accounts}
                categories={categories} budgets={budgets} openLoans={openLoans}
            />

            {/* Delete confirm */}
            <Modal show={Boolean(confirmDelete)} onClose={() => setConfirm(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">Delete Transaction</h2>
                        <button type="button" onClick={() => setConfirm(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Delete this <span className="font-medium">{typeInfo(confirmDelete?.type)?.label}</span> of{' '}
                        <span className="font-medium">{fmt(confirmDelete?.amount)}</span>? This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button type="button" onClick={() => setConfirm(null)}
                            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <DangerButton onClick={handleDelete}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
