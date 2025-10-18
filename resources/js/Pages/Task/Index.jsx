import React, { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, Head, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import Dropdown from "@/Components/Dropdown";
import axios from "axios";
import Modal from '@/Components/Modal';
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import { CirclePlus, Filter, Trash, X } from "lucide-react";
import TaskFilter from "./TaskFilter";
import TaskCategory from "./TaskCategory";

export default function Index({ auth, tasks, categories }) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const { data, setData, post, processing, reset, errors } = useForm({
        id: "",
        date: today,
        time: now,
        details: "",
        priority: 1,
        status: 0,
        remarks: "",
    });
   
    const editTask = (taskId) => {
        const task = tasks.find((task) => task.id == taskId);
        setData(task);
        setModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("tasks.store"), { onSuccess: () => {reset(), setModal(false)} });
    };

    const updateStatus = (e, taskId, status) => {
        e.preventDefault();
        router.post(route('tasks.update-status', taskId), {
            status: status, //e.target.checked ? 1 : 0,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };
   
    const formatTime = (time) => {
        if (!time) return '';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };
    
    const [modal, setModal] = useState(false);
    const openModal = () => {
        setModal(true);
    };
    const closeModal = () => {
        setModal(false);
        reset();
    };

    const [categoryModal, setCategoryModal] = useState(false);
    const openCategoryModal = () => {
        setCategoryModal(true);
    };
    const closeCategoryModal = () => {
        setCategoryModal(false);
    };
 
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tasks" />

            <div className="sm:p-4 lg:p-6">
                <div className="bg-white rounded-md border border-gray-50 shadow-md">
                    <div className="bg-green-50 p-2 flex justify-between gap-2  rounded-t-md">
                        <div className="text-xl font-semibold px-2 p-1">
                            Task List
                        </div>
                        <div>
                            <PrimaryButton type="button" onClick={openModal} >
                                <CirclePlus  size={20} />
                            </PrimaryButton>
                        </div>
                    </div>
          
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="flex justify-between gap-2">
                            <div>
                                <TaskFilter categories={categories}/>
                            </div>
                            <div>
                                <PrimaryButton type="button" onClick={openCategoryModal} >
                                    Category {"  "} <CirclePlus  size={20} />
                                </PrimaryButton>
                            </div>
                        </div>
                        <div>
                            <table className="table-auto w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="border border-slate-300">Date</th>
                                        <th className="border border-slate-300">Details</th>
                                        <th className="border border-slate-300">Category</th>
                                        <th className="border border-slate-300">Status</th>
                                        {/* <th className="border border-slate-300">Remarks</th> */}
                                        {/* <th className="border border-slate-300">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.length > 0 && tasks.map((task, index) => (
                                        <tr key={index} >
                                            <td className="text-center border border-slate-300">
                                                {task.date} 
                                            </td>
                                            <td onClick={() => editTask(task.id)} className="cursor-pointer text-left border border-slate-300">
                                                <span className="bg-green-50 p-1 rounded">{formatTime(task.time)}</span>
                                                {" "}{task.details}{" "}
                                                <span className="bg-green-100 rounded px-1">{task.priority == 3 ? "Urgent" : task.priority == 2 ? "Moderate" : "Regular"}</span>
                                            </td>
                                            <td className="text-center border border-slate-300">{task?.category?.name}</td>
                                            <td className="text-center border border-slate-300">
                                                {task.status == 1 ? "✅" : task.status == 3 ? <X size={16} className="text-red-600 bg-red-100 rounded"/>
                                                    : (
                                                        <div className="flex justify-between gap-3 sm:gap-6">
                                                            <TextInput id="date" type="checkbox" className="block rounded-sm text-green-600"
                                                                checked={task.status == 1 ? true : false}
                                                                onChange={(e) =>
                                                                    updateStatus(e, task.id, 1)
                                                                }
                                                            />
                                                            <button onClick={(e) => updateStatus(e, task.id, 3)} className="text-red-600 bg-red-50"><X size={16} /></button>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Modal maxWidth={'md'} show={categoryModal} onClose={closeCategoryModal}>
                    <TaskCategory closeCategoryModal={closeCategoryModal} />
                </Modal>
                <Modal show={modal} onClose={closeModal}>
                    <form onSubmit={submit} className="p-4 sm:p-6">
                        <div className="flex justify-between">
                            <div className="text-xl font-semibold">
                                Add Task
                            </div>
                            <DangerButton className="px-2" onClick={closeModal}><X size={20} /></DangerButton>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
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
                            <div>
                                <InputLabel htmlFor="time" value="Time" />

                                <TextInput
                                    id="time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data?.time}
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
                                <InputLabel htmlFor="task_categories_id" value="Category" />
                                <select
                                    value={data.task_categories_id}
                                    onChange={(e) =>
                                        setData("task_categories_id", e.target.value)
                                    }
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                >
                                    <option value="">--------</option>
                                    {categories?.length > 0 && categories.map((cat) => {
                                        return <option key={cat.id} value={cat?.id}>{cat?.name}</option>;
                                    })}
                                </select>

                                <InputError className="mt-2"
                                    message={errors.task_categories_id}
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
                            {data?.status != 0 && (
                            <div className="">
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                >
                                    <option value={0}>Pending</option>
                                    <option value={1}>Completed</option>
                                    <option value={2}>In Progress</option>
                                    <option value={3}>Cancelled</option>
                                </select>

                                <InputError className="mt-2"
                                    message={errors.status}
                                />
                            </div>
                            )}
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
                    
                        <div className="flex gap-2 justify-between mt-4">
                            <div>
                                <DangerButton onClick={closeModal}>Close </DangerButton>
                            </div>
                            <div className="flex gap-2 justify-between">
                                <SecondaryButton type="button" onClick={(e) => { reset() }}>
                                    Clear
                                </SecondaryButton>
                                <PrimaryButton disabled={processing}>
                                    Submit
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
