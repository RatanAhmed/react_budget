import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const PERKS = [
    { icon: '✅', text: 'Free to get started — no credit card needed' },
    { icon: '🔒', text: 'Your data is encrypted and secure' },
    { icon: '📊', text: 'Access all services from one dashboard' },
    { icon: '🚀', text: 'Set up in under 2 minutes' },
];

export default function Register() {
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
                    <p className="text-gray-500 text-sm mb-7">
                        Already have an account?{' '}
                        <Link href={route('login')} className="text-blue-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>

                    <form onSubmit={submit} className="space-y-5">

                        {/* Full name */}
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

                        {/* Email */}
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

                        {/* Password */}
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
                            {/* Strength bar */}
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

                        {/* Confirm password */}
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                        >
                            {processing ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

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
