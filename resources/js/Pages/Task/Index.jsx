import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, Head, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import Dropdown from "@/Components/Dropdown";
import axios from "axios";

export default function Index({ auth, tasks }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        id: "",
        date: "",
        time: "",
        details: "",
        priority: 1,
        status: "",
        remarks: "",
    });
    const addTask = () => {

    };
    const editTask = (taskId) => {
        const task = tasks.find((task) => task.id == taskId);
        setData(task);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("tasks.store"), { onSuccess: () => reset() });
    };

    const updateStatus = (e, taskId) => {
        e.preventDefault();
        router.post(route('tasks.update-status', taskId), {
            status: e.target.checked ? 1 : 0,
        }, {
            preserveScroll: true,
            preserveState: true,
            // onSuccess: (page) => {
            //     console.log('Updated successfully');
            // },
            // onError: (errors) => {
            //     console.error(errors);
            // },
        });
    };
    const filter = (e) => {
        const value = e.target.value;

        // If a date is selected, filter by it
        if (value) {
            router.get(route('tasks.index'), { date: value }, {
            preserveState: true,
            preserveScroll: true,
            });
        } else {
            // If cleared, remove the filter (no query params)
            router.get(route('tasks.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            });
        }
    };
    // const updateStatus = async (e, taskId) => {
    //     e.preventDefault();

    //     try {
    //         const res = await axios.post(route('tasks.update-status', taskId), {
    //             status: e.target.checked ? 1 : 0,
    //         });
    //         console.log(res.data.message); // "Updated"
    //     } catch (err) {
    //         console.error(err.response?.data || err.message);
    //     }
    // };
    const formatTime = (time) => {
        if (!time) return '';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tasks" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-4 sm:p-4 md:p-6 rounded-md border border-gray-50 shadow-md">
                    <div className="flex justify-between">
                        <TextInput type="date" name="date" className="" onChange={(e)=>{filter(e)}}/>
                        <button type="button"  className="inline-flex items-center px-2 py-1 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150" onChange={(e)=>{addTask(e)}}>Add Task</button>
                    </div>
                    {/* <div>
                        <form onSubmit={submit} className="bg-white p-4 sm:p-4 md:p-6 rounded-md border border-gray-50 shadow-md">
                            <div>
                                <div className="text-xl font-semibold">
                                    Add Task <i className="fa fa-plus"></i>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <InputLabel htmlFor="date" value="Date" />

                                    <TextInput
                                        id="date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.date}
                                        onChange={(e) =>
                                            setData("date", e.target.value)
                                        }
                                        required
                                        isFocused
                                        autoComplete="date"
                                        placeholder="Date"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.date}
                                    />
                                </div>
                                <div className="">
                                    <InputLabel htmlFor="priority" value="Priority" />
                                    <select
                                        value={data.priority}
                                        onChange={(e) =>
                                            setData("priority", e.target.value)
                                        }
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                    >
                                        <option value={1}>Regular</option>
                                        <option value={2}>Moderate</option>
                                        <option value={3}>Urgent</option>
                                    </select>

                                    <InputError className="mt-2"
                                        message={errors.priority}
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
                                    placeholder="Details about tasks"
                                    className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                    onChange={(e) => setData("details", e.target.value)}
                                ></textarea>
                                <InputError message={errors.details} className="mt-2" />
                            </div>
                        
                            <div className="grid justify-items-start mt-4">
                                <PrimaryButton className="mt-4" disabled={processing}>
                                    Submit
                                </PrimaryButton>
                            </div>
                        </form>
                    </div> */}
                    <table className="table-auto w-full mt-2 text-sm">
                        <thead>
                            <tr>
                                <th className="border border-slate-300">Date & Time</th>
                                <th className="border border-slate-300">Details</th>
                                {/* <th className="border border-slate-300">Priority</th> */}
                                <th className="border border-slate-300">Status</th>
                                {/* <th className="border border-slate-300">Remarks</th> */}
                                {/* <th className="border border-slate-300">Action</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length > 0 && tasks.map((task, index) => (
                                <tr key={index} >
                                    <td className="text-center border border-slate-300">
                                        {task.date} - {formatTime(task.time)}
                                    </td>
                                    <td onClick={() => editTask(task.id)} className="cursor-pointer text-left border border-slate-300">
                                        {task.details}{" "}
                                        <span className="bg-green-100 rounded px-1">{task.priority == 3 ? "Urgent" : task.priority == 2 ? "Moderate" : "Regular"}</span>
                                    </td>
                                    {/* <td className="text-center border border-slate-300">
                                        
                                    </td> */}
                                    <td className="text-center border border-slate-300">
                                        {/* <TextInput
                                            id="date"
                                            type="checkbox"
                                            className="mt-1 block rounded-sm text-green-600"
                                            checked={task.status == 1 ? true : false}
                                            onChange={(e) =>
                                                updateStatus(e, task.id)
                                            }
                                            required
                                        /> */}
                                        {task.status == 0
                                            ? (
                                                <TextInput
                                                    id="date"
                                                    type="checkbox"
                                                    className="mt-1 block rounded-sm text-green-600"
                                                    checked={task.status == 1 ? true : false}
                                                    onChange={(e) =>
                                                        updateStatus(e, task.id)
                                                    }
                                                    required
                                                    isFocused
                                                />
                                            )
                                            : "✅"}
                                    </td>
                                    {/* <td className="text-center border border-slate-300">
                                        {task.remarks}
                                    </td> */}
                                    {/* <td className="text-center border border-slate-300">
                                        <button onClick={() => editTask(task.id)} className="inline-flex items-center px-2 py-1 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">Edit</button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div >
                    <form onSubmit={submit} className="bg-white p-4 sm:p-4 md:p-6 rounded-md border border-gray-50 shadow-md">
                        <div>
                            <div className="text-xl font-semibold">
                                Add Task <i className="fa fa-plus"></i>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            <div>
                                <InputLabel htmlFor="date" value="Date" />

                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.date ?? now()}
                                    onChange={(e) =>
                                        setData("date", e.target.value)
                                    }
                                    required
                                    isFocused
                                    autoComplete="date"
                                    placeholder="Date"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.date}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="time" value="Time" />

                                <TextInput
                                    id="time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.time ?? new Date().toISOString().split('T')[0]}
                                    onChange={(e) =>
                                        setData("time", e.target.value)
                                    }
                                    required
                                    isFocused
                                    autoComplete="time"
                                    placeholder="Time"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.time}
                                />
                            </div>
                            <div className="">
                                <InputLabel htmlFor="priority" value="Priority" />
                                <select
                                    value={data.priority}
                                    onChange={(e) =>
                                        setData("priority", e.target.value)
                                    }
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                >
                                    <option value={1}>Regular</option>
                                    <option value={2}>Moderate</option>
                                    <option value={3}>Urgent</option>
                                </select>

                                <InputError className="mt-2"
                                    message={errors.priority}
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
                                placeholder="Details about tasks"
                                className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                onChange={(e) => setData("details", e.target.value)}
                            ></textarea>
                            <InputError message={errors.details} className="mt-2" />
                        </div>
                       
                        <div className="flex gap-2 justify-items-start mt-4">
                            <PrimaryButton type="button" className="mt-4" onClick={(e) => { reset() }}>
                                Clear
                            </PrimaryButton>
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
