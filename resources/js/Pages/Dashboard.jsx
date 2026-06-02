import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
    return Number(amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons = {
    expense: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    income: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    saving: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, total, count, colorClass, routeName, children }) {
    const content = (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow h-full">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorClass}`}>{icon}</div>
                <div className="text-right">
                    {total !== undefined && (
                        <p className="text-xl font-bold text-gray-800 tabular-nums">৳ {fmt(total)}</p>
                    )}
                    {count !== undefined && total === undefined && (
                        <p className="text-2xl font-bold text-gray-800">{count}</p>
                    )}
                    {count !== undefined && total !== undefined && (
                        <p className="text-xs text-gray-400">{count} entries</p>
                    )}
                </div>
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-600">{label}</p>
            </div>
            {children}
        </div>
    );

    return routeName
        ? <Link href={route(routeName)} className="block h-full">{content}</Link>
        : content;
}

// ── Carry-forward banner ──────────────────────────────────────────────────────

function CarryForwardBanner({ carryForward, month, year }) {
    const { post, processing } = useForm({
        month,
        year,
        amount: carryForward.prev_net > 0 ? carryForward.prev_net : 0,
    });

    const prevLabel = `${MONTHS[carryForward.prev_month - 1]} ${carryForward.prev_year}`;
    const net       = carryForward.prev_net;

    if (carryForward.already_added) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Carry-forward from <strong className="mx-1">{prevLabel}</strong> (৳ {fmt(net)}) already added.
            </div>
        );
    }

    if (net <= 0) return null; // deficit — nothing to carry forward

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-indigo-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>
                    <strong>{prevLabel}</strong> ended with a surplus of{' '}
                    <strong className="text-indigo-700">৳ {fmt(net)}</strong>
                </span>
                <span className="text-indigo-500 hidden sm:inline">— carry it into this month?</span>
            </div>
            <button
                onClick={() => post(route('income.carry-forward'))}
                disabled={processing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
                {processing ? 'Adding…' : '+ Add Carry Forward'}
            </button>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard({ auth, stats, loans, carryForward, filters }) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

    const [month, setMonth] = useState(filters?.month ?? new Date().getMonth() + 1);
    const [year, setYear]   = useState(filters?.year  ?? currentYear);

    function applyFilter(newMonth, newYear) {
        router.get(route('dashboard'), { month: newMonth, year: newYear }, {
            preserveState: true, replace: true,
        });
    }

    const { expenses, incomes, budgets, tasks, savings, resumes } = stats ?? {};
    const netBalance = (incomes?.total ?? 0) - (expenses?.total ?? 0);

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

                {/* ── Carry-forward alert ──────────────────────────────────── */}
                {carryForward && carryForward.prev_net > 0 && (
                    <CarryForwardBanner carryForward={carryForward} month={month} year={year} />
                )}

                {/* ── Main stats grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                    <StatCard icon={icons.income}  label="Income"   total={incomes?.total}   count={incomes?.count}   colorClass="bg-green-50 text-green-600"   routeName="income.index" />
                    <StatCard icon={icons.expense} label="Expenses" total={expenses?.total}  count={expenses?.count}  colorClass="bg-red-50 text-red-500"       routeName="expense.index" />
                    <StatCard icon={icons.budget}  label="Budgets"  total={budgets?.total}   count={budgets?.count}   colorClass="bg-blue-50 text-blue-500"     routeName="budget.index" />
                    <StatCard icon={icons.saving}  label="Savings"  total={savings?.total}   count={savings?.count}   colorClass="bg-amber-50 text-amber-500" />
                    <StatCard icon={icons.task}    label="Tasks"    count={tasks?.count}     colorClass="bg-purple-50 text-purple-500" routeName="tasks.index">
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
                    <StatCard icon={icons.resume}  label="Resumes"  count={resumes?.count}   colorClass="bg-indigo-50 text-indigo-500" routeName="resume.index" />

                </div>

                {/* ── Net summary + Loan overview ──────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Monthly net */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Monthly Summary — {MONTHS[month - 1]} {year}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Total Income</p>
                                <p className="text-xl font-bold text-green-600">৳ {fmt(incomes?.total)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{incomes?.count ?? 0} entries</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Total Expenses</p>
                                <p className="text-xl font-bold text-red-500">৳ {fmt(expenses?.total)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{expenses?.count ?? 0} entries</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Net Balance</p>
                                <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    ৳ {fmt(netBalance)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {netBalance >= 0 ? 'Surplus' : 'Deficit'}
                                </p>
                            </div>
                        </div>

                        {/* Simple progress bar: expenses vs income */}
                        {(incomes?.total ?? 0) > 0 && (
                            <div className="mt-5">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Expenses vs Income</span>
                                    <span>{Math.min(100, Math.round(((expenses?.total ?? 0) / (incomes?.total ?? 1)) * 100))}% spent</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            (expenses?.total ?? 0) > (incomes?.total ?? 0) ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(100, ((expenses?.total ?? 0) / Math.max(incomes?.total ?? 1, 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

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
                                                <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                                                    {icons.lend}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Others owe you</p>
                                                    <p className="text-xs text-gray-400">{loans.lend_count} active loan{loans.lend_count !== 1 ? 's' : ''}</p>
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
                                                <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                                                    {icons.borrow}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">You owe</p>
                                                    <p className="text-xs text-gray-400">{loans.borrow_count} active loan{loans.borrow_count !== 1 ? 's' : ''}</p>
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
