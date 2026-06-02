import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useForm, Head, router, Link, usePage } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { CirclePlus, X, ChevronLeft, ChevronRight, Trash2, ArrowDownToLine, TrendingUp, TrendingDown, Handshake } from 'lucide-react';

const selectCls =
    'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_LABEL   = { 1: 'Salary', 2: 'Partial', 0: 'Others', 3: 'Carry Fwd' };
const STATUS_LABEL = { 1: 'Active', 0: 'Inactive' };

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Carry-forward banner ──────────────────────────────────────────────────────

function CarryForwardBanner({ carryForward, filterMonth, filterYear }) {
    const { post, processing } = useForm({
        month:  filterMonth,
        year:   filterYear,
        amount: carryForward.prev_net > 0 ? carryForward.prev_net : 0,
    });

    const prevLabel = `${MONTH_NAMES[carryForward.prev_month]} ${carryForward.prev_year}`;
    const net       = carryForward.prev_net;
    const isPositive = net > 0;

    if (carryForward.already_added) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <ArrowDownToLine size={15} className="shrink-0" />
                Carry-forward from {prevLabel} already added to this month.
            </div>
        );
    }

    if (net <= 0) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                <TrendingDown size={15} className="shrink-0" />
                {prevLabel} ended with a deficit of <strong className="mx-1">৳ {fmt(Math.abs(net))}</strong> — nothing to carry forward.
            </div>
        );
    }

    function submit(e) {
        e.preventDefault();
        post(route('income.carry-forward'));
    }

    return (
        <form onSubmit={submit}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-indigo-800">
                    <TrendingUp size={15} className="shrink-0 text-indigo-500" />
                    <span>
                        {prevLabel} surplus: <strong>৳ {fmt(net)}</strong>
                    </span>
                    <span className="text-indigo-500">— carry it forward to this month?</span>
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                    <ArrowDownToLine size={13} />
                    {processing ? 'Adding…' : 'Add Carry Forward'}
                </button>
            </div>
        </form>
    );
}

// ── Loan context strip ────────────────────────────────────────────────────────

