import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const FEATURES = [
    { icon: '💰', text: 'Budget & expense tracking' },
    { icon: '📋', text: 'Task & productivity manager' },
    { icon: '🍽️', text: 'Restaurant POS & management' },
    { icon: '📱', text: 'Mobile repair shop system' },
    { icon: '🛒', text: 'Ecommerce & online selling' },
    { icon: '📄', text: 'Resume builder' },
];

export default function Login({ status, canResetPassword }) {
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
                    <p className="text-gray-500 text-sm mb-7">
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

                    <form onSubmit={submit} className="space-y-5">

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
                                autoFocus
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        {/* Password */}
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

                        {/* Remember me */}
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

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
