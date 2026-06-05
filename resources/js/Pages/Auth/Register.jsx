import { useEffect, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import axios from 'axios';

const PERKS = [
    { icon: '✅', text: 'Free to get started — no credit card needed' },
    { icon: '🔒', text: 'Your data is encrypted and secure' },
    { icon: '📊', text: 'Access all services from one dashboard' },
    { icon: '🚀', text: 'Set up in under 2 minutes' },
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

// ── Mobile OTP form ───────────────────────────────────────────────────────────
// Only phone number is required — account is created on successful OTP verification.
function MobileRegister() {
    const [step, setStep]   = useState('send'); // 'send' | 'verify'
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
        e.preventDefault();
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
                setOtpError(errors.otp ?? errors.mobile ?? 'Verification failed.');
                setVerifying(false);
            },
        });
    };

    return (
        <div className="space-y-5">
            {step === 'send' ? (
                <form onSubmit={sendOtp} className="space-y-4">
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile number <span className="text-gray-400 font-normal">(with country code)</span>
                        </label>
                        <input
                            id="mobile"
                            type="tel"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                            placeholder="+8801711000000"
                            autoFocus
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {mobileError && <p className="mt-1.5 text-sm text-red-600">{mobileError}</p>}
                        <p className="mt-1.5 text-xs text-gray-400">We'll send a 6-digit code to verify your number.</p>
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
                        <button type="button" onClick={() => { setStep('send'); setOtp(''); }} className="text-blue-600 hover:underline text-xs">
                            Change number
                        </button>
                    </p>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter 6-digit OTP
                        </label>
                        <input
                            id="otp"
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
                        {verifying ? 'Verifying…' : 'Verify & Create Account'}
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

// ── Main Register page ────────────────────────────────────────────────────────
export default function Register() {
    const [tab, setTab] = useState('email'); // 'email' | 'mobile'

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);

    // Password strength
    const strength = (() => {
        const p = data.password;
        if (!p) return null;
        let score = 0;
        if (p.length >= 8)          score++;
        if (/[A-Z]/.test(p))        score++;
        if (/[0-9]/.test(p))        score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        if (score <= 1) return { label: 'Weak',   color: 'bg-red-400',    width: 'w-1/4' };
        if (score === 2) return { label: 'Fair',   color: 'bg-yellow-400', width: 'w-2/4' };
        if (score === 3) return { label: 'Good',   color: 'bg-blue-400',   width: 'w-3/4' };
        return                { label: 'Strong', color: 'bg-green-500',  width: 'w-full' };
    })();

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen flex">
            <Head title="Register — Software Center" />

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
                        Start for free.<br />Grow at your pace.
                    </h2>
                    <p className="text-blue-200 mb-8 text-sm">
                        Join thousands of users managing their finances, tasks, and businesses with Software Center.
                    </p>
                    <ul className="space-y-4">
                        {PERKS.map((p) => (
                            <li key={p.text} className="flex items-start gap-3 text-sm">
                                <span className="text-xl leading-none mt-0.5">{p.icon}</span>
                                <span className="text-blue-100">{p.text}</span>
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

                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Create your account</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Already have an account?{' '}
                        <Link href={route('login')} className="text-blue-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>

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

                    <Divider text="or register with" />

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
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    autoComplete="name"
                                    autoFocus
                                    required
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <InputError message={errors.name} className="mt-1.5" />
                            </div>

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
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="new-password"
                                        required
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
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
                                {strength && (
                                    <div className="mt-2">
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Password strength: <span className="font-medium">{strength.label}</span></p>
                                    </div>
                                )}
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        autoComplete="new-password"
                                        required
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Re-enter your password"
                                        className={`w-full border rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                                            data.password_confirmation && data.password !== data.password_confirmation
                                                ? 'border-red-400 focus:ring-red-400'
                                                : data.password_confirmation && data.password === data.password_confirmation
                                                ? 'border-green-400 focus:ring-green-400'
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                                        tabIndex={-1}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? '🙈' : '👁️'}
                                    </button>
                                    {data.password_confirmation && data.password === data.password_confirmation && (
                                        <span className="absolute right-9 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                                    )}
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-1.5" />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                            >
                                {processing ? 'Creating account…' : 'Create account'}
                            </button>
                        </form>
                    )}

                    {/* ── Mobile OTP form ──────────────────────────────────── */}
                    {tab === 'mobile' && <MobileRegister />}

                    <p className="mt-6 text-center text-xs text-gray-400">
                        By registering you agree to our{' '}
                        <span className="underline cursor-pointer">Terms of Service</span> and{' '}
                        <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
