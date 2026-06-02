import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Result({ success, txn_id, amount, gateway, paid_at }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Head title={success ? 'Payment Successful' : 'Payment Failed'} />

            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${
                    success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                    {success ? '✅' : '❌'}
                </div>

                <h1 className={`text-2xl font-bold mb-2 ${success ? 'text-green-700' : 'text-red-600'}`}>
                    {success ? 'Payment Successful' : 'Payment Failed'}
                </h1>

                <p className="text-gray-500 text-sm mb-6">
                    {success
                        ? 'Your payment has been processed successfully.'
                        : 'Something went wrong. Please try again or contact support.'}
                </p>

                {success && (
                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Transaction ID</span>
                            <span className="font-mono font-medium text-gray-800">{txn_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-semibold text-gray-800">৳ {Number(amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Method</span>
                            <span className="capitalize font-medium text-gray-800">{gateway}</span>
                        </div>
                        {paid_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paid at</span>
                                <span className="text-gray-800">{paid_at}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href="/dashboard"
                        className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors text-center">
                        Dashboard
                    </Link>
                    <Link href="/payment/transactions"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors text-center">
                        View Transactions
                    </Link>
                </div>
            </div>
        </div>
    );
}
