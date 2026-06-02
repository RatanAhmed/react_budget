import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function DownloadResult({ success, message, resume, download_token, txn_id, amount, gateway, paid_at }) {

    // Auto-trigger download if payment succeeded
    useEffect(() => {
        if (success && download_token && resume?.id) {
            // Small delay so the page renders first
            const timer = setTimeout(() => {
                window.location.href = route('resume.download', resume.id) + '?token=' + download_token;
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [success, download_token]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Head title={success ? 'Payment Successful — Download Ready' : 'Payment Failed'} />

            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${
                    success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                    {success ? '✅' : '❌'}
                </div>

                <h1 className={`text-2xl font-bold mb-2 ${success ? 'text-green-700' : 'text-red-600'}`}>
                    {success ? 'Payment Successful!' : 'Payment Failed'}
                </h1>

                <p className="text-gray-500 text-sm mb-6">
                    {success
                        ? 'Your download is starting automatically…'
                        : (message ?? 'Something went wrong. Please try again or contact support.')}
                </p>

                {success && (
                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                        {txn_id && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Transaction ID</span>
                                <span className="font-mono font-medium text-gray-800">{txn_id}</span>
                            </div>
                        )}
                        {amount && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-semibold text-gray-800">৳ {Number(amount).toLocaleString()}</span>
                            </div>
                        )}
                        {gateway && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="capitalize font-medium text-gray-800">{gateway}</span>
                            </div>
                        )}
                        {paid_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paid at</span>
                                <span className="text-gray-800">{paid_at}</span>
                            </div>
                        )}
                    </div>
                )}

                {success && download_token && resume?.id && (
                    <a
                        href={route('resume.download', resume.id) + '?token=' + download_token}
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
                    >
                        ⬇ Download PDF Now
                    </a>
                )}

                <div className="flex gap-3">
                    {resume?.id && (
                        <Link href={route('resume.preview', resume.id)}
                            className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors text-center">
                            Back to Preview
                        </Link>
                    )}
                    <Link href={route('resume.index')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors text-center">
                        My Resumes
                    </Link>
                </div>
            </div>
        </div>
    );
}
