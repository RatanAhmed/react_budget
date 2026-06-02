import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const inputCls =
    "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm";

export default function TaskFilter({ categories, initialFilters = {} }) {
    const [filters, setFilters] = useState({
        date_from:          initialFilters.date_from                    ?? "",
        date_to:            initialFilters.date_to                      ?? "",
        status:             String(initialFilters.status                ?? ""),
        task_categories_id: String(initialFilters.task_categories_id   ?? ""),
    });

    const apply = (overrides = {}) => {
        const next = { ...filters, ...overrides };
        setFilters(next);
        // Strip empty values so they don't pollute the URL / controller
        const params = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== "" && v !== null && v !== undefined)
        );
        router.get(route("tasks.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // ── Month navigation ──────────────────────────────────────────────────────
    const activeMonth = filters.date_from
        ? new Date(filters.date_from + "T00:00:00")
        : new Date();

    const shiftMonth = (delta) => {
        const d    = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + delta, 1);
        const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const to   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
        apply({ date_from: from, date_to: to });
    };

    const monthLabel = activeMonth.toLocaleString("default", { month: "long", year: "numeric" });

    return (
        <div className="space-y-1.5">
            {/* Month navigator */}
            <div className="flex items-center gap-1 justify-end">
                <button type="button" onClick={() => shiftMonth(-1)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    aria-label="Previous month">
                    <ChevronLeft size={15} />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[130px] text-center">
                    {monthLabel}
                </span>
                <button type="button" onClick={() => shiftMonth(1)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    aria-label="Next month">
                    <ChevronRight size={15} />
                </button>
            </div>

            {/* Filter row */}
            <form onSubmit={(e) => { e.preventDefault(); apply(); }}>
                <div className="flex flex-wrap gap-2 justify-end">
                    <input type="date" value={filters.date_from}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                        className={inputCls} title="From date" />

                    <input type="date" value={filters.date_to}
                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                        className={inputCls} title="To date" />

                    <select value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className={inputCls}>
                        <option value="">All Status</option>
                        <option value="0">Pending</option>
                        <option value="1">Completed</option>
                        <option value="2">In Progress</option>
                        <option value="3">Cancelled</option>
                    </select>

                    <select value={filters.task_categories_id}
                        onChange={(e) => setFilters({ ...filters, task_categories_id: e.target.value })}
                        className={inputCls}>
                        <option value="">All Categories</option>
                        {categories?.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                        ))}
                    </select>

                    <button type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">
                        <Filter size={13} /> Filter
                    </button>
                </div>
            </form>
        </div>
    );
}
