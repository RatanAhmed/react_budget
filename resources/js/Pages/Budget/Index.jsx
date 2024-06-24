import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput'; 
import InputLabel from '@/Components/InputLabel';
import Dropdown from '@/Components/Dropdown';

export default function Index({ auth, budgets }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        amount: '',
        description: '',
        status: '',
        type: '',
        month: '',
        year: '',
    });
 
    const submit = (e) => {
        e.preventDefault();
        post(route('budget.store'), { onSuccess: () => reset() });
    };

    // const children = {}
 
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="budget" />
            
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <table className="table-auto">
                        <tbody key="tbody">
                            {budgets.map((key, budget) => (
                            <tr key={key}>
                                <td className='text-center'>{ budget.key }</td>
                                <td className='text-center'>{ budget.title }</td>
                                <td className='text-center'>{ budget.description }</td>
                                <td className='text-center'>{ budget.amount }</td>
                                <td className='text-center'>{ budget.status }</td>
                                <td className='text-center'>{ budget.type }</td>
                            </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <form onSubmit={submit}>
                            <div>
                                <div className="text-xl font-semibold">Budget description</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <InputLabel htmlFor="title" value="Title" />

                                    <TextInput
                                        id="title"
                                        className="mt-1 block w-full"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                        isFocused
                                        autoComplete="title"
                                        placeholder="title of budget"
                                    />
                                    <InputError className="mt-2" message={errors.title} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="amount" value="Amount" />

                                    <TextInput
                                        id="amount"
                                        type="number"
                                        min="0"
                                        className="mt-1 block w-full"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        required
                                        isFocused
                                        autoComplete="amount"
                                        placeholder="amount of budget"
                                    />
                                    <InputError className="mt-2" message={errors.amount} />
                                </div>
                            </div>

                            <div className="mt-2">
                                <InputLabel className="" htmlFor="description" value="Description" />
                                <textarea
                                    value={data.description}
                                    placeholder="description about budget"
                                    className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                    onChange={e => setData('description', e.target.value)}
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="">
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                    required
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                    <InputError className="mt-2" message={errors.status} />
                                </div>
                                
                                <div className="">
                                    <InputLabel htmlFor="type" value="Type" />
                                    <select 
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                        <option value="1">Once</option>
                                        <option value="2">Daily</option>
                                        <option value="3">Weekly</option>
                                        <option value="4">Monthly</option>
                                        <option value="5">Quarterly</option>
                                        <option value="6">Biannually</option>
                                        <option value="7">Annually</option>
                                        <option value="0">Others</option>
                                    </select>
                                    <InputError className="mt-2" message={errors.type} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                
                                <div>
                                    <InputLabel htmlFor="month" value="Month" />

                                    <TextInput
                                        id="month"
                                        type="number"
                                        min="1" max="12"
                                        className="mt-1 block w-full"
                                        value={data.month}
                                        onChange={(e) => setData('month', e.target.value)}
                                        isFocused
                                        autoComplete="month"
                                        placeholder="month of budget"
                                    />
                                    <InputError className="mt-2" message={errors.month} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="year" value="Year" />

                                    <TextInput
                                        id="year"
                                        type="number"
                                        min="2024" max="2030"
                                        className="mt-1 block w-full"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        isFocused
                                        autoComplete="year"
                                        placeholder="year of budget"
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