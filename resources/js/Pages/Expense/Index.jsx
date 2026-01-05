import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput'; 
import InputLabel from '@/Components/InputLabel';
import Dropdown from '@/Components/Dropdown';

export default function Index({ auth, expenses, incomes, budgets }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        details: '',
        budget_id: '',
        income_id: '',
        month: '',
        year: '',
    });
 
    const submit = (e) => {
        e.preventDefault();
        post(route('expense.store'), { onSuccess: () => reset() });
    };

    // const children = {}
 
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Expense" />
            
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <table className="table-auto">
                        <tbody>
                            {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td className='text-center'>{ expense.id }</td>
                                <td className='text-center'>{ expense.date }</td>
                                <td className='text-center'>{ expense.details }</td>
                                <td className='text-center'>{ expense.amount }</td>
                                <td className='text-center'>{ expense.budget_id }</td>
                                <td className='text-center'>{ expense.income_id }</td>
                            </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <form onSubmit={submit}>
                            <div>
                                <div className="text-xl font-semibold">Expenses Details</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
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
                                    required
                                    onChange={(e) => setData('budget_id', e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                        <option value="0">Select</option>
                                        {budgets && budgets.map((budget) => (
                                            <option key={budget.id} value="{income.value}">{budget.title}</option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.budget_id} />
                                </div>
                                
                                <div className="">
                                    {JSON.stringify(incomes, null, 2)}
                                    <InputLabel htmlFor="income_id" value="Income Type" />
                                    <select 
                                    onChange={(e) => setData('income_id', e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                        <option value="0">Select</option>
                                        {incomes.map((income) => (
                                            <option key={income.id} value="">{income.source}</option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.income_id} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                
                                <div>
                                    <InputLabel htmlFor="month" value="Month" />

                                    <TextInput
                                        id="month"
                                        income_id="number"
                                        min="1" max="12"
                                        className="mt-1 block w-full"
                                        value={data.month}
                                        onChange={(e) => setData('month', e.target.value)}
                                        isFocused
                                        autoComplete="month"
                                        placeholder="month of expense"
                                    />
                                    <InputError className="mt-2" message={errors.month} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="year" value="Year" />

                                    <TextInput
                                        id="year"
                                        income_id="number"
                                        min="2024" max="2030"
                                        className="mt-1 block w-full"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        isFocused
                                        autoComplete="year"
                                        placeholder="year of expense"
                                    />
                                    <InputError className="mt-2" message={errors.year} />
                                </div> 
                            </div>
                            <div className="grid justify-items-end mt-4">
                                <PrimaryButton className="mt-4" disabled={processing}>Submit</PrimaryButton>
                            </div>
                            
                        </form>    
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}