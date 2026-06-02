import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const GATEWAY_ICONS = {
    bkash:  { emoji: '📱', color: '#E2136E', label: 'bKash' },
    nagad:  { emoji: '🟠', color: '#F05A28', label: 'Nagad' },
    card:   { emoji: '💳', color: '#1A56DB', label: 'Card / SSL' },
    cash:   { emoji: '💵', color: '#059669', label: 'Cash' },
};

function PaymentModal({ resume, price, gateways, onClose, onSuccess }) {
    const [step, setStep]         = useState('select');   // select | phone | processing | done
    const [gateway, setGateway]   = useState(null);
    const [phone, setPhone]       = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const needsPhone = gateway && ['bkash', 'nagad'].includes(gateway.slug);

    const proceed = () => {
        if (!gateway) { setError('Please select a payment method.'); return; }
        if (needsPhone && !phone.trim()) { setError('Phone number is required for ' + gateway.name); return; }
        setError('');
        setLoading(true);

        fetch(route('resume.pay-download', resume.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ gateway: gateway.slug, phone: phone || undefined }),
        })
        .then(r => r.json())
        .then(data => {
            setLoading(false);
            if (data.status === 'redirect' && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else if (data.status === 'already_paid') {
                onSuccess(data.download_token);
            } else if (data.status === 'error') {
                setError(data.message ?? 'Payment failed. Please try again.');
            }
        })
        .catch(() => { setLoading(false); setError('Network error. Please try again.'); });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Download Resume</h2>
                        <p className="text-sm text-gray-500 mt-0.5">One-time payment · PDF format</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Price */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-700 font-medium">Resume PDF Download</p>
                            <p className="text-xs text-indigo-500 mt-0.5">High-quality, print-ready PDF</p>
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">৳{price}</div>
                    </div>

                    {/* Gateway selection */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Choose Payment Method</p>
                        <div className="grid grid-cols-2 gap-2">
                            {gateways.map(gw => {
                                const icon = GATEWAY_ICONS[gw.slug] ?? { emoji: '💳', color: '#6366f1', label: gw.name };
                                return (
                                    <button
                                        key={gw.id}
                                        onClick={() => { setGateway(gw); setError(''); }}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                            gateway?.id === gw.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-2xl">{icon.emoji}</span>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm text-gray-800">{gw.name}</p>
                                            {gw.is_sandbox && <p className="text-[10px] text-amber-600">Sandbox</p>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phone input for mobile money */}
                    {needsPhone && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {gateway.name} Number *
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <button
                        onClick={proceed}
                        disabled={loading || !gateway}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Processing…</>
                        ) : (
                            <>Pay ৳{price} & Download</>
                        )}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                        Secure payment · One-time charge · Instant download after payment
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Preview({ auth, resume, hasPaid, previewToken, price, gateways }) {
    const [showPayment, setShowPayment]       = useState(false);
    const [downloadToken, setDownloadToken]   = useState(null);
    const [reissuing, setReissuing]           = useState(false);
    const iframeRef = useRef(null);

    const handlePaymentSuccess = (token) => {
        setDownloadToken(token);
        setShowPayment(false);
    };

    const triggerDownload = (token) => {
        // Navigate to the download endpoint with the one-time token
        window.location.href = route('resume.download', resume.id) + '?token=' + token;
    };

    const reissueToken = () => {
        setReissuing(true);
        fetch(route('resume.reissue-token', resume.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
        })
        .then(r => r.json())
        .then(data => {
            setReissuing(false);
            if (data.status === 'ok') triggerDownload(data.download_token);
        })
        .catch(() => setReissuing(false));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('resume.edit', resume.id)} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-lg text-gray-800">{resume.title} — Preview</h2>
                </div>
            }
        >
            <Head title={`Preview: ${resume.title}`} />

            <div className="space-y-4">
                {/* Action bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                            <p className="font-semibold text-gray-800">{resume.full_name}</p>
                            <p className="text-sm text-gray-500">{resume.template?.name} · {resume.template?.layout?.replace('-', ' ')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('resume.edit', resume.id)}
                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition">
                            ← Edit
                        </Link>

                        {hasPaid || downloadToken ? (
                            <button
                                onClick={() => downloadToken ? triggerDownload(downloadToken) : reissueToken()}
                                disabled={reissuing}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center gap-2"
                            >
                                {reissuing ? (
                                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Preparing…</>
                                ) : (
                                    <>⬇ Download PDF</>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowPayment(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center gap-2"
                            >
                                💳 Pay ৳{price} & Download
                            </button>
                        )}
                    </div>
                </div>

                {/* Paid badge */}
                {(hasPaid || downloadToken) && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm">
                        <span>✅</span>
                        <span className="font-medium">You've purchased this resume.</span>
                        <span className="text-green-600">Click "Download PDF" to get your file. Each download link is valid for 15 minutes.</span>
                    </div>
                )}

                {/* Watermarked preview iframe */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Preview header */}
                    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
                        <span className="text-amber-600 text-sm">⚠</span>
                        <span className="text-amber-700 text-sm font-medium">Preview mode — watermarked. Purchase to download the clean PDF.</span>
                    </div>

                    {/* The iframe loads the signed URL — expires in 30 min */}
                    <div className="relative" style={{ height: '900px' }}>
                        <iframe
                            ref={iframeRef}
                            src={previewToken}
                            className="w-full h-full border-0"
                            title="Resume Preview"
                            sandbox="allow-scripts allow-same-origin"
                            style={{ pointerEvents: 'none' }}
                        />
                        {/* Invisible overlay to block iframe interaction from parent */}
                        <div
                            className="absolute inset-0 z-10"
                            style={{ background: 'transparent', cursor: 'default' }}
                            onContextMenu={e => e.preventDefault()}
                        />
                    </div>
                </div>
            </div>

            {/* Payment modal */}
            {showPayment && (
                <PaymentModal
                    resume={resume}
                    price={price}
                    gateways={gateways}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </AuthenticatedLayout>
    );
}
