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
import { CirclePlus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const selectCls =
    'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_LABEL = {
    1: 'Once', 2: 'Daily', 3: 'Weekly', 4: 'Monthly',
    5: 'Quarterly', 6: 'Biannually', 7: 'Annually', 0: 'Others',
};
const PRIORITY_LABEL = { 1: 'Regular', 2: 'Urgent', 3: 'Weekly' };
const STATUS_LABEL   = { 1: 'Active', 0: 'Inactive' };

export default function Index({ auth, budgets, filterMonth, filterYear }) {
    const date = new Date();

    const [confirmDelete, setConfirmDelete] = useState(null); // holds budget row to delete

    const { data, setData, post, processing, reset, errors } = useForm({
        editId:      null,
        title:       '',
        amount:      '',
        description: '',
        status:      '1',
        type:        '4',
        priority:    '1',
        month:       filterMonth ?? date.getMonth() + 1,
        year:        filterYear  ?? date.getFullYear(),
    });

    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    // ── Month navigation ──────────────────────────────────────────────────────
    const navigateMonth = (direction) => {
        let m = filterMonth + direction;
        let y = filterYear;
        if (m < 1)  { m = 12; y -= 1; }
        if (m > 12) { m = 1;  y += 1; }
        router.get(route('budget.index'), { month: m, year: y }, { preserveState: true });
    };

    const goToMonth = (m, y) => {
        router.get(route('budget.index'), { month: m, year: y }, { preserveState: true });
    };

    // ── Modal helpers ─────────────────────────────────────────────────────────
    const openCreate = () => {
        reset();
        setData({
            editId: null, title: '', amount: '', description: '',
            status: '1', type: '4', priority: '1',
            month: filterMonth, year: filterYear,
        });
        setModal(true);
    };

    const openEdit = (row) => {
        setData({
            editId:      row.id,
            title:       row.title,
            amount:      row.amount,
            description: row.description ?? '',
            status:      String(row.status),
            type:        String(row.type),
            priority:    String(row.priority),
            month:       row.month ?? filterMonth,
            year:        row.year  ?? filterYear,
        });
        setModal(true);
    };

    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route('budget.store'), {
                id:          data.editId,
                title:       data.title,
                amount:      data.amount,
                description: data.description,
                status:      data.status,
                type:        data.type,
                priority:    data.priority,
                month:       data.month,
                year:        data.year,
            }, { preserveScroll: true, onSuccess: closeModal });
            return;
        }
        post(route('budget.store'), { onSuccess: closeModal });
    };

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
        {
            key: 'title',
            label: 'Title',
            className: 'text-left font-medium',
        },
        {
            key: 'description',
            label: 'Description',
            className: 'text-left text-gray-500 text-sm',
            render: (row) => row.description || '—',
        },
        {
            key: 'type',
            label: 'Type',
            headerClassName: 'w-24',
            className: 'text-center',
            render: (row) => (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {TYPE_LABEL[row.type] ?? row.type}
                </span>
            ),
        },
        {
            key: 'priority',
            label: 'Priority',
            headerClassName: 'w-24',
            className: 'text-center',
            render: (row) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.priority == 2
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                    {PRIORITY_LABEL[row.priority] ?? row.priority}
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
            <Head title="Budgets" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Budgets</h1>
                        <PrimaryButton type="button" onClick={openCreate}>
                            Add Budget <CirclePlus size={16} className="ml-1" />
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
                            data={budgets ?? []}
                            rowKey="id"
                            perPage={20}
                            emptyText={`No budgets found for ${MONTH_NAMES[filterMonth]} ${filterYear}.`}
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
                            {isEditing ? 'Edit Budget' : 'Add Budget'}
                        </h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Title *" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Budget title"
                                required
                            />
                            <InputError className="mt-1" message={errors.title} />
                        </div>
                        <div>
                            <InputLabel value="Amount *" />
                            <TextInput
                                type="number"
                                min="0"
                                step="0.01"
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
                        <InputLabel value="Description *" />
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Description about this budget"
                            rows={2}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            required
                        />
                        <InputError className="mt-1" message={errors.description} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <InputLabel value="Type" />
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="1">Once</option>
                                <option value="2">Daily</option>
                                <option value="3">Weekly</option>
                                <option value="4">Monthly</option>
                                <option value="5">Quarterly</option>
                                <option value="6">Biannually</option>
                                <option value="7">Annually</option>
                                <option value="0">Others</option>
                            </select>
                            <InputError className="mt-1" message={errors.type} />
                        </div>
                        <div>
                            <InputLabel value="Priority" />
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="1">Regular</option>
                                <option value="2">Urgent</option>
                                <option value="3">Weekly</option>
                            </select>
                            <InputError className="mt-1" message={errors.priority} />
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                        <h2 className="text-lg font-semibold text-gray-800">Delete Budget</h2>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <span className="font-medium text-gray-800">{confirmDelete?.title}</span>? This action cannot be undone.
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
