import React from 'react';
import { motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';

// Tailwind color map — keeps dynamic classes purgeable
const colorMap = {
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-500',    btn: 'bg-blue-600 hover:bg-blue-700',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-700' },
    green:   { bg: 'bg-green-50',   icon: 'text-green-500',   btn: 'bg-green-600 hover:bg-green-700',   border: 'border-green-200',   badge: 'bg-green-100 text-green-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-500',     btn: 'bg-red-600 hover:bg-red-700',       border: 'border-red-200',     badge: 'bg-red-100 text-red-700' },
    purple:  { bg: 'bg-purple-50',  icon: 'text-purple-500',  btn: 'bg-purple-600 hover:bg-purple-700', border: 'border-purple-200',  badge: 'bg-purple-100 text-purple-700' },
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-500',  btn: 'bg-indigo-600 hover:bg-indigo-700', border: 'border-indigo-200',  badge: 'bg-indigo-100 text-indigo-700' },
    cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-500',    btn: 'bg-cyan-600 hover:bg-cyan-700',     border: 'border-cyan-200',    badge: 'bg-cyan-100 text-cyan-700' },
    orange:  { bg: 'bg-orange-50',  icon: 'text-orange-500',  btn: 'bg-orange-600 hover:bg-orange-700', border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-700' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-500',  btn: 'bg-violet-600 hover:bg-violet-700', border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700' },
    teal:    { bg: 'bg-teal-50',    icon: 'text-teal-500',    btn: 'bg-teal-600 hover:bg-teal-700',     border: 'border-teal-200',    badge: 'bg-teal-100 text-teal-700' },
};

const CATEGORIES = [
    { key: 'all',          label: 'All Services' },
    { key: 'finance',      label: 'Finance' },
    { key: 'productivity', label: 'Productivity' },
    { key: 'business',     label: 'Business' },
    { key: 'utility',      label: 'Utility' },
];

export default function SoftwareCenterLanding({ canLogin, canRegister, services = [] }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const [activeCategory, setActiveCategory] = React.useState('all');

    const filtered = activeCategory === 'all'
        ? services
        : services.filter(s => s.category === activeCategory);

    // Determine the CTA link for a service card
    const serviceLink = (service) => {
        if (isLoggedIn) return service.route;
        // For services with a dedicated detail page, go there first
        if (service.route?.startsWith('/services/')) return service.route;
        return `/login?redirect=${encodeURIComponent(service.route)}`;
    };

    const serviceLinkLabel = (service) => {
        if (isLoggedIn) return 'Open Service →';
        if (service.route?.startsWith('/services/')) return 'Learn More →';
        return 'Login to Access →';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <header className="flex justify-between items-center px-6 md:px-10 py-5 shadow-sm bg-white sticky top-0 z-50">
                <h1 className="text-2xl font-bold text-blue-600">Software Center</h1>
                <nav className="space-x-6 hidden md:flex items-center text-sm font-medium text-gray-600">
                    <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
                    <a href="#about"    className="hover:text-blue-600 transition-colors">About</a>
                    <a href="#contact"  className="hover:text-blue-600 transition-colors">Contact</a>
                </nav>
                {isLoggedIn ? (
                    <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                        Dashboard
                    </Link>
                ) : (
                    <div className="flex gap-2">
                        {canLogin && (
                            <Link href="/login" className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Login
                            </Link>
                        )}
                        {canRegister && (
                            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Get Started
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className="flex flex-col items-center text-center py-20 px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 leading-tight"
                >
                    All-in-One Digital Service Hub
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="max-w-2xl text-lg text-gray-500 mb-8"
                >
                    Manage tasks, plan budgets, run your restaurant or mobile shop, and sell online — all from one powerful platform.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex gap-3 flex-wrap justify-center"
                >
                    <a href="#services" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors">
                        Explore Services
                    </a>
                    {!isLoggedIn && canRegister && (
                        <Link href="/register" className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg text-base font-medium transition-colors">
                            Create Free Account
                        </Link>
                    )}
                </motion.div>

                {/* Stats strip */}
                <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
                    {[
                        { value: `${services.length}+`, label: 'Services' },
                        { value: '100%', label: 'Web-Based' },
                        { value: '24/7', label: 'Support' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-3xl font-extrabold text-blue-600">{stat.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Services ───────────────────────────────────────────────── */}
            <section id="services" className="py-16 px-6 md:px-20 bg-white">
                <h3 className="text-3xl font-bold text-center mb-3 text-gray-800">Our Services</h3>
                <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto">
                    Choose a service below to get started. Some services are free; others require an account.
                </p>

                {/* Category filter tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                activeCategory === cat.key
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((service, index) => {
                        const c = colorMap[service.color] ?? colorMap.blue;
                        const href = serviceLink(service);
                        const label = serviceLinkLabel(service);
                        const isDetailPage = service.route?.startsWith('/services/');

                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.07 }}
                                className={`relative rounded-2xl border ${c.border} ${c.bg} p-6 shadow-sm hover:shadow-lg transition-all flex flex-col`}
                            >
                                {/* Badge */}
                                {service.badge && (
                                    <span className={`absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                                        {service.badge}
                                    </span>
                                )}

                                <div className="text-4xl mb-3">{service.icon}</div>
                                <h4 className="text-base font-bold text-gray-800 mb-1">{service.title}</h4>
                                <p className="text-gray-500 text-sm mb-4 flex-1">{service.description}</p>

                                {/* Feature pills */}
                                {service.features?.length > 0 && (
                                    <ul className="flex flex-wrap gap-1 mb-4">
                                        {service.features.slice(0, 3).map((f, i) => (
                                            <li key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                                {f}
                                            </li>
                                        ))}
                                        {service.features.length > 3 && (
                                            <li className="text-xs text-gray-400 px-1 py-0.5">+{service.features.length - 3} more</li>
                                        )}
                                    </ul>
                                )}

                                <div className="flex gap-2 mt-auto">
                                    <Link
                                        href={href}
                                        className={`flex-1 text-center text-sm font-medium text-white py-2 px-3 rounded-lg transition-colors ${c.btn}`}
                                    >
                                        {label}
                                    </Link>
                                    {/* Always show "Learn More" for business services with detail pages */}
                                    {isDetailPage && isLoggedIn && (
                                        <Link
                                            href={service.route}
                                            className="text-sm font-medium border border-gray-300 text-gray-600 hover:border-gray-400 py-2 px-3 rounded-lg transition-colors"
                                        >
                                            Details
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ── About ──────────────────────────────────────────────────── */}
            <section id="about" className="py-16 bg-blue-50 text-center px-6">
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Why Choose Software Center?</h3>
                <p className="max-w-2xl mx-auto text-gray-600 mb-10">
                    We provide a wide range of smart tools that simplify your daily digital needs — whether you're managing a project, planning expenses, running a restaurant, or selling online.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                    {[
                        { icon: '⚡', title: 'Easy to Use',      desc: 'Clean, intuitive interfaces designed for everyone — no training needed.' },
                        { icon: '🔒', title: 'Secure Platform',  desc: 'Your data is protected with industry-standard encryption and access controls.' },
                        { icon: '📞', title: '24/7 Support',     desc: 'Our team is always available to help you get the most out of every service.' },
                    ].map(item => (
                        <div key={item.title} className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="text-3xl mb-2">{item.icon}</div>
                            <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA / Register ─────────────────────────────────────────── */}
            {!isLoggedIn && (
                <section id="contact" className="py-20 px-6 bg-white text-center">
                    <h3 className="text-3xl font-bold mb-3 text-gray-800">Ready to get started?</h3>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        Create your free Software Center account and access all services from one dashboard.
                    </p>
                    {canRegister && (
                        <Link href="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors">
                            Register Now — It's Free
                        </Link>
                    )}
                </section>
            )}

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className="bg-gray-900 text-gray-400 text-center py-6">
                <p className="text-sm">© {new Date().getFullYear()} Software Center. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
