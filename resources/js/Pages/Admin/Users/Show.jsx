import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">{title}</h3>
            {children}
        </div>
    );
}

export default function UserShow({ user, plans }) {
    const roleForm = useForm({ role: user.role });
    const subForm  = useForm({ plan_id: '', ends_at: '' });

    function submitRole(e) {
        e.preventDefault();
        roleForm.patch(route('admin.users.update-role', user.id), { preserveScroll: true });
    }

    function submitSubscription(e) {
        e.preventDefault();
        subForm.post(route('admin.users.grant-subscription', user.id), {
            preserveScroll: true,
            onSuccess: () => subForm.reset(),
        });
    }

    function cancelSub(subId) {
        if (confirm('Cancel this subscription?')) {
            router.delete(route('admin.subscriptions.cancel', subId), { preserveScroll: true });
        }
    }

    const activeSub = user.subscriptions?.find(s => s.status === 'active' || s.status === 'trial');

    return (
        <AdminLayout header={
            <div className="flex items-center gap-2">
                <Link href={route('admin.users.index')} className="text-gray-400 hover:text-gray-600 text-sm">Users</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-medium text-sm">{user.name}</span>
            </div>
        }>
            <Head title={`Admin — ${user.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* User info */}
                <Section title="User Info">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Role form */}
                    <form onSubmit={submitRole} className="flex items-end gap-3 mt-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                            <select
                                value={roleForm.data.role}
                                onChange={e => roleForm.setData('role', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={roleForm.processing}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            Update Role
                        </button>
                    </form>
                    {roleForm.errors.role && <p className="text-xs text-red-500 mt-1">{roleForm.errors.role}</p>}
                </Section>

                {/* Grant subscription */}
                <Section title="Grant Subscription">
                    {activeSub && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Active: {activeSub.plan?.name}</p>
                                <p className="text-xs text-green-600">
                                    {activeSub.ends_at
                                        ? `Expires ${new Date(activeSub.ends_at).toLocaleDateString()}`
                                        : 'No expiry'}
                                </p>
                            </div>
                            <button
                                onClick={() => cancelSub(activeSub.id)}
                                className="text-xs text-red-600 hover:underline font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <form onSubmit={submitSubscription} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Plan</label>
                            <select
                                value={subForm.data.plan_id}
                                onChange={e => subForm.setData('plan_id', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">Select a plan…</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — ৳{p.price} / {p.billing_cycle}
                                    </option>
                                ))}
                            </select>
                            {subForm.errors.plan_id && <p className="text-xs text-red-500 mt-1">{subForm.errors.plan_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Expires At (optional)</label>
                            <input
                                type="date"
                                value={subForm.data.ends_at}
                                onChange={e => subForm.setData('ends_at', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={subForm.processing}
                            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                            Grant Subscription
                        </button>
                    </form>
                </Section>

                {/* Subscription history */}
                <Section title="Subscription History">
                    {user.subscriptions?.length > 0 ? (
                        <div className="space-y-2">
                            {user.subscriptions.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{sub.plan?.name ?? '—'}</p>
                                        <p className="text-xs text-gray-400">
                                            {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '—'}
                                            {' → '}
                                            {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : 'No expiry'}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        sub.status === 'active' ? 'bg-green-100 text-green-700' :
                                        sub.status === 'trial'  ? 'bg-blue-100 text-blue-700' :
                                        sub.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {sub.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No subscription history.</p>
                    )}
                </Section>
            </div>
        </AdminLayout>
    );
}
