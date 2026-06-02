import React from 'react';
import { motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

const colorMap = {
    blue:    { bg: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-700' },
    green:   { bg: 'bg-green-600',   light: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200',   badge: 'bg-green-100 text-green-700' },
    cyan:    { bg: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200',    badge: 'bg-cyan-100 text-cyan-700' },
    orange:  { bg: 'bg-orange-600',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-700' },
    violet:  { bg: 'bg-violet-600',  light: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700' },
    purple:  { bg: 'bg-purple-600',  light: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200',  badge: 'bg-purple-100 text-purple-700' },
    indigo:  { bg: 'bg-indigo-600',  light: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200',  badge: 'bg-indigo-100 text-indigo-700' },
    teal:    { bg: 'bg-teal-600',    light: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-200',    badge: 'bg-teal-100 text-teal-700' },
};

export default function ServiceDetail({ service }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const c = colorMap[service.color] ?? colorMap.blue;

    const ctaHref = isLoggedIn
        ? service.route
        : `/login?redirect=${encodeURIComponent(service.route)}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={service.title} />

            {/* Nav */}
            <header className="bg-white border-b border-gray-200 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="text-xl font-bold text-blue-600">Software Center</Link>
                <div className="flex gap-2">
                    {isLoggedIn ? (
                        <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/login"    className="border border-gray-300 text-gray-600 hover:border-blue-400 px-4 py-2 rounded-lg text-sm font-medium">Login</Link>
                            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Register</Link>
                        </>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section className={`${c.bg} text-white py-16 px-6 md:px-20`}>
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">← Back to Services</Link>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl">{service.icon}</span>
                        {service.badge && (
                            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{service.badge}</span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{service.title}</h1>
                    <p className="text-white/80 text-lg max-w-2xl">{service.description}</p>
                    <div className="mt-8 flex gap-3 flex-wrap">
                        <Link href={ctaHref} className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors">
                            {isLoggedIn ? 'Open Service →' : 'Login to Access →'}
                        </Link>
                        {!isLoggedIn && (
                            <Link href="/register" className="border border-white/50 text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-colors">
                                Create Free Account
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Modules */}
            {service.modules?.length > 0 && (
                <section className="py-14 px-6 md:px-20 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">What's Included</h2>
                        <p className="text-gray-500 mb-8">Everything you need, built into one platform.</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {service.modules.map((mod, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className={`rounded-xl border ${c.border} ${c.light} p-5`}
                                >
                                    <div className="text-3xl mb-2">{mod.icon}</div>
                                    <h3 className={`font-semibold ${c.text} mb-1`}>{mod.name}</h3>
                                    <p className="text-sm text-gray-600">{mod.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            {service.features?.length > 0 && (
                <section className="py-14 px-6 md:px-20 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">Key Features</h2>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {service.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                    <span className={`mt-0.5 font-bold ${c.text}`}>✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-16 px-6 text-center bg-white">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Ready to use {service.title}?</h2>
                <p className="text-gray-500 mb-6">
                    {isLoggedIn ? 'Jump right in from your dashboard.' : 'Create a free account or log in to get started.'}
                </p>
                <Link href={ctaHref} className={`inline-block text-white font-semibold px-8 py-3 rounded-lg transition-colors ${c.bg} hover:opacity-90`}>
                    {isLoggedIn ? 'Open Service →' : 'Get Started →'}
                </Link>
            </section>

            <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
                © {new Date().getFullYear()} Software Center. All Rights Reserved.
            </footer>
        </div>
    );
}
