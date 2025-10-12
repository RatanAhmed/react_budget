import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, Head } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import Dropdown from "@/Components/Dropdown";

export default function Index({ auth, earnings }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        source: "",
        amount: "",
        details: "",
        status: "",
        type: "",
        month: "",
        year: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("income.store"), { onSuccess: () => reset() });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="earning" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 lg:p-8">
                <div>
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="border border-slate-300">Source</th>
                                <th className="border border-slate-300">Details</th>
                                <th className="border border-slate-300">Amount</th>
                                <th className="border border-slate-300">Status</th>
                                <th className="border border-slate-300">Type</th>
                                <th className="border border-slate-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.map((earning) => (
                                <tr>
                                    <td className="text-center border border-slate-300">
                                        {earning.source}
                                    </td>
                                    <td className="text-left border border-slate-300">
                                        {earning.details}
                                    </td>
                                    <td className="text-center border border-slate-300">
                                        {earning.amount}
                                    </td>
                                    <td className="text-center border border-slate-300">
                                        {earning.status == 1
                                            ? "Active"
                                            : "Inactive"}
                                    </td>
                                    <td className="text-center border border-slate-300">
                                        {earning.type == 1 ? "Salary" : "Partial"}
                                    </td>
                                    <td className="text-center border border-slate-300"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <form onSubmit={submit}>
                        <div>
                            <div className="text-xl font-semibold">
                                Earning Details
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <InputLabel htmlFor="source" value="Source" />

                                <TextInput
                                    id="source"
                                    className="mt-1 block w-full"
                                    value={data.source}
                                    onChange={(e) =>
                                        setData("source", e.target.value)
                                    }
                                    required
                                    isFocused
                                    autoComplete="source"
                                    placeholder="Source of earning"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.source}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="amount" value="Amount" />

                                <TextInput
                                    id="amount"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    required
                                    isFocused
                                    autoComplete="amount"
                                    placeholder="amount of earning"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.amount}
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <InputLabel
                                className=""
                                htmlFor="details"
                                value="Details"
                            />
                            <textarea
                                value={data.details}
                                placeholder="Details about earning"
                                className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                onChange={(e) => setData("details", e.target.value)}
                            ></textarea>
                            <InputError message={errors.details} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="">
                                <InputLabel htmlFor="status" value="Status" />

                                {/* <Dropdown className="form-control" children={'active', 'inactive'} /> */}
                                {/* <TextInput
                                    id="status"
                                    className="mt-1 block w-full"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="status"
                                    placeholder="status of earning"
                                /> */}
                                <select
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>

                                <InputError
                                    className="mt-2"
                                    message={errors.status}
                                />
                            </div>
                            <div className="">
                                <InputLabel htmlFor="type" value="Type" />
                                <select
                                    onChange={(e) =>
                                        setData("type", e.target.value)
                                    }
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                >
                                    <option value="1">Salary</option>
                                    <option value="2">Partial</option>
                                    <option value="0">Others</option>
                                </select>
                                {/* <TextInput
                                    id="type"
                                    className="mt-1 block w-full"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="type"
                                    placeholder="type of earning"
                                /> */}
                                <InputError
                                    className="mt-2"
                                    message={errors.type}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <InputLabel htmlFor="month" value="Month" />

                                <TextInput
                                    id="month"
                                    type="number"
                                    min="1"
                                    max="12"
                                    className="mt-1 block w-full"
                                    value={data.month}
                                    onChange={(e) =>
                                        setData("month", e.target.value)
                                    }
                                    isFocused
                                    autoComplete="month"
                                    placeholder="month of earning"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.month}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="year" value="Year" />

                                <TextInput
                                    id="year"
                                    type="number"
                                    min="2024"
                                    max="2030"
                                    className="mt-1 block w-full"
                                    value={data.year}
                                    onChange={(e) =>
                                        setData("year", e.target.value)
                                    }
                                    isFocused
                                    autoComplete="year"
                                    placeholder="year of earning"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.year}
                                />
                            </div>
                        </div>
                        <div className="grid justify-items-end mt-4">
                            <PrimaryButton className="mt-4" disabled={processing}>
                                Submit
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
