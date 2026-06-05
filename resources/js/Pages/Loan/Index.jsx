import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { CirclePlus, X, ChevronsDown, Trash2, BadgeCheck, Clock, AlertTriangle } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const today = () => new Date().toISOString().split('T')[0];

const STATUS_BADGE = {
    unpaid:  { label: 'Unpaid',  cls: 'bg-red-100 text-red-700',    icon: <Clock size={12} /> },
    partial: { label: 'Partial', cls: 'bg-yellow-100 text-yellow-700', icon: <ChevronsDown size={12} /> },
    paid:    { label: 'Paid',    cls: 'bg-green-100 text-green-700', icon: <BadgeCheck size={12} /> },
};

function StatusBadge({ status, overdue }) {
    const b = STATUS_BADGE[status] ?? STATUS_BADGE.unpaid;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${b.cls}`}>
            {overdue && status !== 'paid'
                ? <AlertTriangle size={12} className="text-red-500" />
                : b.icon}
            {overdue && status !== 'paid' ? 'Overdue' : b.label}
        </span>
    );
}

// ── Loan form modal ───────────────────────────────────────────────────────────

function LoanFormModal({ show, onClose, loanType, editLoan, accounts }) {
    const isEdit = !!editLoan;
    // Use editLoan.type when editing so the correct type is preserved
    const resolvedType = editLoan?.type ?? loanType;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        type:         resolvedType,
        person_name:  editLoan?.person_name  ?? '',
        person_phone: editLoan?.person_phone ?? '',
        amount:       editLoan?.amount       ?? '',
        note:         editLoan?.note         ?? '',
        loan_date:    editLoan?.loan_date    ?? today(),
        due_date:     editLoan?.due_date     ?? '',
        account_id:   accounts?.[0]?.id ?? '',
    });

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            patch(route('loans.update', editLoan.id), {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post(route('loans.store'), {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    }

    const typeLabel = resolvedType === 'lend' ? 'Lent' : 'Borrowed';
    const title = isEdit ? `Edit ${typeLabel}` : resolvedType === 'lend' ? 'Record Money Lent' : 'Record Money Borrowed';

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                        <InputLabel value="Person Name *" />
                        <TextInput className="mt-1 block w-full" value={data.person_name}
                            onChange={e => setData('person_name', e.target.value)}
                            placeholder="Who did you lend to / borrow from?" required />
                        <InputError className="mt-1" message={errors.person_name} />
                    </div>
                    <div>
                        <InputLabel value="Phone" />
                        <TextInput className="mt-1 block w-full" value={data.person_phone}
                            onChange={e => setData('person_phone', e.target.value)}
                            placeholder="01XXXXXXXXX" />
                        <InputError className="mt-1" message={errors.person_phone} />
                    </div>
                    <div>
                        <InputLabel value="Amount *" />
                        <TextInput type="number" min="0.01" step="0.01" className="mt-1 block w-full"
                            value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            placeholder="0.00" required />
                        <InputError className="mt-1" message={errors.amount} />
                    </div>
                    {!isEdit && (
                        <div>
                            <InputLabel value="Account *" />
                            <select value={data.account_id} onChange={e => setData('account_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm" required={!isEdit}>
                                <option value="">— Select account —</option>
                                {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <InputError className="mt-1" message={errors.account_id} />
                        </div>
                    )}
                    <div>
                        <InputLabel value="Loan Date *" />
                        <TextInput type="date" className="mt-1 block w-full"
                            value={data.loan_date}
                            onChange={e => setData('loan_date', e.target.value)} required />
                        <InputError className="mt-1" message={errors.loan_date} />
                    </div>
                    <div>
                        <InputLabel value="Due Date" />
                        <TextInput type="date" className="mt-1 block w-full"
                            value={data.due_date}
                            onChange={e => setData('due_date', e.target.value)} />
                        <InputError className="mt-1" message={errors.due_date} />
                    </div>
                </div>

                <div>
                    <InputLabel value="Note" />
                    <textarea
                        rows={2}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                        value={data.note}
                        onChange={e => setData('note', e.target.value)}
                        placeholder="Optional note…"
                    />
                    <InputError className="mt-1" message={errors.note} />
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving…' : isEdit ? 'Update' : 'Save'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Repayment form modal ──────────────────────────────────────────────────────

function RepaymentModal({ show, onClose, loan, accounts }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount:          '',
        note:            '',
        repayment_date:  today(),
        account_id:      accounts?.[0]?.id ?? '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('loans.repayments.store', loan.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    if (!loan) return null;

    const outstanding = Number(loan.outstanding ?? 0);

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Record Payment</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {loan.person_name} — Outstanding: <span className="font-semibold text-red-600">৳ {fmt(outstanding)}</span>
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel value="Account *" />
                        <select value={data.account_id} onChange={e => setData('account_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm" required>
                            <option value="">— Select account —</option>
                            {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.account_id} />
                    </div>
                    <div>
                        <InputLabel value="Amount *" />
                        <TextInput type="number" min="0.01" step="0.01" max={outstanding}
                            className="mt-1 block w-full"
                            value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            placeholder={`Max ${fmt(outstanding)}`} required />
                        <InputError className="mt-1" message={errors.amount} />
                    </div>
                    <div>
                        <InputLabel value="Date *" />
                        <TextInput type="date" className="mt-1 block w-full"
                            value={data.repayment_date}
                            onChange={e => setData('repayment_date', e.target.value)} required />
                        <InputError className="mt-1" message={errors.repayment_date} />
                    </div>
                </div>

                <div>
                    <InputLabel value="Note" />
                    <TextInput className="mt-1 block w-full"
                        value={data.note}
                        onChange={e => setData('note', e.target.value)}
                        placeholder="Optional note…" />
                </div>

                {/* Quick-fill buttons */}
                <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 self-center">Quick fill:</span>
                    {[25, 50, 75, 100].map(pct => {
                        const val = ((outstanding * pct) / 100).toFixed(2);
                        return (
                            <button key={pct} type="button"
                                onClick={() => setData('amount', val)}
                                className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition">
                                {pct}%
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving…' : 'Record Payment'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Loan card ─────────────────────────────────────────────────────────────────

function LoanCard({ loan, onRepay, onEdit }) {
    const [showHistory, setShowHistory] = useState(false);
    const pct = loan.amount > 0 ? Math.min(100, (loan.paid_amount / loan.amount) * 100) : 0;
    const isPaid = loan.status === 'paid';

    function deleteLoan() {
        if (confirm(`Delete loan for ${loan.person_name}? This cannot be undone.`)) {
            router.delete(route('loans.destroy', loan.id), { preserveScroll: true });
        }
    }

    function deleteRepayment(repaymentId) {
        if (confirm('Remove this repayment?')) {
            router.delete(route('loans.repayments.destroy', { loan: loan.id, repayment: repaymentId }), {
                preserveScroll: true,
            });
        }
    }

    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
            loan.is_overdue ? 'border-red-300' : 'border-gray-200'
        } ${isPaid ? 'opacity-70' : ''}`}>

            {/* Card header */}
            <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 truncate">{loan.person_name}</p>
                            <StatusBadge status={loan.status} overdue={loan.is_overdue} />
                        </div>
                        {loan.person_phone && (
                            <p className="text-xs text-gray-400 mt-0.5">{loan.person_phone}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                            <span>📅 {loan.loan_date}</span>
                            {loan.due_date && (
                                <span className={loan.is_overdue ? 'text-red-600 font-medium' : ''}>
                                    ⏰ Due: {loan.due_date}
                                </span>
                            )}
                        </div>
                        {loan.note && <p className="text-xs text-gray-400 mt-1 italic">{loan.note}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {!isPaid && (
                            <button onClick={() => onRepay(loan)}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                                Pay
                            </button>
                        )}
                        <button onClick={() => onEdit(loan)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button onClick={deleteLoan}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                        <p className="text-sm font-semibold text-gray-700">৳ {fmt(loan.amount)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg px-2 py-1.5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Paid</p>
                        <p className="text-sm font-semibold text-green-700">৳ {fmt(loan.paid_amount)}</p>
                    </div>
                    <div className={`rounded-lg px-2 py-1.5 ${loan.outstanding > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Due</p>
                        <p className={`text-sm font-semibold ${loan.outstanding > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            ৳ {fmt(loan.outstanding)}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full transition-all ${isPaid ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 text-right">{pct.toFixed(0)}% repaid</p>
                </div>
            </div>

            {/* Repayment history toggle */}
            {loan.repayments?.length > 0 && (
                <div className="border-t border-gray-100">
                    <button
                        onClick={() => setShowHistory(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition"
                    >
                        <span>{loan.repayments.length} payment{loan.repayments.length !== 1 ? 's' : ''}</span>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            className={`h-3.5 w-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showHistory && (
                        <div className="px-4 pb-3 space-y-1.5">
                            {loan.repayments.map(r => (
                                <div key={r.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{r.repayment_date}</span>
                                        {r.note && <span className="text-gray-500 italic">{r.note}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-green-700">৳ {fmt(r.amount)}</span>
                                        <button onClick={() => deleteRepayment(r.id)}
                                            className="text-gray-300 hover:text-red-500 transition">
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LoanIndex({ auth, loans, summary, filters, accounts }) {
    const { flash } = usePage().props;

    const [tab, setTab]             = useState(filters.type ?? 'lend');
    const [statusFilter, setStatus] = useState(filters.status ?? '');
    const [search, setSearch]       = useState(filters.search ?? '');

    const [loanModal, setLoanModal]         = useState(false);
    const [repayModal, setRepayModal]       = useState(false);
    const [editLoan, setEditLoan]           = useState(null);
    const [repayTarget, setRepayTarget]     = useState(null);

    function switchTab(t) {
        setTab(t);
        // Pass t directly — don't read `tab` state which hasn't updated yet
        router.get(route('loans.index'), { type: t, status: statusFilter, search }, { preserveState: true, replace: true });
    }

    function applyFilter(newStatus, newSearch) {
        // Always read current `tab` state here — tab hasn't changed during filter
        router.get(route('loans.index'), { type: tab, status: newStatus, search: newSearch }, { preserveState: true, replace: true });
    }

    function openRepay(loan) { setRepayTarget(loan); setRepayModal(true); }
    function openEdit(loan)  { setEditLoan(loan);    setLoanModal(true);  }
    function openCreate()    { setEditLoan(null);    setLoanModal(true);  }

    const isLend = tab === 'lend';

    return (
        <AuthenticatedLayout user={auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                {isLend ? 'Money Lent' : 'Money Borrowed'}
            </h2>
        }>
            <Head title="Loans" />

            <div className="space-y-4">

                {/* Flash */}
                {flash?.success && (
                    <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                {/* ── Tabs + header ─────────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                        {/* Tab switcher */}
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => switchTab('lend')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                                    tab === 'lend'
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                💸 Lent
                            </button>
                            <button onClick={() => switchTab('borrow')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                                    tab === 'borrow'
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                🤝 Borrowed
                            </button>
                        </div>

                        <button onClick={openCreate}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                            <CirclePlus size={15} />
                            {isLend ? 'Lend Money' : 'Record Borrow'}
                        </button>
                    </div>

                    {/* ── Summary strip ───────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 border-b border-gray-100">
                        {[
                            { label: 'Total',       val: summary.total_amount,      cls: 'text-gray-700' },
                            { label: 'Paid',        val: summary.total_paid,        cls: 'text-green-700' },
                            { label: 'Outstanding', val: summary.total_outstanding, cls: 'text-red-600' },
                            { label: 'Unpaid',      val: `${summary.count_unpaid} loans`, cls: 'text-red-600', isCount: true },
                        ].map(({ label, val, cls, isCount }) => (
                            <div key={label} className="px-4 py-3 text-center">
                                <p className="text-xs text-gray-400">{label}</p>
                                <p className={`text-base font-bold ${cls}`}>
                                    {isCount ? val : `৳ ${fmt(val)}`}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ── Filters ─────────────────────────────────────────── */}
                    <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter(statusFilter, search)}
                            placeholder="Search by name…"
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-4"
                        />
                        <select
                            value={statusFilter}
                            onChange={e => { setStatus(e.target.value); applyFilter(e.target.value, search); }}
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8"
                        >
                            <option value="">All status</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    {/* ── Cards grid ──────────────────────────────────────── */}
                    <div className="p-4">
                        {loans.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <p className="text-4xl mb-3">{isLend ? '💸' : '🤝'}</p>
                                <p className="text-sm font-medium text-gray-500">
                                    No {isLend ? 'lent' : 'borrowed'} money recorded yet.
                                </p>
                                <button onClick={openCreate}
                                    className="mt-3 text-xs text-indigo-600 hover:underline">
                                    Add one now →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {loans.map(loan => (
                                    <LoanCard
                                        key={loan.id}
                                        loan={loan}
                                        onRepay={openRepay}
                                        onEdit={openEdit}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LoanFormModal
                key={loanModal ? (editLoan?.id ?? 'new') : 'closed'}
                show={loanModal}
                onClose={() => { setLoanModal(false); setEditLoan(null); }}
                loanType={tab}
                editLoan={editLoan}
                accounts={accounts}
            />
            <RepaymentModal
                key={repayModal ? (repayTarget?.id ?? 'repay') : 'closed'}
                show={repayModal}
                onClose={() => { setRepayModal(false); setRepayTarget(null); }}
                loan={repayTarget}
                accounts={accounts}
            />
        </AuthenticatedLayout>
    );
}
