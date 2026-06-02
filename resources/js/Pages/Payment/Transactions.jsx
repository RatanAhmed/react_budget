import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const STATUS_STYLES = {
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    failed:    'bg-red-100 text-red-600',
    refunded:  'bg-gray-100 text-gray-600',
    cancelled: 'bg-gray-100 text-gray-500',
};

export default function Transactions({ auth, transactions }) {
    const items = transactions?.data ?? [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Payment Transactions" />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                    <h1 className="text-lg font-semibold text-gray-800">Payment Transactions</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Your complete payment history.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                                <th className="px-4 py-3 text-left">Transaction ID</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-left">Note</th>
                                <th className="px-4 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                                        No transactions yet.
                                    </td>
                                </tr>
                            )}
                            {items.map(txn => (
                                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{txn.txn_id}</td>
                                    <td className="px-4 py-3">
                                        <span className="capitalize font-medium text-gray-700">{txn.gateway_slug}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-800">
                                        ৳ {Number(txn.amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[txn.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{txn.note ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        {txn.paid_at ?? txn.created_at}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
