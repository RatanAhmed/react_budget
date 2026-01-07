import React, { useEffect, useState } from "react";
import {router } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import { X, Filter } from "lucide-react";
import InputLabel from "@/Components/InputLabel";

export default function TaskFilter({ tasks, categories, today }) {
    const [filters, setFilters] = useState({
        date: today,
        status: 0,
        task_categories_id: "",
    });
    const filterTasks = (e) => {
        e.preventDefault();
        router.get(route("tasks.index"), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="">

            <form onSubmit={filterTasks}>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
                    <div>
                        {/* <InputLabel htmlFor="date" value="Date" className="block text-sm font-medium mb-1"/> */}
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
                        {/* <InputLabel htmlFor="status" value="Status" className="block text-sm font-medium mb-1"/> */}
                        <select
                            id="status"
                            name="status"
                            value={filters?.status}
                            onChange={(e) =>
                                setFilters({ ...filters, status: e.target.value })
                            }
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm block w-full"
                        >
                            <option value="">All Status</option>
                            <option value={0}>Pending</option>
                            <option value={1}>Completed</option>
                            <option value={2}>In Progress</option>
                            <option value={3}>Cancelled</option>
                        </select>
                    </div>
                    <div>
                        {/* <InputLabel htmlFor="status" value="Status" className="block text-sm font-medium mb-1"/> */}
                        <select
                            id="task_categories_id"
                            name="task_categories_id"
                            value={filters?.task_categories_id}
                            onChange={(e) =>
                                setFilters({ ...filters, task_categories_id: e.target.value })
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
