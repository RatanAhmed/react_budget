import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { X, Filter } from "lucide-react";

export default function TaskCategory({ closeCategoryModal }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        id: "",
        name: "",
        status: 1,
    });
    const submit = (e) => {
        e.preventDefault();
        post(route("task-categories.store"), {
            onSuccess: () => {
                reset(), setModal(false);
            },
        });
    };
    return (
        <form onSubmit={submit} className="p-4 sm:p-6">
            <div className="flex justify-between">
                <div className="text-xl font-semibold">
                    Create Task Category
                </div>
                <DangerButton className="px-2" onClick={closeCategoryModal}>
                    <X size={20} />
                </DangerButton>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-4">
                <div className="">
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                        placeholder="Category Name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>
                <div className="">
                    <InputLabel htmlFor="priority" value="Priority" />
                    <select
                        value={data.priority}
                        onChange={(e) => setData("status", e.target.value)}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                    >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>

                    <InputError className="mt-2" message={errors.status} />
                </div>
            </div>

            <div className="flex gap-2 justify-between mt-4">
                <div>
                    <DangerButton onClick={closeCategoryModal}>
                        Close{" "}
                    </DangerButton>
                </div>
                <div className="flex gap-2 justify-between">
                    <SecondaryButton
                        type="button"
                        onClick={(e) => {
                            reset();
                        }}
                    >
                        Clear
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>Submit</PrimaryButton>
                </div>
            </div>
        </form>
    );
}
