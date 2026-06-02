import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import DataTable from "@/Components/DataTable";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import { useForm, Head, router } from "@inertiajs/react";
import { CirclePlus, X } from "lucide-react";

const selectCls =
    "block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm";

const TABS = [
    { key: "categories", label: "Expense Categories" },
    { key: "task_cats",  label: "Task Categories" },
];

// ── Category panel ────────────────────────────────────────────────────────────

function CategoryPanel({ categories }) {
    const TYPE_LABEL   = { 1: "Income", 0: "Expense" };
    const STATUS_LABEL = { 1: "Active", 0: "Inactive" };

    const { data, setData, post, processing, reset, errors } = useForm({
        editId: null, name: "", type: "", status: "1",
    });
    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    const openCreate = () => { reset(); setData({ editId: null, name: "", type: "", status: "1" }); setModal(true); };
    const openEdit   = (row) => { setData({ editId: row.id, name: row.name, type: String(row.type), status: String(row.status) }); setModal(true); };
    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route("category.store"), { id: data.editId, name: data.name, type: data.type, status: data.status },
                { preserveScroll: true, onSuccess: closeModal });
        } else {
            post(route("category.store"), { onSuccess: closeModal });
        }
    };

    const destroy = (row) => {
        if (!confirm(`Delete "${row.name}"?`)) return;
        router.delete(route("category.destroy", row.id), { preserveScroll: true });
    };

    const columns = [
        { key: "name",   label: "Name",   className: "text-left font-medium" },
        { key: "type",   label: "Type",   headerClassName: "w-24", className: "text-center",
          render: (row) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.type == 1 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{TYPE_LABEL[row.type] ?? row.type}</span> },
        { key: "status", label: "Status", headerClassName: "w-24", className: "text-center",
          render: (row) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status == 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{STATUS_LABEL[row.status] ?? row.status}</span> },
        { key: "_del",   label: "",       headerClassName: "w-12", className: "text-right",
          render: (row) => <button type="button" onClick={(e) => { e.stopPropagation(); destroy(row); }} className="text-xs text-red-400 hover:text-red-600">Delete</button> },
    ];

    return (
        <>
            <div className="flex justify-end mb-3">
                <button onClick={openCreate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">
                    <CirclePlus size={14} /> Add Category
                </button>
            </div>
            <DataTable columns={columns} data={categories ?? []} rowKey="id" perPage={20} emptyText="No categories." onRowClick={openEdit} />

            <Modal show={modal} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">{isEditing ? "Edit Category" : "Add Category"}</h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <div>
                        <InputLabel value="Name *" />
                        <TextInput className="mt-1 block w-full" value={data.name} onChange={(e) => setData("name", e.target.value)} required />
                        <InputError className="mt-1" message={errors.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Type *" />
                            <select required value={data.type} onChange={(e) => setData("type", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="">— Select —</option>
                                <option value="1">Income</option>
                                <option value="0">Expense</option>
                            </select>
                            <InputError className="mt-1" message={errors.type} />
                        </div>
                        <div>
                            <InputLabel value="Status" />
                            <select value={data.status} onChange={(e) => setData("status", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <PrimaryButton disabled={processing}>{isEditing ? "Update" : "Save"}</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}

// ── Income panel ──────────────────────────────────────────────────────────────

function IncomePanel({ earnings }) {
    const TYPE_LABEL   = { 1: "Salary", 2: "Partial", 0: "Others" };
    const STATUS_LABEL = { 1: "Active", 0: "Inactive" };
    const date = new Date();

    const { data, setData, post, processing, reset, errors } = useForm({
        editId: null, source: "", amount: "", details: "", status: "1", type: "1",
        month: date.getMonth() + 1, year: date.getFullYear(),
    });
    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    const openCreate = () => { reset(); setData({ editId: null, source: "", amount: "", details: "", status: "1", type: "1", month: date.getMonth() + 1, year: date.getFullYear() }); setModal(true); };
    const openEdit   = (row) => { setData({ editId: row.id, source: row.source, amount: row.amount, details: row.details ?? "", status: String(row.status), type: String(row.type), month: row.month ?? date.getMonth() + 1, year: row.year ?? date.getFullYear() }); setModal(true); };
    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route("income.store"), { id: data.editId, source: data.source, amount: data.amount, details: data.details, status: data.status, type: data.type, month: data.month, year: data.year },
                { preserveScroll: true, onSuccess: closeModal });
        } else {
            post(route("income.store"), { onSuccess: closeModal });
        }
    };

    const total = (earnings ?? []).reduce((s, e) => s + Number(e.amount), 0);

    const columns = [
        { key: "source",  label: "Source",  headerClassName: "w-32", className: "text-left font-medium whitespace-nowrap" },
        { key: "details", label: "Details", className: "text-left text-sm text-gray-600" },
        { key: "type",    label: "Type",    headerClassName: "w-24", className: "text-center",
          render: (row) => <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{TYPE_LABEL[row.type] ?? row.type}</span> },
        { key: "status",  label: "Status",  headerClassName: "w-24", className: "text-center",
          render: (row) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status == 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{STATUS_LABEL[row.status] ?? row.status}</span> },
        { key: "amount",  label: "Amount",  headerClassName: "w-28 text-right", className: "text-right font-medium tabular-nums",
          render: (row) => Number(row.amount).toLocaleString() },
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">Total: <span className="font-semibold text-indigo-700">{total.toLocaleString()}</span></div>
                <button onClick={openCreate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">
                    <CirclePlus size={14} /> Add Earning
                </button>
            </div>
            <DataTable columns={columns} data={earnings ?? []} rowKey="id" perPage={20} emptyText="No earnings." onRowClick={openEdit} />

            <Modal show={modal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">{isEditing ? "Edit Earning" : "Add Earning"}</h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Source *" />
                            <TextInput className="mt-1 block w-full" value={data.source} onChange={(e) => setData("source", e.target.value)} placeholder="e.g. Employer" required />
                            <InputError className="mt-1" message={errors.source} />
                        </div>
                        <div>
                            <InputLabel value="Amount *" />
                            <TextInput type="number" min="0" className="mt-1 block w-full" value={data.amount} onChange={(e) => setData("amount", e.target.value)} placeholder="0.00" required />
                            <InputError className="mt-1" message={errors.amount} />
                        </div>
                    </div>
                    <div>
                        <InputLabel value="Details *" />
                        <textarea value={data.details} onChange={(e) => setData("details", e.target.value)} rows={2} className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm" required />
                        <InputError className="mt-1" message={errors.details} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <InputLabel value="Type" />
                            <select value={data.type} onChange={(e) => setData("type", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="1">Salary</option>
                                <option value="2">Partial</option>
                                <option value="0">Others</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Status" />
                            <select value={data.status} onChange={(e) => setData("status", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Month" />
                            <TextInput type="number" min="1" max="12" className="mt-1 block w-full" value={data.month} onChange={(e) => setData("month", e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Year" />
                            <TextInput type="number" min="2020" max="2035" className="mt-1 block w-full" value={data.year} onChange={(e) => setData("year", e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <PrimaryButton disabled={processing}>{isEditing ? "Update" : "Save"}</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}

// ── Budget panel ──────────────────────────────────────────────────────────────

function BudgetPanel({ budgets }) {
    const TYPE_LABEL     = { 1: "Once", 2: "Daily", 3: "Weekly", 4: "Monthly", 5: "Quarterly", 6: "Biannually", 7: "Annually", 0: "Others" };
    const PRIORITY_LABEL = { 1: "Regular", 2: "Urgent", 3: "Weekly" };
    const STATUS_LABEL   = { 1: "Active", 0: "Inactive" };
    const date = new Date();

    const { data, setData, post, processing, reset, errors } = useForm({
        editId: null, title: "", amount: "", description: "", status: "1", type: "4", priority: "1",
        month: date.getMonth() + 1, year: date.getFullYear(),
    });
    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    const openCreate = () => { reset(); setData({ editId: null, title: "", amount: "", description: "", status: "1", type: "4", priority: "1", month: date.getMonth() + 1, year: date.getFullYear() }); setModal(true); };
    const openEdit   = (row) => { setData({ editId: row.id, title: row.title, amount: row.amount, description: row.description ?? "", status: String(row.status), type: String(row.type), priority: String(row.priority), month: row.month ?? date.getMonth() + 1, year: row.year ?? date.getFullYear() }); setModal(true); };
    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route("budget.store"), { id: data.editId, title: data.title, amount: data.amount, description: data.description, status: data.status, type: data.type, priority: data.priority, month: data.month, year: data.year },
                { preserveScroll: true, onSuccess: closeModal });
        } else {
            post(route("budget.store"), { onSuccess: closeModal });
        }
    };

    const total = (budgets ?? []).reduce((s, b) => s + Number(b.amount), 0);

    const columns = [
        { key: "title",       label: "Title",       className: "text-left font-medium" },
        { key: "description", label: "Description", className: "text-left text-sm text-gray-500", render: (row) => row.description || "—" },
        { key: "type",        label: "Type",        headerClassName: "w-24", className: "text-center",
          render: (row) => <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{TYPE_LABEL[row.type] ?? row.type}</span> },
        { key: "priority",    label: "Priority",    headerClassName: "w-24", className: "text-center",
          render: (row) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.priority == 2 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{PRIORITY_LABEL[row.priority] ?? row.priority}</span> },
        { key: "amount",      label: "Amount",      headerClassName: "w-28 text-right", className: "text-right font-medium tabular-nums",
          render: (row) => Number(row.amount).toLocaleString() },
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">Total: <span className="font-semibold text-indigo-700">{total.toLocaleString()}</span></div>
                <button onClick={openCreate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">
                    <CirclePlus size={14} /> Add Budget
                </button>
            </div>
            <DataTable columns={columns} data={budgets ?? []} rowKey="id" perPage={20} emptyText="No budgets." onRowClick={openEdit} />

            <Modal show={modal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">{isEditing ? "Edit Budget" : "Add Budget"}</h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Title *" />
                            <TextInput className="mt-1 block w-full" value={data.title} onChange={(e) => setData("title", e.target.value)} required />
                            <InputError className="mt-1" message={errors.title} />
                        </div>
                        <div>
                            <InputLabel value="Amount *" />
                            <TextInput type="number" min="0" className="mt-1 block w-full" value={data.amount} onChange={(e) => setData("amount", e.target.value)} required />
                            <InputError className="mt-1" message={errors.amount} />
                        </div>
                    </div>
                    <div>
                        <InputLabel value="Description *" />
                        <textarea value={data.description} onChange={(e) => setData("description", e.target.value)} rows={2} className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm" required />
                        <InputError className="mt-1" message={errors.description} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <InputLabel value="Type" />
                            <select value={data.type} onChange={(e) => setData("type", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="1">Once</option><option value="2">Daily</option><option value="3">Weekly</option>
                                <option value="4">Monthly</option><option value="5">Quarterly</option>
                                <option value="6">Biannually</option><option value="7">Annually</option><option value="0">Others</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Priority" />
                            <select value={data.priority} onChange={(e) => setData("priority", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="1">Regular</option><option value="2">Urgent</option><option value="3">Weekly</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Status" />
                            <select value={data.status} onChange={(e) => setData("status", e.target.value)} className={`mt-1 ${selectCls}`}>
                                <option value="1">Active</option><option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Month" />
                            <TextInput type="number" min="1" max="12" className="mt-1 block w-full" value={data.month} onChange={(e) => setData("month", e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Year" />
                            <TextInput type="number" min="2020" max="2035" className="mt-1 block w-full" value={data.year} onChange={(e) => setData("year", e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <PrimaryButton disabled={processing}>{isEditing ? "Update" : "Save"}</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}

// ── Task Categories panel ─────────────────────────────────────────────────────

function TaskCategoryPanel({ taskCategories }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        editId: null, name: "", status: "1",
    });
    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    const openCreate = () => { reset(); setData({ editId: null, name: "", status: "1" }); setModal(true); };
    const openEdit   = (row) => { setData({ editId: row.id, name: row.name, status: String(row.status) }); setModal(true); };
    const closeModal = () => { setModal(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route("task-categories.store"), { id: data.editId, name: data.name, status: data.status },
                { preserveScroll: true, onSuccess: closeModal });
        } else {
            post(route("task-categories.store"), { onSuccess: closeModal });
        }
    };

    const columns = [
        { key: "name",   label: "Name",   className: "text-left font-medium" },
        { key: "status", label: "Status", headerClassName: "w-24", className: "text-center",
          render: (row) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status == 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{row.status == 1 ? "Active" : "Inactive"}</span> },
    ];

    return (
        <>
            <div className="flex justify-end mb-3">
                <button onClick={openCreate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">
                    <CirclePlus size={14} /> Add Task Category
                </button>
            </div>
            <DataTable columns={columns} data={taskCategories ?? []} rowKey="id" perPage={20} emptyText="No task categories." onRowClick={openEdit} />

            <Modal show={modal} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">{isEditing ? "Edit Task Category" : "Add Task Category"}</h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <div>
                        <InputLabel value="Name *" />
                        <TextInput className="mt-1 block w-full" value={data.name} onChange={(e) => setData("name", e.target.value)} required />
                        <InputError className="mt-1" message={errors.name} />
                    </div>
                    <div>
                        <InputLabel value="Status" />
                        <select value={data.status} onChange={(e) => setData("status", e.target.value)} className={`mt-1 ${selectCls}`}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <PrimaryButton disabled={processing}>{isEditing ? "Update" : "Save"}</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function Index({ auth, categories, taskCategories, activeTab: initialTab = "categories" }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Settings" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage categories, income sources, and budgets.</p>
                    </div>

                    {/* Tab bar */}
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-4 sm:p-6">
                        {activeTab === "categories" && <CategoryPanel categories={categories} />}
                        {activeTab === "task_cats"  && <TaskCategoryPanel taskCategories={taskCategories} />}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
