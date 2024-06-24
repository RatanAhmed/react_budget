import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput'; 
import InputLabel from '@/Components/InputLabel';
import Dropdown from '@/Components/Dropdown';

export default function Index({ auth, categories}) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        type: '',
        status: '',
    });
 
    const submit = (e) => {
        e.preventDefault();
        post(route('category.store'), { onSuccess: () => reset() });
    };

    const getData = (e) => {
        e.preventDefault();
        alert(e.target.value);
        data = get(route('category.edit'));
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Category" />
            
            <div className="max-w-6xl mx-auto mt-8 p-4 sm:p-6 lg:p-8 border border-gray-300  bg-white shadow sm:rounded-lg">
                <div className="grid grid-cols-2 gap-8">
                    <div className='gap-4'>
                        <table className="table-auto border-collapse " width="100%">
                        <thead>
                            <tr>
                                <th className='border border-slate-300'>Name</th>
                                <th className='border border-slate-300'>Type</th>
                                <th className='border border-slate-300'>Status</th>
                                <th className='border border-slate-300'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                            <tr key={index}>
                                <td className='ps-2 text-left border border-slate-300'>{ category.name }</td>
                                <td className='text-center border border-slate-300'>{ category.type == 1 ? "Income" : "Expenses" }</td>
                                <td className='text-center border border-slate-300'>{ category.status == 1 ? "Active" : "Inactive" }</td>
                                <td className='text-center border border-slate-300'>
                                    <Dropdown className="">
                                            <button className="block w-full  px-4 py-2 text-center text-sm leading-5 bg-green-600 text-gray-100 hover:bg-gray-700 focus:bg-gray-100 transition duration-150 ease-in-out" onClick={ getData }>
                                                Edit
                                            </button>
                                            <Dropdown.Link className='text-center bg-red-600 text-white hover:bg-gray-700 ' as="button" href={route('category.destroy', category.id)} method="delete">
                                                Delete
                                            </Dropdown.Link>
                                    </Dropdown>
                                </td>
                            </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className=''>
                        <form onSubmit={submit}>
                            <div className="text-xl font-semibold">Add Category</div>

                            <div className="mt-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        isFocused
                                        autoComplete="name"
                                        placeholder="Category Name"
                                    />
                                    <InputError className="mt-2" message={errors.amount} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="">
                                    <InputLabel htmlFor="type" value="Type" />
                                    <select 
                                    required
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                        <option value="">Select</option>
                                        <option value="1">Income</option>
                                        <option value="0">Expense</option>
                                    </select>
                                    <InputError className="mt-2" message={errors.type} />
                                </div>
                                <div className="">
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                    required
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                                        <option value="">Select</option>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                    <InputError className="mt-2" message={errors.status} />
                                </div>
                            </div>
                            <div className="grid justify-items-start mt-2">
                                <PrimaryButton className="mt-2" disabled={processing}>Submit</PrimaryButton>
                            </div>
                        </form>    
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}