import React, { useEffect, useState } from "react";
import {router } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import { X, Filter } from "lucide-react";
import InputLabel from "@/Components/InputLabel";

export default function ExpenseFilter({ today, incomes, budgets, categories }) {
    const [filters, setFilters] = useState({
        date: today,
        category_id: "",
        income_id: "",
        budget_id: "",
    });
    const filterExpenses = (e) => {
        e.preventDefault();
        router.get(route("expense.index"), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="">

            <form onSubmit={filterExpenses}>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
                    <div>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            value={filters?.date || undefined}
                            onChange={(e) =>
                                setFilters({ ...filters, date: e.target.value })
                            }
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm  block w-full"
                        />
                    </div>

                    <div>
                        <select
                            id="income_id"
                            name="income_id"
                            value={filters?.income_id}
                            onChange={(e) =>
                                setFilters({ ...filters, income_id: e.target.value })
                            }
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm block w-full"
                        >
                            <option value="">All Income</option>
                            {incomes?.length > 0 && incomes.map((inc) => {
                                return <option key={inc.id} value={inc?.id}>{inc?.details}</option>;
                            })}
                        </select>
                    </div>
                    <div>
                        <select
                            id="budget_id"
                            name="budget_id"
                            value={filters?.budget_id}
                            onChange={(e) =>
                                setFilters({ ...filters, budget_id: e.target.value })
                            }
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm block w-full"
                        >
                            <option value="">All Budgets</option>
                            {budgets?.length > 0 && budgets.map((budget) => {
                                return <option key={budget.id} value={budget?.id}>{budget?.title}</option>;
                            })}
                        </select>
                    </div>
                    <div>
                        <select
                            id="category_id"
                            name="category_id"
                            value={filters?.category_id}
                            onChange={(e) =>
                                setFilters({ ...filters, category_id: e.target.value })
                            }
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm block w-full"
                        >
                            <option value="">All Category</option>
                            {categories?.length > 0 && categories.map((cat) => {
                                return <option key={cat.id} value={cat?.id}>{cat?.name}</option>;
                            })}
                        </select>
                    </div>
               
                    <div className="flex gap-2">
                        <PrimaryButton>
                            Filter <Filter size={24} />
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </div>
    );
}
