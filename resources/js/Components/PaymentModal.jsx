import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PaymentModal — reusable payment gateway selector & initiator.
 *
 * Props:
 *   show         {boolean}   — whether the modal is visible
 *   onClose      {function}  — called when modal is dismissed
 *   amount       {number}    — amount to charge (required)
 *   phone        {string}    — pre-fill phone (optional)
 *   note         {string}    — payment description (optional)
 *   payableType  {string}    — morph model class (optional)
 *   payableId    {number}    — morph model id (optional)
 *   onSuccess    {function}  — called with txn_id on success
 *   onError      {function}  — called with error message
 *
 * Usage:
 *   <PaymentModal
 *     show={open}
 *     onClose={() => setOpen(false)}
 *     amount={1500}
 *     note="Invoice #42"
 *     onSuccess={(txnId) => console.log('Paid', txnId)}
 *   />
 */
export default function PaymentModal({
    show,
    onClose,
    amount,
    phone = '',
    note = '',
    payableType = null,
    payableId = null,
    onSuccess,
    onError,
}) {
    const [gateways, setGateways]       = useState([]);
    const [selected, setSelected]       = useState(null);
    const [mobileNo, setMobileNo]       = useState(phone);
    const [loading, setLoading]         = useState(false);
    const [fetchingGateways, setFetching] = useState(false);
    const [error, setError]             = useState(null);

    // Load active gateways when modal opens
    useEffect(() => {
        if (!show) return;
        setFetching(true);
        setError(null);
        setSelected(null);
        axios.get('/payment/gateways')
            .then(res => {
                setGateways(res.data);
                if (res.data.length > 0) setSelected(res.data[0].slug);
            })
            .catch(() => setError('Could not load payment methods.'))
            .finally(() => setFetching(false));
    }, [show]);

    const selectedGateway = gateways.find(g => g.slug === selected);
    const needsPhone = ['bkash', 'nagad'].includes(selected);

    const handlePay = async () => {
        if (!selected) return;
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post('/payment/initiate', {
                gateway:      selected,
                amount,
                phone:        mobileNo || undefined,
                note:         note || undefined,
                payable_type: payableType || undefined,
                payable_id:   payableId || undefined,
            });

            const data = res.data;

            if (data.status === 'redirect' && data.redirect_url) {
                // Redirect to gateway (bKash / Nagad / Card)
                window.location.href = data.redirect_url;
                return;
            }

            if (data.status === 'completed') {
                onSuccess?.(data.txn_id);
                onClose?.();
            }
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Payment failed. Please try again.';
            setError(msg);
            onError?.(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Choose Payment Method</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Amount: <span className="font-semibold text-gray-800">৳ {Number(amount).toLocaleString()}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">

                    {/* Loading gateways */}
                    {fetchingGateways && (
                        <div className="text-center py-6 text-gray-400 text-sm">Loading payment methods…</div>
                    )}

                    {/* Gateway options */}
                    {!fetchingGateways && gateways.length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-sm">No payment methods available.</div>
                    )}

                    {!fetchingGateways && gateways.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {gateways.map(gw => (
                                <button
                                    key={gw.slug}
                                    onClick={() => setSelected(gw.slug)}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        selected === gw.slug
                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    {/* Brand color dot */}
                                    <span
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                        style={{ backgroundColor: gw.color }}
                                    >
                                        {gw.name.charAt(0)}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-700">{gw.name}</span>
                                    {gw.is_sandbox && (
                                        <span className="absolute top-2 right-2 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                                            Test
                                        </span>
                                    )}
                                    {selected === gw.slug && (
                                        <span className="absolute top-2 left-2 text-blue-500 text-xs">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Mobile number field for bKash / Nagad */}
                    {needsPhone && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {selected === 'bkash' ? 'bKash' : 'Nagad'} Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={mobileNo}
                                onChange={e => setMobileNo(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Gateway description */}
                    {selectedGateway?.description && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                            {selectedGateway.description}
                        </p>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePay}
                        disabled={loading || !selected || fetchingGateways}
                        className="flex-1 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                        style={{ backgroundColor: selectedGateway?.color ?? '#2563EB' }}
                    >
                        {loading ? 'Processing…' : `Pay ৳ ${Number(amount).toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
