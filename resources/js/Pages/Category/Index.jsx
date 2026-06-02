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
import { CirclePlus, X } from 'lucide-react';

const selectCls =
    'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

const TYPE_LABEL  = { 1: 'Income', 0: 'Expense' };
const STATUS_LABEL = { 1: 'Active', 0: 'Inactive' };

export default function Index({ auth, categories }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        editId: null,
        name: '',
        type: '',
        status: '1',
    });

    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    const openCreate = () => {
        reset();
        setData({ editId: null, name: '', type: '', status: '1' });
        setModal(true);
    };

    const openEdit = (row) => {
        setData({
            editId: row.id,
            name:   row.name,
            type:   String(row.type),
            status: String(row.status),
        });
        setModal(true);
    };

    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route('category.store'), {
                id:     data.editId,
                name:   data.name,
                type:   data.type,
                status: data.status,
            }, { preserveScroll: true, onSuccess: closeModal });
            return;
        }
        post(route('category.store'), { onSuccess: closeModal });
    };

    const destroy = (row) => {
        if (!confirm(`Delete category "${row.name}"?`)) return;
        router.delete(route('category.destroy', row.id), { preserveScroll: true });
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            className: 'text-left font-medium',
        },
        {
            key: 'type',
            label: 'Type',
            headerClassName: 'w-28',
            className: 'text-center',
            render: (row) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.type == 1
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
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
            key: '_actions',
            label: '',
            headerClassName: 'w-16',
            className: 'text-right',
            render: (row) => (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); destroy(row); }}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                >
                    Delete
                </button>
            ),
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Categories" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Categories</h1>
                        <PrimaryButton type="button" onClick={openCreate}>
                            Add Category <CirclePlus size={16} className="ml-1" />
                        </PrimaryButton>
                    </div>

                    <div className="p-4 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={categories}
                            rowKey="id"
                            perPage={20}
                            emptyText="No categories found."
                            onRowClick={openEdit}
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal show={modal} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditing ? 'Edit Category' : 'Add Category'}
                        </h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>

                    <div>
                        <InputLabel value="Name *" />
                        <TextInput
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Category name"
                            required
                        />
                        <InputError className="mt-1" message={errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Type *" />
                            <select
                                required
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`mt-1 ${selectCls}`}
                            >
                                <option value="">— Select —</option>
                                <option value="1">Income</option>
                                <option value="0">Expense</option>
                            </select>
                            <InputError className="mt-1" message={errors.type} />
                        </div>
                        <div>
                            <InputLabel value="Status *" />
                            <select
                                required
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
        </AuthenticatedLayout>
    );
}
