import { useEffect, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import axios from 'axios';

const FEATURES = [
    { icon: '💰', text: 'Budget & expense tracking' },
    { icon: '📋', text: 'Task & productivity manager' },
    { icon: '🍽️', text: 'Restaurant POS & management' },
    { icon: '📱', text: 'Mobile repair shop system' },
    { icon: '🛒', text: 'Ecommerce & online selling' },
    { icon: '📄', text: 'Resume builder' },
];

// ── Social OAuth button ───────────────────────────────────────────────────────
function SocialButton({ provider, icon, label }) {
    return (
        <a
            href={route('social.redirect', { provider })}
            className="flex items-center justify-center gap-2.5 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
        >
            {icon}
            {label}
        </a>
    );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ text = 'or' }) {
    return (
        <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">{text}</span>
            <hr className="flex-1 border-gray-200" />
        </div>
    );
}

// ── Mobile OTP login form ─────────────────────────────────────────────────────
function MobileLogin() {
    const [step, setStep] = useState('send');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp]       = useState('');
    const [sending, setSending]     = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [mobileError, setMobileError] = useState('');
    const [otpError, setOtpError]       = useState('');
    const [countdown, setCountdown]     = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const sendOtp = async (e) => {
        e?.preventDefault();
        setMobileError('');
        setSending(true);
        try {
            await axios.post(route('mobile.send-otp'), { mobile });
            setStep('verify');
            setCountdown(60);
        } catch (err) {
            setMobileError(err.response?.data?.errors?.mobile?.[0] ?? 'Failed to send OTP. Check the number and try again.');
        } finally {
            setSending(false);
        }
    };

    const verifyOtp = (e) => {
        e.preventDefault();
        setOtpError('');
        setVerifying(true);
        router.post(route('mobile.verify-otp'), { mobile, otp }, {
            onError: (errors) => {
                setOtpError(errors.otp ?? errors.mobile ?? 'Invalid or expired OTP.');
                setVerifying(false);
            },
        });
    };

    return (
        <div className="space-y-5">
            {step === 'send' ? (
                <form onSubmit={sendOtp} className="space-y-4">
                    <div>
                        <label htmlFor="mobile-login" className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile number <span className="text-gray-400 font-normal">(with country code)</span>
                        </label>
                        <input
                            id="mobile-login"
                            type="tel"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                            placeholder="+8801711000000"
                            autoFocus
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {mobileError && <p className="mt-1.5 text-sm text-red-600">{mobileError}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                    >
                        {sending ? 'Sending OTP…' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                    <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                        OTP sent to <strong>{mobile}</strong>.{' '}
                        <button type="button" onClick={() => setStep('send')} className="text-blue-600 hover:underline text-xs">
                            Change number
                        </button>
                    </p>
                    <div>
                        <label htmlFor="otp-login" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter 6-digit OTP
                        </label>
                        <input
                            id="otp-login"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            autoFocus
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {otpError && <p className="mt-1.5 text-sm text-red-600">{otpError}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={verifying || otp.length < 6}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                    >
                        {verifying ? 'Verifying…' : 'Sign in'}
                    </button>
                    <div className="text-center text-xs text-gray-400">
                        {countdown > 0 ? (
                            <span>Resend OTP in {countdown}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={sendOtp}
                                disabled={sending}
                                className="text-blue-600 hover:underline disabled:opacity-50"
                            >
                                {sending ? 'Resending…' : 'Resend OTP'}
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}

// ── Main Login page ───────────────────────────────────────────────────────────
export default function Login({ status, canResetPassword }) {
    const [tab, setTab] = useState('email'); // 'email' | 'mobile'

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => () => reset('password'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex">
            <Head title="Log in — Software Center" />

            {/* ── Left panel (branding) ─────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white flex-col justify-between p-12">
                <div>
                    <Link href="/" className="text-2xl font-extrabold tracking-tight">
                        Software Center
                    </Link>
                    <p className="mt-2 text-blue-200 text-sm">Your all-in-one digital service hub</p>
                </div>

                <div>
                    <h2 className="text-3xl font-bold mb-2 leading-snug">
                        Everything you need,<br />in one place.
                    </h2>
                    <p className="text-blue-200 mb-8 text-sm">
                        Log in to access all your services and manage your business from a single dashboard.
                    </p>
                    <ul className="space-y-3">
                        {FEATURES.map((f) => (
                            <li key={f.text} className="flex items-center gap-3 text-sm">
                                <span className="text-xl">{f.icon}</span>
                                <span className="text-blue-100">{f.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-blue-300 text-xs">
                    © {new Date().getFullYear()} Software Center. All rights reserved.
                </p>
            </div>

            {/* ── Right panel (form) ────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link href="/" className="text-2xl font-extrabold text-blue-600">Software Center</Link>
                        <p className="text-gray-500 text-sm mt-1">Your all-in-one digital service hub</p>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Don't have an account?{' '}
                        <Link href={route('register')} className="text-blue-600 hover:underline font-medium">
                            Create one free
                        </Link>
                    </p>

                    {status && (
                        <div className="mb-5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                            {status}
                        </div>
                    )}

                    {/* ── Social buttons ──────────────────────────────────── */}
                    <div className="space-y-2.5">
                        <SocialButton
                            provider="google"
                            icon={
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            }
                            label="Continue with Google"
                        />
                        <SocialButton
                            provider="facebook"
                            icon={
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            }
                            label="Continue with Facebook"
                        />
                    </div>

                    <Divider text="or sign in with" />

                    {/* ── Tab selector ────────────────────────────────────── */}
                    <div className="flex rounded-lg border border-gray-200 p-1 bg-white mb-5">
                        <button
                            type="button"
                            onClick={() => setTab('email')}
                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                                tab === 'email' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('mobile')}
                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                                tab === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Mobile OTP
                        </button>
                    </div>

                    {/* ── Email / Password form ────────────────────────────── */}
                    {tab === 'email' && (
                        <form onSubmit={submit} className="space-y-5">

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        required
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">Remember me for 30 days</span>
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    )}

                    {/* ── Mobile OTP form ──────────────────────────────────── */}
                    {tab === 'mobile' && <MobileLogin />}

                    <p className="mt-8 text-center text-xs text-gray-400">
                        By signing in you agree to our{' '}
                        <span className="underline cursor-pointer">Terms of Service</span> and{' '}
                        <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
