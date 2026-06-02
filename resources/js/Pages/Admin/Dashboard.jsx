import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value, sub, colorClass, icon }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4`}>
            <div className={`p-3 rounded-lg ${colorClass} shrink-0`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminDashboard({ stats, subscriptionsByPlan, recentUsers }) {
    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800">Admin Dashboard</h2>}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">

                {/* ── Stats ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        label="Total Users"
                        value={stats.totalUsers}
                        sub={`+${stats.newUsersThisMonth} this month`}
                        colorClass="bg-blue-50 text-blue-500"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Active Subscriptions"
                        value={stats.activeSubscriptions}
                        colorClass="bg-green-50 text-green-500"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Revenue This Month"
                        value={`৳ ${fmt(stats.revenueThisMonth)}`}
                        colorClass="bg-indigo-50 text-indigo-500"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Revenue"
                        value={`৳ ${fmt(stats.revenueTotal)}`}
                        colorClass="bg-amber-50 text-amber-500"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── Subscriptions by Plan ─────────────────────────── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Subscriptions by Plan</h3>
                            <Link href={route('admin.plans.index')} className="text-xs text-indigo-600 hover:underline">Manage Plans</Link>
                        </div>
                        <div className="space-y-3">
                            {subscriptionsByPlan.map((plan) => (
                                <div key={plan.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{plan.name}</p>
                                        <p className="text-xs text-gray-400">৳ {fmt(plan.price)} / {plan.billing_cycle}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                        {plan.active_count} active
                                    </span>
                                </div>
                            ))}
                            {subscriptionsByPlan.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No plans yet.</p>
                            )}
                        </div>
                    </div>

                    {/* ── Recent Users ──────────────────────────────────── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Recent Users</h3>
                            <Link href={route('admin.users.index')} className="text-xs text-indigo-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {recentUsers.map((user) => {
                                const sub = user.subscriptions?.[0];
                                return (
                                    <div key={user.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        {sub ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                                                {sub.plan?.name ?? 'Plan'}
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium shrink-0">
                                                No plan
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
