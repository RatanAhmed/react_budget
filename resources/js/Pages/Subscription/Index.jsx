import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import PaymentModal from '@/Components/PaymentModal';
import { useState } from 'react';

function PlanBadge({ status }) {
    const map = {
        active:    'bg-green-100 text-green-700',
        trial:     'bg-blue-100 text-blue-700',
        expired:   'bg-gray-100 text-gray-500',
        cancelled: 'bg-red-100 text-red-600',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
}

// Each plan card is its own component so useForm is called at component level
function PlanCard({ plan, isCurrent, currentSubscription }) {
    const { post, processing } = useForm({ plan_id: plan.id });
    const [showPayment, setShowPayment] = useState(false);
    const isFree = Number(plan.price) === 0;

    function handleSwitch() {
        if (isFree) {
            post(route('subscription.subscribe'));
        } else {
            setShowPayment(true);
        }
    }

    function handlePaymentSuccess() {
        post(route('subscription.subscribe'));
    }

    return (
        <>
            <div className={`rounded-xl border p-4 ${isCurrent ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'}`}>
                <p className="font-semibold text-gray-800">{plan.name}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                    ৳{Number(plan.price).toLocaleString()}
                    <span className="text-xs font-normal text-gray-400"> / {plan.billing_cycle}</span>
                </p>
                {plan.duration_value && (
                    <p className="text-xs text-indigo-600 mt-0.5">
                        Valid {plan.duration_value} {plan.duration_unit}
                    </p>
                )}
                <div className="mt-3">
                    {isCurrent ? (
                        <span className="text-xs text-indigo-600 font-semibold">✓ Current Plan</span>
                    ) : (
                        <button
                            onClick={handleSwitch}
                            disabled={processing}
                            className="w-full py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                        >
                            {processing ? 'Processing…' : 'Switch to this plan'}
                        </button>
                    )}
                </div>
            </div>

            <PaymentModal
                show={showPayment}
                onClose={() => setShowPayment(false)}
                amount={Number(plan.price)}
                note={`Subscription: ${plan.name} (${plan.billing_cycle})`}
                payableType="App\\Models\\Plan"
                payableId={plan.id}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}

export default function SubscriptionIndex({ subscription, history, plans }) {
    const { auth, flash } = usePage().props;
    const { post, processing } = useForm({});

    function cancel(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to cancel your subscription?')) {
            post(route('subscription.cancel'));
        }
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">My Plan</h2>}
        >
            <Head title="My Plan" />

            <div className="max-w-4xl mx-auto space-y-6">

                {flash?.success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{flash.error}</div>
                )}

                {/* ── Current plan ─────────────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Current Subscription</h3>

                    {subscription ? (
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xl font-bold text-gray-800">{subscription.plan?.name}</p>
                                    <PlanBadge status={subscription.status} />
                                </div>
                                <p className="text-sm text-gray-500">
                                    ৳{Number(subscription.plan?.price ?? 0).toLocaleString()} / {subscription.plan?.billing_cycle}
                                </p>
                                {subscription.plan?.duration_value && (
                                    <p className="text-xs text-indigo-600 mt-0.5">
                                        Valid for {subscription.plan.duration_value} {subscription.plan.duration_unit}
                                    </p>
                                )}
                                {subscription.starts_at && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Started: {new Date(subscription.starts_at).toLocaleDateString()}
                                    </p>
                                )}
                                {subscription.ends_at && (
                                    <p className="text-xs text-gray-400">
                                        Expires: {new Date(subscription.ends_at).toLocaleDateString()}
                                    </p>
                                )}
                                {!subscription.ends_at && (
                                    <p className="text-xs text-green-600">Lifetime — never expires</p>
                                )}
                                {subscription.status === 'trial' && subscription.trial_ends_at && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
                                    </p>
                                )}
                                {subscription.plan?.services?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {subscription.plan.services.map(s => (
                                            <span key={s.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                                {s.icon} {s.title}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={cancel}>
                                <button type="submit" disabled={processing}
                                    className="px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition">
                                    Cancel Subscription
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">You don't have an active subscription.</p>
                            <Link href={route('pricing')}
                                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
                                View Plans
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Switch plan ──────────────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Available Plans</h3>
                        <Link href={route('pricing')} className="text-xs text-indigo-600 hover:underline">Full pricing page →</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isCurrent={subscription?.plan?.slug === plan.slug}
                                currentSubscription={subscription}
                            />
                        ))}
                    </div>
                </div>

                {/* ── History ──────────────────────────────────────────────── */}
                {history?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Subscription History</h3>
                        <div className="space-y-2">
                            {history.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{sub.plan?.name ?? '—'}</p>
                                        <p className="text-xs text-gray-400">
                                            {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '—'}
                                            {' → '}
                                            {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : 'No expiry'}
                                        </p>
                                    </div>
                                    <PlanBadge status={sub.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
