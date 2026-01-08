import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput'; 
import InputLabel from '@/Components/InputLabel';
import Dropdown from '@/Components/Dropdown';
import { CirclePlus, TrashIcon, X } from 'lucide-react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ExpenseFilter from './ExpenseFilter';

export default function Index({ auth, expenses, incomes, budgets, categories }) {
    const date =  new Date();
    const today = date.toISOString().split('T')[0];
    const { data, setData, post, processing, reset, errors } = useForm({
        id: "",
        date: date.toISOString().split('T')[0],
        amount: '',
        details: '',
        budget_id: '',
        income_id: '',
        category_id: '',
        month: date.getMonth() +1,
        year: date.getFullYear(),
    });

    const total = (expenses ?? []).reduce((sum, exp) => sum + Number(exp.amount), 0);

    const editItem = (expenseId) => {
        const expense = expenses.find((expense) => expense.id == expenseId);
        setData(expense);
        setModal(true);
    };

    const deleteItem = (id) => {
            Swal.fire({
                title: 'Are you sure?',
                text: 'This record will be permanently deleted.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33',
            }).then((result) => {
                if (result.isConfirmed) {
                    destroy(route('expense.destroy', id), {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                position: "top-end",
                                icon: 'success',
                                title: 'Deleted',
                                text: html(`<small>The record has been deleted successfully.</small>`),
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        },
                    });
                }
            });
        };
 
    const submit = (e) => {
        e.preventDefault();
        post(route('expense.store'), { onSuccess: () => {reset(), setModal(false)} });
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
            <Head title="Expense" />
            <div className="sm:p-4 lg:p-6">
                <div className="bg-white rounded-md border border-gray-50 shadow-md">
                    <div className="bg-green-50 p-2 flex justify-between gap-2  rounded-t-md">
                        <div className="text-xl font-semibold px-2 p-1">
                            Expense List
                        </div>
                        <div>
                            <PrimaryButton type="button" onClick={openModal} >
                                Expense {" "} <CirclePlus  size={20} />
                            </PrimaryButton>
                        </div>
                    </div>
                    <div className="p-2 sm:p-4 lg:p-6">
                        <div className="flex justify-between gap-2">
                            <div>
                                Total Expenses: {total}
                                <ExpenseFilter categories={categories} today = {today} incomes={incomes} budgets={budgets}/>
                            </div>
                            {/* <div>
                                <PrimaryButton type="button" onClick={openCategoryModal} > Category {"  "} <CirclePlus  size={20} /> </PrimaryButton>
                            </div> */}
                            
                        </div>
                        <div>
                            <table className="table-auto w-full text-sm">
                                <thead>
                                    <tr>
                                        {/* <th className="border border-slate-300">Id</th> */}
                                        <th className="border border-slate-300">Date</th>
                                        <th className="border border-slate-300 text-start">
                                            <span className="bg-green-50 p-1 rounded">Category</span>{" "} 
                                            <span className="bg-white p-1 rounded">Details</span>{" "} 
                                            <span className="bg-gray-200 p-1 rounded">Source</span>{" "}
                                            <span className="bg-orange-100 p-1 rounded">Budget</span> 
                                        </th>
                                        <th className="border border-slate-300">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length > 0 && expenses.map((expense, index) => (
                                        <tr key={index} >
                                            <td className="text-center border border-slate-300">
                                                {expense.date} 
                                            </td>
                                            <td onClick={() => editItem(expense.id)} className="cursor-pointer text-left border border-slate-300">
                                                <span className="bg-green-50 p-1 rounded">{expense?.category?.name}</span>
                                                {" "}{expense.details}{" "}
                                                <span className="bg-gray-200  p-1 rounded">{expense?.budget?.title}</span>{" "}
                                                <span className="bg-orange-100 p-1 rounded">{expense?.income?.details}</span>
                                            </td>
                                            <td className="text-center border border-slate-300">{expense?.amount}</td>
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Modal show={modal} onClose={closeModal}>
                    <form onSubmit={submit} className="p-4 sm:p-6">
                        <div className="flex justify-between">
                            <div className="text-xl font-semibold">
                                Add Expenses
                            </div>
                            <DangerButton className="px-2" onClick={closeModal}><X size={20} /></DangerButton>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="date" value="Date" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data?.date || ''}
                                    onChange={(e) => setData('date', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="date"
                                    placeholder="date of expense"
                                />
                                <InputError className="mt-2" message={errors.date} />
                            </div>
                            <div>
                                <InputLabel htmlFor="amount" value="Amount" />

                                <TextInput
                                    id="amount"
                                    income_id="number"
                                    min="0"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data?.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="amount"
                                    placeholder="amount of expense"
                                />
                                <InputError className="mt-2" message={errors.amount} />
                            </div>
                        </div>

                        <div className="mt-2">
                            <InputLabel className="" htmlFor="details" value="Details" />
                            <textarea
                                value={data.details}
                                placeholder="details about expense"
                                className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                onChange={e => setData('details', e.target.value)}
                            ></textarea>
                            <InputError message={errors.details} className="mt-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="">
                                <InputLabel htmlFor="budget_id" value="Budget Type" />
                                <select
                                value={data.budget_id?? null}
                                required
                                onChange={(e) => setData('budget_id', e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                    <option value="0" >Select</option>
                                    {budgets && budgets.map((budget) => (
                                        <option key={budget.id} value={budget.id}>{budget.title}</option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.budget_id} />
                            </div>
                            
                            <div className="">
                                <InputLabel htmlFor="income_id" value="Income Type" />
                                <select  value={data.income_id?? null}
                                onChange={(e) => setData('income_id', e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                    <option value="0" >Select</option>
                                    {incomes.map((income) => (
                                        <option key={income.id} value={income.id}>{income.details}</option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.income_id} />
                            </div>
                            <div className="">
                                <InputLabel htmlFor="category_id" value="Category" />
                                <select  value={data.category_id?? null}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                    <option value="0" >Select</option>
                                    {categories && categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.category_id} />
                            </div>
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