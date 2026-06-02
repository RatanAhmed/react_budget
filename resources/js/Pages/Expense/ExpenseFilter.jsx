import React, { useState } from "react";
import { router } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ExpenseFilter
 *
 * Props
 * ─────
 * incomes, budgets, categories  — option lists
 * initialFilters                — current filter values from the server (Inertia prop)
 */
export default function ExpenseFilter({ incomes, budgets, categories, initialFilters = {} }) {
    const todayStr = new Date().toISOString().split("T")[0];

    const [filters, setFilters] = useState({
        date_from:   initialFilters.date_from   ?? "",
        date_to:     initialFilters.date_to     ?? "",
        category_id: initialFilters.category_id ?? "",
        income_id:   initialFilters.income_id   ?? "",
        budget_id:   initialFilters.budget_id   ?? "",
    });

    const isToday =
        filters.date_from === todayStr && filters.date_to === todayStr;

    const apply = (overrides = {}) => {
        const next = { ...filters, ...overrides };
        setFilters(next);
        router.get(route("expense.index"), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        apply();
    };

    // ── Month navigation ──────────────────────────────────────────────────────
    // Derive the "active" month from date_from (or today as fallback)
    const activeMonth = filters.date_from
        ? new Date(filters.date_from + "T00:00:00")
        : new Date();

    const shiftMonth = (delta) => {
        const d = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + delta, 1);
        const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const to   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
        apply({ date_from: from, date_to: to });
    };

    const monthLabel = activeMonth.toLocaleString("default", { month: "long", year: "numeric" });

    const selectCls =
        "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm block w-full text-sm";

    return (
        <div className="space-y-2">
            {/* ── Month navigator ── */}
            <div className="flex items-center gap-1 justify-end">
                <button
                    type="button"
                    onClick={() => apply({ date_from: todayStr, date_to: todayStr })}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                        isToday
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Today
                </button>
                <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[130px] text-center">
                    {monthLabel}
                </span>
                <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* ── Filter row ── */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {/* Date from */}
                    <div>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            className={selectCls}
                            placeholder="From"
                            title="From date"
                        />
                    </div>

                    {/* Date to */}
                    <div>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                            className={selectCls}
                            placeholder="To"
                            title="To date"
                        />
                    </div>

                    {/* Income */}
                    <div>
                        <select
                            value={filters.income_id}
                            onChange={(e) => setFilters({ ...filters, income_id: e.target.value })}
                            className={selectCls}
                        >
                            <option value="">All Income</option>
                            {incomes?.map((inc) => (
                                <option key={inc.id} value={inc.id}>{inc.details}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget */}
                    <div>
                        <select
                            value={filters.budget_id}
                            onChange={(e) => setFilters({ ...filters, budget_id: e.target.value })}
                            className={selectCls}
                        >
                            <option value="">All Budgets</option>
                            {budgets?.map((b) => (
                                <option key={b.id} value={b.id}>{b.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <select
                            value={filters.category_id}
                            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                            className={selectCls}
                        >
                            <option value="">All Category</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <div>
                        <PrimaryButton className="w-full justify-center">
                            Filter <Filter size={14} className="ml-1" />
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </div>
    );
}
