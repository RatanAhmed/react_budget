import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
    Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons = {
    transactions: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    income: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    expense: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    budget: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    task: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    resume: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    lend: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    borrow: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
    ),
    wallet: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M5 6V4a1 1 0 011-1h12a1 1 0 011 1v2M3 10v8a2 2 0 002 2h14a2 2 0 002-2v-8" />
        </svg>
    ),
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, colorClass, routeName, children }) {
    const content = (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow h-full">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorClass}`}>{icon}</div>
                <div className="text-right">
                    <p className="text-xl font-bold text-gray-800 tabular-nums">{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
            </div>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            {children}
        </div>
    );

    return routeName
        ? <Link href={route(routeName)} className="block h-full">{content}</Link>
        : content;
}

// ── Account balance pill ──────────────────────────────────────────────────────

function AccountBalances({ accounts }) {
    if (!accounts?.length) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accounts</h3>
                <Link href={route('accounts.index')} className="text-xs text-indigo-600 hover:underline">Manage</Link>
            </div>
            <div className="space-y-2">
                {accounts.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{a.type}</span>
                            <span className="text-sm text-gray-700">{a.name}</span>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${a.balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                            {fmt(a.balance)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard({ auth, stats, loans, accounts, filters }) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

    const [month, setMonth] = useState(filters?.month ?? new Date().getMonth() + 1);
    const [year, setYear]   = useState(filters?.year  ?? currentYear);

    function applyFilter(newMonth, newYear) {
        router.get(route('dashboard'), { month: newMonth, year: newYear }, {
            preserveState: true, replace: true,
        });
    }

    const {
        opening_balance, closing_balance,
        total_income, total_expense,
        budget_planned, tasks, resumes,
    } = stats ?? {};

    const monthNet = (total_income ?? 0) - (total_expense ?? 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="space-y-6">

                {/* ── Month / Year filter ──────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                    <span className="text-sm font-medium text-gray-500">Showing:</span>
                    <select value={month} onChange={e => { const m = Number(e.target.value); setMonth(m); applyFilter(m, year); }}
                        className="text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8">
                        {MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
                    </select>
                    <select value={year} onChange={e => { const y = Number(e.target.value); setYear(y); applyFilter(month, y); }}
                        className="text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <span className="text-xs text-gray-400 ml-auto">{MONTHS[month - 1]} {year}</span>
                </div>

                {/* ── Balance summary strip ────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Opening Balance</p>
                        <p className={`text-lg font-bold tabular-nums ${opening_balance < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                            ৳ {fmt(opening_balance)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Income</p>
                        <p className="text-lg font-bold text-green-600 tabular-nums">+ ৳ {fmt(total_income)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Expense</p>
                        <p className="text-lg font-bold text-red-500 tabular-nums">- ৳ {fmt(total_expense)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Closing Balance</p>
                        <p className={`text-lg font-bold tabular-nums ${closing_balance < 0 ? 'text-red-600' : 'text-indigo-700'}`}>
                            ৳ {fmt(closing_balance)}
                        </p>
                    </div>
                </div>

                {/* ── Stat cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                    <StatCard
                        icon={icons.transactions}
                        label="Transactions"
                        value={`৳ ${fmt(total_income)}`}
                        sub={`${fmt(total_expense)} spent this month`}
                        colorClass="bg-indigo-50 text-indigo-600"
                        routeName="transactions.index"
                    />

                    <StatCard
                        icon={icons.budget}
                        label="Budget Planned"
                        value={`৳ ${fmt(budget_planned)}`}
                        sub={budget_planned > 0
                            ? `${Math.min(100, Math.round((total_expense / budget_planned) * 100))}% utilised`
                            : 'No budget set'}
                        colorClass="bg-blue-50 text-blue-500"
                        routeName="budget.index"
                    />

                    <StatCard
                        icon={icons.task}
                        label="Tasks"
                        value={tasks?.count ?? 0}
                        sub={`${tasks?.pending ?? 0} pending`}
                        colorClass="bg-purple-50 text-purple-500"
                        routeName="tasks.index"
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { label: 'Pending',     count: tasks?.pending,   color: 'bg-yellow-100 text-yellow-700' },
                                { label: 'In Progress', count: tasks?.progress,  color: 'bg-blue-100 text-blue-700' },
                                { label: 'Completed',   count: tasks?.completed, color: 'bg-green-100 text-green-700' },
                                { label: 'Cancelled',   count: tasks?.cancelled, color: 'bg-red-100 text-red-700' },
                            ].map(b => (
                                <span key={b.label} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${b.color}`}>
                                    {b.label}: {b.count ?? 0}
                                </span>
                            ))}
                        </div>
                    </StatCard>

                    <StatCard
                        icon={icons.resume}
                        label="Resumes"
                        value={resumes?.count ?? 0}
                        colorClass="bg-amber-50 text-amber-500"
                        routeName="resume.index"
                    />

                </div>

                {/* ── Bottom row: monthly summary + loans + accounts ───────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Monthly net */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            {MONTHS[month - 1]} {year} Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Income</span>
                                <span className="text-sm font-semibold text-green-600">+ ৳ {fmt(total_income)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Expense</span>
                                <span className="text-sm font-semibold text-red-500">- ৳ {fmt(total_expense)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm font-semibold text-gray-700">Net</span>
                                <span className={`text-base font-bold ${monthNet >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    ৳ {fmt(monthNet)}
                                </span>
                            </div>
                            {budget_planned > 0 && (
                                <div className="pt-1">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Budget utilisation</span>
                                        <span>{Math.min(100, Math.round((total_expense / budget_planned) * 100))}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all ${
                                                total_expense > budget_planned ? 'bg-red-500' : 'bg-indigo-500'
                                            }`}
                                            style={{ width: `${Math.min(100, (total_expense / budget_planned) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Accounts */}
                    <AccountBalances accounts={accounts} />

                    {/* Loan overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Loans</h3>
                            <Link href={route('loans.index')} className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>

                        {(loans?.lend_outstanding > 0 || loans?.borrow_outstanding > 0) ? (
                            <div className="space-y-3">
                                {loans?.lend_outstanding > 0 && (
                                    <Link href={route('loans.index', { type: 'lend' })} className="block">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 transition">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 rounded-lg text-green-600">{icons.lend}</div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Others owe you</p>
                                                    <p className="text-xs text-gray-400">{loans.lend_count} loan{loans.lend_count !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <p className="text-base font-bold text-green-700">৳ {fmt(loans.lend_outstanding)}</p>
                                        </div>
                                    </Link>
                                )}
                                {loans?.borrow_outstanding > 0 && (
                                    <Link href={route('loans.index', { type: 'borrow' })} className="block">
                                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 hover:border-red-300 transition">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-red-100 rounded-lg text-red-600">{icons.borrow}</div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">You owe</p>
                                                    <p className="text-xs text-gray-400">{loans.borrow_count} loan{loans.borrow_count !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <p className="text-base font-bold text-red-600">৳ {fmt(loans.borrow_outstanding)}</p>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                <p className="text-3xl mb-2">🤝</p>
                                <p className="text-xs">No outstanding loans</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
