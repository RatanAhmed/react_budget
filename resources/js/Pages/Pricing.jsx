import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PaymentModal from '@/Components/PaymentModal';
import { useState } from 'react';

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

function PlanCard({ plan, isCurrent, canLogin, canRegister }) {
    const { auth } = usePage().props;
    const { post, processing } = useForm({ plan_id: plan.id });
    const [showPayment, setShowPayment] = useState(false);

    const isPopular = plan.slug === 'pro';
    const isFree    = Number(plan.price) === 0;

    function handleSubscribe(e) {
        e.preventDefault();
        if (isFree) {
            // Free plan — activate immediately via server
            post(route('subscription.subscribe'));
        } else {
            // Paid plan — open payment modal
            setShowPayment(true);
        }
    }

    function handlePaymentSuccess(txnId) {
        // After payment, activate the subscription server-side
        post(route('subscription.subscribe'));
    }

    return (
        <>
            <div className={`relative bg-white rounded-2xl shadow-sm border flex flex-col ${
                isPopular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
            }`}>
                {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                    </div>
                )}

                <div className="p-6 flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">{plan.description}</p>

                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-gray-900">৳{Number(plan.price).toLocaleString()}</span>
                        {plan.billing_cycle !== 'lifetime' && (
                            <span className="text-sm text-gray-400 ml-1">/ {plan.billing_cycle}</span>
                        )}
                        {plan.billing_cycle === 'lifetime' && isFree && (
                            <span className="text-sm text-gray-400 ml-1">forever</span>
                        )}
                    </div>

                    {/* Duration badge */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-4 bg-indigo-50 text-indigo-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {plan.duration_value
                            ? `Valid for ${plan.duration_value} ${plan.duration_unit}`
                            : 'Lifetime access'}
                    </div>

                    {plan.trial_days > 0 && (
                        <p className="text-xs text-indigo-600 font-medium mb-4">
                            🎉 {plan.trial_days}-day free trial
                        </p>
                    )}

                    {plan.features?.length > 0 && (
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <CheckIcon />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    )}

                    {plan.services?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {plan.services.map(s => (
                                <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    {s.icon} {s.title}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0">
                    {isCurrent ? (
                        <div className="w-full py-2.5 text-center text-sm font-semibold text-green-700 bg-green-50 rounded-xl border border-green-200">
                            ✓ Current Plan
                        </div>
                    ) : auth.user ? (
                        <button
                            onClick={handleSubscribe}
                            disabled={processing}
                            className={`w-full py-2.5 text-sm font-semibold rounded-xl transition ${
                                isPopular
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                            } disabled:opacity-50`}
                        >
                            {processing
                                ? 'Processing…'
                                : isFree
                                    ? 'Get Started Free'
                                    : `Subscribe — ৳${Number(plan.price).toLocaleString()}`}
                        </button>
                    ) : (
                        <Link
                            href={canRegister ? route('register') : route('login')}
                            className={`block w-full py-2.5 text-center text-sm font-semibold rounded-xl transition ${
                                isPopular
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                        >
                            {isFree ? 'Get Started Free' : 'Get Started'}
                        </Link>
                    )}
                </div>
            </div>

            {/* Payment modal for paid plans */}
            <PaymentModal
                show={showPayment}
                onClose={() => setShowPayment(false)}
                amount={Number(plan.price)}
                note={`Subscription: ${plan.name} (${plan.billing_cycle})`}
                payableType="App\\Models\\Plan"
                payableId={plan.id}
                onSuccess={handlePaymentSuccess}
                onError={(msg) => console.error(msg)}
            />
        </>
    );
}

export default function Pricing({ plans, canLogin, canRegister, currentPlanSlug }) {
    const { auth, flash } = usePage().props;

    return (
        <>
            <Head title="Pricing" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
                {/* Nav */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-auto fill-current text-indigo-600" />
                            <span className="font-bold text-gray-800">Budget Planner</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="text-sm font-medium text-indigo-600 hover:underline">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    {canLogin && <Link href={route('login')} className="text-sm text-gray-600 hover:text-gray-900">Log in</Link>}
                                    {canRegister && (
                                        <Link href={route('register')} className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                                            Sign up
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                    {/* Flash */}
                    {flash?.warning && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                            {flash.warning}
                        </div>
                    )}

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Simple, transparent pricing</h1>
                        <p className="text-lg text-gray-500">Choose the plan that fits your needs. Upgrade or cancel anytime.</p>
                    </div>

                    <div className={`grid grid-cols-1 gap-8 ${plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isCurrent={currentPlanSlug === plan.slug}
                                canLogin={canLogin}
                                canRegister={canRegister}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
