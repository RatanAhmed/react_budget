import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { CirclePlus, Plus, Trash2, X, Wallet, Building2, PiggyBank, CreditCard } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
    Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ACCOUNT_TYPES = [
    { value: 'cash',       label: 'Cash',       Icon: Wallet },
    { value: 'bank',       label: 'Bank',       Icon: Building2 },
    { value: 'savings',    label: 'Savings',    Icon: PiggyBank },
    { value: 'credit',     label: 'Credit',     Icon: CreditCard },
    { value: 'investment', label: 'Investment', Icon: PiggyBank },
];

const TYPE_COLORS = {
    cash:       'bg-green-100 text-green-700',
    bank:       'bg-blue-100 text-blue-700',
    savings:    'bg-purple-100 text-purple-700',
    credit:     'bg-red-100 text-red-700',
    investment: 'bg-yellow-100 text-yellow-700',
};

const COLOR_OPTIONS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

const selectCls = 'block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm';

const blankAccount = () => ({
    name: '', type: 'cash', currency: 'BDT', opening_balance: '0', color: '#6366f1',
});

// ── Account card ──────────────────────────────────────────────────────────────

function AccountCard({ account, onEdit, onDelete }) {
    const TypeInfo = ACCOUNT_TYPES.find(t => t.value === account.type);
    const Icon = TypeInfo?.Icon ?? Wallet;

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
            style={{ borderTopColor: account.color ?? '#6366f1', borderTopWidth: 3 }}
            onClick={() => onEdit(account)}
        >
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: (account.color ?? '#6366f1') + '20' }}>
                            <Icon size={16} style={{ color: account.color ?? '#6366f1' }} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{account.name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[account.type] ?? 'bg-gray-100 text-gray-600'}`}>
                                {TypeInfo?.label ?? account.type}
                            </span>
                        </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); onDelete(account); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" aria-label="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-gray-400">Current Balance</p>
                    <p className={`text-2xl font-bold tabular-nums ${account.balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {account.currency} {fmt(account.balance)}
                    </p>
                    {account.opening_balance !== 0 && (
                        <p className="text-xs text-gray-400">Opening: {account.currency} {fmt(account.opening_balance)}</p>
                    )}
                </div>

                {account.is_default && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium border border-indigo-100">
                        Default
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Edit modal (single account) ───────────────────────────────────────────────

function EditAccountModal({ show, onClose, account }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id:              account?.id              ?? '',
        name:            account?.name            ?? '',
        type:            account?.type            ?? 'cash',
        currency:        account?.currency        ?? 'BDT',
        opening_balance: account?.opening_balance ?? '0',
        is_default:      account?.is_default      ?? false,
        color:           account?.color           ?? '#6366f1',
        status:          account?.status          ?? true,
    });

    function submit(e) {
        e.preventDefault();
        post(route('accounts.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Edit Account</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <InputLabel value="Account Name *" />
                        <TextInput className="mt-1 block w-full" value={data.name}
                            onChange={e => setData('name', e.target.value)} required />
                        <InputError className="mt-1" message={errors.name} />
                    </div>
                    <div>
                        <InputLabel value="Type *" />
                        <select value={data.type} onChange={e => setData('type', e.target.value)} className={`mt-1 ${selectCls}`}>
                            {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Currency" />
                        <TextInput className="mt-1 block w-full" value={data.currency}
                            onChange={e => setData('currency', e.target.value)} maxLength={10} />
                    </div>
                    <div>
                        <InputLabel value="Opening Balance" />
                        <TextInput type="number" step="0.01" className="mt-1 block w-full"
                            value={data.opening_balance} onChange={e => setData('opening_balance', e.target.value)} />
                    </div>
                    <div>
                        <InputLabel value="Status" />
                        <select value={data.status ? '1' : '0'}
                            onChange={e => setData('status', e.target.value === '1')}
                            className={`mt-1 ${selectCls}`}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                </div>

                <div>
                    <InputLabel value="Color" />
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map(c => (
                            <button key={c} type="button" onClick={() => setData('color', c)}
                                className={`w-7 h-7 rounded-full transition ring-offset-1 ${data.color === c ? 'ring-2 ring-gray-700 scale-110' : 'ring-1 ring-gray-200 hover:scale-105'}`}
                                style={{ backgroundColor: c }} aria-label={c} />
                        ))}
                    </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={data.is_default}
                        onChange={e => setData('is_default', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">Set as default account</span>
                </label>

                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Update'}</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Bulk create modal (multiple accounts) ─────────────────────────────────────

function CreateAccountsModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        accounts:         [blankAccount()],
        is_default_index: 0,
    });

    const setRow = (i, field, val) =>
        setData('accounts', data.accounts.map((a, idx) => idx === i ? { ...a, [field]: val } : a));

    const addRow = () =>
        setData('accounts', [...data.accounts, blankAccount()]);

    const removeRow = (i) => {
        if (data.accounts.length === 1) return;
        const next = data.accounts.filter((_, idx) => idx !== i);
        setData(d => ({
            ...d,
            accounts: next,
            is_default_index: d.is_default_index >= next.length
                ? next.length - 1
                : d.is_default_index,
        }));
    };

    function submit(e) {
        e.preventDefault();
        post(route('accounts.store.bulk'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-3">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Add Accounts</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                {/* One card per account row */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {data.accounts.map((acc, i) => {
                        const TypeInfo = ACCOUNT_TYPES.find(t => t.value === acc.type);
                        const Icon = TypeInfo?.Icon ?? Wallet;
                        const isDefault = data.is_default_index === i;

                        return (
                            <div key={i}
                                className={`rounded-xl border p-4 space-y-3 transition ${
                                    isDefault
                                        ? 'border-indigo-300 bg-indigo-50/40'
                                        : 'border-gray-200 bg-white'
                                }`}
                                style={{ borderLeftColor: acc.color, borderLeftWidth: 4 }}
                            >
                                {/* Row header: preview icon + default toggle + remove */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: acc.color + '25' }}>
                                            <Icon size={14} style={{ color: acc.color }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {acc.name || `Account ${i + 1}`}
                                        </span>
                                        {isDefault && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!isDefault && (
                                            <button type="button"
                                                onClick={() => setData('is_default_index', i)}
                                                className="text-xs text-gray-400 hover:text-indigo-600 transition">
                                                Set default
                                            </button>
                                        )}
                                        <button type="button" onClick={() => removeRow(i)}
                                            disabled={data.accounts.length === 1}
                                            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <InputLabel value="Account Name *" />
                                        <TextInput className="mt-1 block w-full" value={acc.name}
                                            onChange={e => setRow(i, 'name', e.target.value)}
                                            placeholder="e.g. HDFC Savings" required />
                                        <InputError message={errors[`accounts.${i}.name`]} />
                                    </div>
                                    <div>
                                        <InputLabel value="Type" />
                                        <select value={acc.type}
                                            onChange={e => setRow(i, 'type', e.target.value)}
                                            className={`mt-1 ${selectCls}`}>
                                            {ACCOUNT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Currency" />
                                        <TextInput className="mt-1 block w-full" value={acc.currency}
                                            onChange={e => setRow(i, 'currency', e.target.value)}
                                            placeholder="BDT" maxLength={10} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-2">
                                        <InputLabel value="Opening Balance" />
                                        <TextInput type="number" step="0.01" className="mt-1 block w-full"
                                            value={acc.opening_balance}
                                            onChange={e => setRow(i, 'opening_balance', e.target.value)}
                                            placeholder="0.00" />
                                    </div>
                                    <div className="col-span-2">
                                        <InputLabel value="Color" />
                                        <div className="mt-1.5 flex flex-wrap gap-2">
                                            {COLOR_OPTIONS.map(c => (
                                                <button key={c} type="button"
                                                    onClick={() => setRow(i, 'color', c)}
                                                    title={c}
                                                    className={`w-6 h-6 rounded-full transition ring-offset-1 ${
                                                        acc.color === c
                                                            ? 'ring-2 ring-gray-600 scale-110'
                                                            : 'ring-1 ring-gray-200 hover:scale-105'
                                                    }`}
                                                    style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add row */}
                <button type="button" onClick={addRow}
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                    <Plus size={15} /> Add another account
                </button>

                {/* Footer */}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <PrimaryButton disabled={processing}>
                        {processing
                            ? 'Creating…'
                            : `Create Account${data.accounts.length > 1 ? `s (${data.accounts.length})` : ''}`}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountsIndex({ auth, accounts }) {
    const { flash } = usePage().props;
    const [createModal, setCreateModal] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [confirmDelete, setConfirm]   = useState(null);

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(route('accounts.destroy', confirmDelete.id), {
            preserveScroll: true,
            onSuccess: () => setConfirm(null),
        });
    }

    const totalBalance = (accounts ?? []).reduce((s, a) => s + a.balance, 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Accounts" />

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Accounts</h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Net worth: <span className="font-semibold text-indigo-700">{fmt(totalBalance)}</span>
                            </p>
                        </div>
                        <PrimaryButton type="button" onClick={() => setCreateModal(true)}>
                            Add Account <CirclePlus size={16} className="ml-1" />
                        </PrimaryButton>
                    </div>

                    <div className="p-4 sm:p-6">
                        {flash?.success && <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">{flash.success}</div>}
                        {flash?.error   && <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{flash.error}</div>}

                        {!accounts?.length ? (
                            <div className="text-center py-16">
                                <p className="text-4xl mb-3">🏦</p>
                                <p className="text-gray-500 font-medium">No accounts yet.</p>
                                <p className="text-gray-400 text-sm mt-1">Create your first account to start tracking transactions.</p>
                                <button onClick={() => setCreateModal(true)} className="mt-4 text-sm text-indigo-600 hover:underline">Add an account →</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {accounts.map(a => (
                                    <AccountCard key={a.id} account={a}
                                        onEdit={setEditAccount}
                                        onDelete={setConfirm} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk create modal */}
            <CreateAccountsModal
                key={createModal ? 'open' : 'closed'}
                show={createModal}
                onClose={() => setCreateModal(false)}
            />

            {/* Single edit modal */}
            {editAccount && (
                <EditAccountModal
                    key={editAccount.id}
                    show={Boolean(editAccount)}
                    onClose={() => setEditAccount(null)}
                    account={editAccount}
                />
            )}

            {/* Delete confirm */}
            <Modal show={Boolean(confirmDelete)} onClose={() => setConfirm(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">Delete Account</h2>
                        <button type="button" onClick={() => setConfirm(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Delete <span className="font-medium">{confirmDelete?.name}</span>?
                        This only works if the account has no transactions.
                    </p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button type="button" onClick={() => setConfirm(null)}
                            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <DangerButton onClick={handleDelete}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