function LoanContextStrip({ loanSummary }) {
    if (!loanSummary.lend_outstanding && !loanSummary.borrow_outstanding) return null;

    return (
        <div className="flex flex-wrap gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
            <span className="font-medium text-gray-500 self-center">Outstanding loans:</span>
            {loanSummary.lend_outstanding > 0 && (
                <Link href={route('loans.index', { type: 'lend' })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition">
                    <Handshake size={12} />
                    Others owe you: <strong className="ml-0.5">৳ {fmt(loanSummary.lend_outstanding)}</strong>
                </Link>
            )}
            {loanSummary.borrow_outstanding > 0 && (
                <Link href={route('loans.index', { type: 'borrow' })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition">
                    <Handshake size={12} />
                    You owe: <strong className="ml-0.5">৳ {fmt(loanSummary.borrow_outstanding)}</strong>
                </Link>
            )}
        </div>
    );
}

export default function Index({ auth, earnings, filterMonth, filterYear, carryForward, loanSummary }) {
    const { flash } = usePage().props;
    const date = new Date();

    const [confirmDelete, setConfirmDelete] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        editId:  null,
        source:  '',
        amount:  '',
        details: '',
        status:  '1',
        type:    '1',
        month:   filterMonth ?? date.getMonth() + 1,
        year:    filterYear  ?? date.getFullYear(),
    });

    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    // ── Month navigation ──────────────────────────────────────────────────────
    const navigateMonth = (direction) => {
        let m = filterMonth + direction;
        let y = filterYear;
        if (m < 1)  { m = 12; y -= 1; }
        if (m > 12) { m = 1;  y += 1; }
        router.get(route('income.index'), { month: m, year: y }, { preserveState: true });
    };

    const goToMonth = (m, y) => {
        router.get(route('income.index'), { month: m, year: y }, { preserveState: true });
    };

    // ── Modal helpers ─────────────────────────────────────────────────────────
    const openCreate = () => {
        reset();
        setData({
            editId: null, source: '', amount: '', details: '',
            status: '1', type: '1',
            month: filterMonth, year: filterYear,
        });
        setModal(true);
    };

    const openEdit = (row) => {
        setData({
            editId:  row.id,
            source:  row.source,
            amount:  row.amount,
            details: row.details ?? '',
            status:  String(row.status),
            type:    String(row.type),
            month:   row.month ?? filterMonth,
            year:    row.year  ?? filterYear,
        });
        setModal(true);
    };

    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route('income.store'), {
                id:      data.editId,
                source:  data.source,
                amount:  data.amount,
                details: data.details,
                status:  data.status,
                type:    data.type,
                month:   data.month,
                year:    data.year,
            }, { preserveScroll: true, onSuccess: closeModal });
            return;
        }
        post(route('income.store'), { onSuccess: closeModal });
    };

    const handleDelete = () => {
        if (!confirmDelete) return;
        router.delete(route('income.destroy', confirmDelete.id), {
            data: { month: filterMonth, year: filterYear },
            preserveScroll: true,
            onSuccess: () => setConfirmDelete(null),
        });
    };

    const total = (earnings ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

    const columns = [
        {
            key: 'source',
            label: 'Source',
            headerClassName: 'w-32',
            className: 'text-left font-medium whitespace-nowrap',
        },
        {
            key: 'details',
            label: 'Details',
            className: 'text-left',
        },
        {
            key: 'type',
            label: 'Type',
            headerClassName: 'w-24',
            className: 'text-center',
            render: (row) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.type == 3
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {TYPE_LABEL[row.type] ?? row.type}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            headerClassName: 'w-24',
            className: 'text-center',
            render: (row) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.status == 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                }`}>
                    {STATUS_LABEL[row.status] ?? row.status}
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
        {
            key: 'actions',
            label: '',
            headerClassName: 'w-10',
            className: 'text-center',
            render: (row) => (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(row); }}
                    className="text-gray-400 hover:text-red-500 transition"
                    aria-label="Delete"
                >
                    <Trash2 size={15} />
                </button>
            ),
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Earnings" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Earnings</h1>
                        <PrimaryButton type="button" onClick={openCreate}>
                            Add Earning <CirclePlus size={16} className="ml-1" />
                        </PrimaryButton>
                    </div>

                    {/* Month Picker */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={() => navigateMonth(-1)}
                            className="p-1 rounded hover:bg-gray-200 transition text-gray-500"
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-2">
                            <select
                                value={filterMonth}
                                onChange={(e) => goToMonth(Number(e.target.value), filterYear)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1"
                            >
                                {MONTH_NAMES.slice(1).map((name, i) => (
                                    <option key={i + 1} value={i + 1}>{name}</option>
                                ))}
                            </select>
                            <select
                                value={filterYear}
                                onChange={(e) => goToMonth(filterMonth, Number(e.target.value))}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1"
                            >
                                {Array.from({ length: 10 }, (_, i) => date.getFullYear() - 3 + i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigateMonth(1)}
                            className="p-1 rounded hover:bg-gray-200 transition text-gray-500"
                            aria-label="Next month"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <span className="ml-auto text-xs text-gray-400">
                            {MONTH_NAMES[filterMonth]} {filterYear}
                        </span>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                        {/* Flash messages */}
                        {flash?.success && (
                            <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">{flash.success}</div>
                        )}
                        {flash?.error && (
                            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{flash.error}</div>
                        )}

                        {/* Carry-forward suggestion */}
                        {carryForward && (
                            <CarryForwardBanner
                                carryForward={carryForward}
                                filterMonth={filterMonth}
                                filterYear={filterYear}
                            />
                        )}

                        {/* Loan context */}
                        {loanSummary && <LoanContextStrip loanSummary={loanSummary} />}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium text-gray-800">Total:</span>
                            <span className="text-base font-semibold text-indigo-700">
                                {total.toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-xs ml-1">
                                for {MONTH_NAMES[filterMonth]} {filterYear}
                            </span>
                        </div>

                        <DataTable
                            columns={columns}
                            data={earnings ?? []}
                            rowKey="id"
                            perPage={20}
                            emptyText={`No earnings found for ${MONTH_NAMES[filterMonth]} ${filterYear}.`}
                            onRowClick={openEdit}
                        />
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal show={modal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditing ? 'Edit Earning' : 'Add Earning'}
                        </h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Source *" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.source}
                                onChange={(e) => setData('source', e.target.value)}
                                placeholder="e.g. Employer name"
                                required
                            />
                            <InputError className="mt-1" message={errors.source} />
                        </div>
                        <div>
                            <InputLabel value="Amount *" />
                            <TextInput
                                type="number"
                                min="0"
                                className="mt-1 block w-full"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            <InputError className="mt-1" message={errors.amount} />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Details *" />
                        <textarea
                            value={data.details}
                            onChange={(e) => setData('details', e.target.value)}
                            placeholder="Details about this earning"
                            rows={2}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            required
                        />
                        <InputError className="mt-1" message={errors.details} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <InputLabel value="Type" />
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="1">Salary</option>
                                <option value="2">Partial</option>
                                <option value="0">Others</option>
                                <option value="3">Carry Forward</option>
                            </select>
                            <InputError className="mt-1" message={errors.type} />
                        </div>
                        <div>
                            <InputLabel value="Status" />
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <InputError className="mt-1" message={errors.status} />
                        </div>
                        <div>
                            <InputLabel value="Month" />
                            <select
                                value={data.month}
                                onChange={(e) => setData('month', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                {MONTH_NAMES.slice(1).map((name, i) => (
                                    <option key={i + 1} value={i + 1}>{name}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.month} />
                        </div>
                        <div>
                            <InputLabel value="Year" />
                            <select
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                {Array.from({ length: 10 }, (_, i) => date.getFullYear() - 3 + i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.year} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <DangerButton type="button" onClick={closeModal}>Cancel</DangerButton>
                        <div className="flex gap-2">
                            <SecondaryButton type="button" onClick={() => reset()}>Reset</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Update' : 'Save'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Delete Earning</h2>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete the earning from <span className="font-medium text-gray-800">{confirmDelete?.source}</span>? This action cannot be undone.
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
