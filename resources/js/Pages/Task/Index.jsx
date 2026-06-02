import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import DataTable from "@/Components/DataTable";
import { useForm, Head, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import { CirclePlus, Plus, Trash2, X, RefreshCw } from "lucide-react";
import TaskFilter from "./TaskFilter";
import Swal from "sweetalert2";

// ── Constants ─────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
    { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" }, { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" },
];

const PRIORITY_LABEL = { 1: "Regular", 2: "Moderate", 3: "Urgent" };
const PRIORITY_COLOR  = {
    1: "bg-gray-100 text-gray-600",
    2: "bg-yellow-100 text-yellow-700",
    3: "bg-red-100 text-red-700",
};
const STATUS_COLOR = {
    0: "bg-yellow-50 text-yellow-700",
    1: "bg-green-50 text-green-700",
    2: "bg-blue-50 text-blue-700",
    3: "bg-red-50 text-red-600",
};

const selectCls =
    "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full text-sm";

const blankItem = () => ({
    details: "", time: "", priority: 1,
    task_categories_id: "", is_recurring: false,
    end_date: "",
    schedule: { interval_type: "daily", interval_value: 1, week_days: [], month_day: "", month: "" },
});

function formatTime(time) {
    if (!time) return "";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Index({ auth, tasks, categories, filters = {} }) {
    const today = new Date().toISOString().split("T")[0];
    const now   = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

    // Derive display month label from active filter
    const activeMonthDate = filters.date_from
        ? new Date(filters.date_from + "T00:00:00")
        : new Date();
    const activeMonthLabel = activeMonthDate.toLocaleString("default", { month: "long", year: "numeric" });

    // ── Form ──────────────────────────────────────────────────────────────────
    const { data, setData, post, processing, reset, errors } = useForm({
        editId:  null,
        date:    today,
        status:  0,
        remarks: "",
        items:   [blankItem()],
    });

    const isEditing = Boolean(data.editId);
    const [modal, setModal] = useState(false);

    // ── Modal helpers ─────────────────────────────────────────────────────────

    const openCreate = () => {
        reset();
        setData({ editId: null, date: today, status: 0, remarks: "", items: [blankItem()] });
        setModal(true);
    };

    const openEdit = (row) => {
        setData({
            editId:  row.id,
            date:    row.date ?? today,
            status:  row.status ?? 0,
            remarks: row.remarks ?? "",
            items: [{
                details:            row.details ?? "",
                time:               row.time ?? "",
                priority:           row.priority ?? 1,
                task_categories_id: row.task_categories_id ?? "",
                is_recurring:       row.is_recurring ?? false,
                end_date:           row.end_date ?? "",
                schedule: row.schedule ?? blankItem().schedule,
            }],
        });
        setModal(true);
    };

    const closeModal = () => { setModal(false); reset(); };

    // ── Line-item helpers ─────────────────────────────────────────────────────

    const setItem = (index, field, value) =>
        setData("items", data.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));

    const setItemSchedule = (index, key, value) =>
        setItem(index, "schedule", { ...data.items[index].schedule, [key]: value });

    const toggleWeekDay = (index, day) => {
        const days = data.items[index].schedule.week_days ?? [];
        setItemSchedule(index, "week_days",
            days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
        );
    };

    const addItem    = () => setData("items", [...data.items, blankItem()]);
    const removeItem = (i) => {
        if (data.items.length === 1) return;
        setData("items", data.items.filter((_, idx) => idx !== i));
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            const item = data.items[0];
            router.post(route("tasks.store"), {
                id:                 data.editId,
                date:               data.date,
                status:             data.status,
                remarks:            data.remarks,
                details:            item.details,
                time:               item.time || null,
                priority:           item.priority,
                task_categories_id: item.task_categories_id || null,
                is_recurring:       item.is_recurring,
                end_date:           item.end_date || null,
                schedule:           item.is_recurring ? item.schedule : undefined,
            }, { preserveScroll: true, onSuccess: closeModal });
            return;
        }

        // Bulk create — send items array
        post(route("tasks.store"), { onSuccess: closeModal });
    };

    // ── Delete / status ───────────────────────────────────────────────────────

    const deleteTask = (id) => {
        Swal.fire({
            title: "Delete this task?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
            cancelButtonText: "Cancel",
        }).then((r) => {
            if (r.isConfirmed)
                router.delete(route("tasks.destroy", id), { preserveScroll: true });
        });
    };

    const updateStatus = (e, taskId, status) => {
        e.stopPropagation();
        router.post(route("tasks.update-status", taskId), { status },
            { preserveScroll: true, preserveState: true });
    };

    // ── Table columns ─────────────────────────────────────────────────────────

    const rows = tasks?.data ?? tasks ?? [];
    const total = rows.length;
    const pending = rows.filter((t) => t.status === 0).length;
    const done    = rows.filter((t) => t.status === 1).length;

    const columns = [
        {
            key: "date",
            label: "Date",
            headerClassName: "w-24",
            className: "whitespace-nowrap text-gray-600 text-xs",
        },
        {
            key: "details",
            label: "Details",
            className: "text-left",
            render: (row) => (
                <div className="flex flex-wrap items-center gap-1">
                    {row.time && (
                        <span className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium shrink-0">
                            {formatTime(row.time)}
                        </span>
                    )}
                    <span className="text-gray-800 text-sm">{row.details}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${PRIORITY_COLOR[row.priority] ?? PRIORITY_COLOR[1]}`}>
                        {PRIORITY_LABEL[row.priority] ?? "Regular"}
                    </span>
                    {row.is_recurring && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 shrink-0">
                            <RefreshCw size={9} /> {row.frequency_label ?? "Recurring"}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            headerClassName: "w-28",
            className: "text-center",
            render: (row) => row.category?.name
                ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{row.category.name}</span>
                : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            key: "status",
            label: "Status",
            headerClassName: "w-32",
            className: "text-center",
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {row.status === 1 ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Done ✓</span>
                    ) : row.status === 3 ? (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Cancelled</span>
                    ) : row.status === 2 ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">In Progress</span>
                    ) : (
                        <>
                            <input type="checkbox" checked={false}
                                onChange={(e) => updateStatus(e, row.id, 1)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer w-3.5 h-3.5"
                                title="Mark complete" />
                            <button onClick={(e) => updateStatus(e, row.id, 3)}
                                className="text-red-400 hover:text-red-600 transition-colors" title="Cancel">
                                <X size={12} />
                            </button>
                        </>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(row.id); }}
                        className="text-red-300 hover:text-red-500 transition-colors ml-0.5" title="Delete">
                        <Trash2 size={12} />
                    </button>
                </div>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tasks" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Tasks</h1>
                            <p className="text-xs text-gray-500 mt-0.5">{activeMonthLabel}</p>
                        </div>
                        <button type="button" onClick={openCreate}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">
                            <CirclePlus size={14} /> Add Tasks
                        </button>
                    </div>

                    <div className="p-4 space-y-3">

                        {/* Stats + Filter row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-semibold text-gray-800">{total}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                                    <span className="text-gray-500">Pending</span>
                                    <span className="font-semibold text-yellow-700">{pending}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                    <span className="text-gray-500">Done</span>
                                    <span className="font-semibold text-green-700">{done}</span>
                                </div>
                            </div>

                            {/* Filter */}
                            <TaskFilter categories={categories} initialFilters={filters} />
                        </div>

                        {/* Table */}
                        <DataTable
                            columns={columns}
                            data={tasks}
                            rowKey="id"
                            perPage={20}
                            emptyText="No tasks found for this period."
                            onRowClick={(row) => openEdit(row)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
            <Modal show={modal} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">
                            {isEditing ? "Edit Task" : "Add Tasks"}
                        </h2>
                        <button type="button" onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Shared: date + status (edit only) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <InputLabel value="Date *" />
                            <TextInput type="date" className="mt-1 block w-full"
                                value={data.date}
                                onChange={(e) => setData("date", e.target.value)}
                                required />
                            <InputError className="mt-1" message={errors.date} />
                        </div>
                        {isEditing && (
                            <div>
                                <InputLabel value="Status" />
                                <select value={data.status}
                                    onChange={(e) => setData("status", e.target.value)}
                                    className={selectCls}>
                                    <option value={0}>Pending</option>
                                    <option value={1}>Completed</option>
                                    <option value={2}>In Progress</option>
                                    <option value={3}>Cancelled</option>
                                </select>
                            </div>
                        )}
                        {isEditing && (
                            <div className="sm:col-span-2">
                                <InputLabel value="Remarks" />
                                <TextInput className="mt-1 block w-full"
                                    value={data.remarks}
                                    onChange={(e) => setData("remarks", e.target.value)}
                                    placeholder="Optional note" />
                            </div>
                        )}
                    </div>

                    {/* Column headers (desktop) */}
                    {!isEditing && (
                        <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_100px_32px] gap-2 px-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details *</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</span>
                            <span />
                        </div>
                    )}

                    {/* Line items */}
                    <div className="space-y-2">
                        {data.items.map((item, index) => (
                            <div key={index} className="space-y-2">
                                {/* Main row */}
                                <div className={`grid gap-2 items-start ${
                                    isEditing
                                        ? "grid-cols-1 sm:grid-cols-[1fr_80px_120px_100px]"
                                        : "grid-cols-1 sm:grid-cols-[1fr_80px_120px_100px_32px] p-2 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent border border-gray-200 sm:border-0"
                                }`}>

                                    {/* Details */}
                                    <div>
                                        {isEditing && <InputLabel value="Details *" />}
                                        <TextInput type="text"
                                            className={`block w-full text-sm ${isEditing ? "mt-1" : ""}`}
                                            value={item.details}
                                            onChange={(e) => setItem(index, "details", e.target.value)}
                                            placeholder="Task description"
                                            required />
                                        <InputError className="mt-1" message={errors[`items.${index}.details`]} />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        {isEditing && <InputLabel value="Time" />}
                                        <TextInput type="time"
                                            className={`block w-full text-sm ${isEditing ? "mt-1" : ""}`}
                                            value={item.time ?? ""}
                                            onChange={(e) => setItem(index, "time", e.target.value)} />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        {isEditing && <InputLabel value="Category" />}
                                        <select value={item.task_categories_id ?? ""}
                                            onChange={(e) => setItem(index, "task_categories_id", e.target.value)}
                                            className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm block w-full ${isEditing ? "mt-1" : ""}`}>
                                            <option value="">— None —</option>
                                            {categories?.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        {isEditing && <InputLabel value="Priority" />}
                                        <select value={item.priority}
                                            onChange={(e) => setItem(index, "priority", e.target.value)}
                                            className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm block w-full ${isEditing ? "mt-1" : ""}`}>
                                            <option value={1}>Regular</option>
                                            <option value={2}>Moderate</option>
                                            <option value={3}>Urgent</option>
                                        </select>
                                    </div>

                                    {/* Remove row (create only) */}
                                    {!isEditing && (
                                        <div className="flex items-center justify-end sm:justify-center">
                                            <button type="button" onClick={() => removeItem(index)}
                                                disabled={data.items.length === 1}
                                                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                aria-label="Remove row">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Recurring toggle — per item */}
                                <div className="border border-gray-200 rounded-lg bg-gray-50 px-3 py-2.5 space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox"
                                            checked={item.is_recurring}
                                            onChange={(e) => setItem(index, "is_recurring", e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                                        <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                            <RefreshCw size={11} className="text-indigo-500" /> Recurring
                                        </span>
                                    </label>

                                    {item.is_recurring && (
                                        <div className="space-y-3 pl-1">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <div>
                                                    <InputLabel value="Frequency" />
                                                    <select value={item.schedule.interval_type}
                                                        onChange={(e) => setItemSchedule(index, "interval_type", e.target.value)}
                                                        className={selectCls}>
                                                        <option value="daily">Daily</option>
                                                        <option value="weekly">Weekly</option>
                                                        <option value="monthly">Monthly</option>
                                                        <option value="yearly">Yearly</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <InputLabel value="Every N" />
                                                    <TextInput type="number" min={1} max={365}
                                                        className="mt-1 block w-full"
                                                        value={item.schedule.interval_value}
                                                        onChange={(e) => setItemSchedule(index, "interval_value", parseInt(e.target.value) || 1)} />
                                                </div>
                                                <div>
                                                    <InputLabel value="End Date" />
                                                    <TextInput type="date" className="mt-1 block w-full"
                                                        value={item.end_date ?? ""}
                                                        min={data.date}
                                                        onChange={(e) => setItem(index, "end_date", e.target.value)} />
                                                </div>
                                                {item.schedule.interval_type === "monthly" && (
                                                    <div>
                                                        <InputLabel value="Day of month" />
                                                        <TextInput type="number" min={1} max={31}
                                                            className="mt-1 block w-full"
                                                            value={item.schedule.month_day ?? ""}
                                                            onChange={(e) => setItemSchedule(index, "month_day", e.target.value)}
                                                            placeholder="e.g. 15" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Weekly day picker */}
                                            {item.schedule.interval_type === "weekly" && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {WEEK_DAYS.map((d) => {
                                                        const active = (item.schedule.week_days ?? []).includes(d.key);
                                                        return (
                                                            <button key={d.key} type="button"
                                                                onClick={() => toggleWeekDay(index, d.key)}
                                                                className={`w-9 h-9 rounded-full text-xs font-semibold border transition-colors ${
                                                                    active
                                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                                        : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                                                                }`}>
                                                                {d.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Yearly: month + day */}
                                            {item.schedule.interval_type === "yearly" && (
                                                <div className="grid grid-cols-2 gap-2 max-w-xs">
                                                    <div>
                                                        <InputLabel value="Month" />
                                                        <select value={item.schedule.month ?? ""}
                                                            onChange={(e) => setItemSchedule(index, "month", e.target.value)}
                                                            className={selectCls}>
                                                            <option value="">— Select —</option>
                                                            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                                                                <option key={i + 1} value={i + 1}>{m}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Day" />
                                                        <TextInput type="number" min={1} max={31}
                                                            className="mt-1 block w-full"
                                                            value={item.schedule.month_day ?? ""}
                                                            onChange={(e) => setItemSchedule(index, "month_day", e.target.value)} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Preview */}
                                            <p className="text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1">
                                                {item.schedule.interval_type === "daily" && (item.schedule.interval_value === 1 ? "Every day" : `Every ${item.schedule.interval_value} days`)}
                                                {item.schedule.interval_type === "weekly" && (item.schedule.week_days?.length > 0 ? `Every week on ${item.schedule.week_days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}` : `Every ${item.schedule.interval_value} week(s)`)}
                                                {item.schedule.interval_type === "monthly" && (item.schedule.month_day ? `Day ${item.schedule.month_day} of every month` : "Monthly")}
                                                {item.schedule.interval_type === "yearly" && "Yearly"}
                                                {item.end_date && ` · until ${item.end_date}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add row + count */}
                        {!isEditing && (
                            <div className="flex items-center justify-between pt-1">
                                <button type="button" onClick={addItem}
                                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                                    <Plus size={14} /> Add another task
                                </button>
                                {data.items.length > 1 && (
                                    <span className="text-xs text-gray-500">{data.items.length} tasks</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={closeModal}
                            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <div className="flex gap-2">
                            <button type="button"
                                onClick={() => setData({ editId: data.editId, date: data.date, status: 0, remarks: "", items: [blankItem()] })}
                                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                                Reset
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-md transition-colors">
                                {processing ? "Saving…" : isEditing ? "Update" : "Save All"}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
