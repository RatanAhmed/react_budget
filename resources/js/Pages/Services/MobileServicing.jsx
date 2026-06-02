import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

const TABS = [
    {
        key: 'jobcards',
        label: 'Job Cards',
        icon: '🔧',
        title: 'Repair Job Cards',
        desc: 'Create and manage repair job cards from device intake to customer pickup. Track every repair step in real time.',
        features: [
            'Device intake with photos & condition notes',
            'Technician assignment',
            'Repair status updates (Received → Diagnosing → Repairing → Ready → Delivered)',
            'Customer SMS/notification on status change',
            'Estimated completion time',
            'Job card print & PDF export',
        ],
        preview: [
            { label: 'Open Jobs',      value: '23',  color: 'text-blue-600' },
            { label: 'In Progress',    value: '11',  color: 'text-yellow-600' },
            { label: 'Ready',          value: '5',   color: 'text-green-600' },
            { label: 'Completed Today',value: '8',   color: 'text-gray-500' },
        ],
    },
    {
        key: 'inventory',
        label: 'Inventory',
        icon: '📦',
        title: 'Spare Parts Inventory',
        desc: 'Keep track of every spare part in your shop. Get alerts when stock runs low and manage supplier orders.',
        features: [
            'Part catalog with model compatibility',
            'Stock quantity tracking',
            'Low-stock reorder alerts',
            'Supplier records & purchase orders',
            'Part usage linked to job cards',
            'Barcode / QR code support',
        ],
        preview: [
            { label: 'Total Parts',   value: '312',  color: 'text-blue-600' },
            { label: 'Low Stock',     value: '9',    color: 'text-red-500' },
            { label: 'Suppliers',     value: '7',    color: 'text-green-600' },
            { label: 'Pending POs',   value: '2',    color: 'text-orange-600' },
        ],
    },
    {
        key: 'billing',
        label: 'Billing',
        icon: '🧾',
        title: 'Invoice & Billing',
        desc: 'Generate professional invoices, accept multiple payment methods, and track outstanding dues.',
        features: [
            'Auto-generate invoice from job card',
            'Parts + labour cost breakdown',
            'Cash, card, and mobile payment support',
            'Partial payment & due tracking',
            'Invoice PDF download & print',
            'Daily collection summary',
        ],
        preview: [
            { label: 'Today Collection', value: '৳ 12,400', color: 'text-green-600' },
            { label: 'Pending Dues',     value: '৳ 3,200',  color: 'text-red-500' },
            { label: 'Invoices Today',   value: '14',        color: 'text-blue-600' },
            { label: 'Avg Invoice',      value: '৳ 886',     color: 'text-orange-600' },
        ],
    },
    {
        key: 'customers',
        label: 'Customers',
        icon: '👥',
        title: 'Customer Management',
        desc: 'Maintain a complete customer database with repair history, contact details, and device records.',
        features: [
            'Customer profiles with contact info',
            'Full repair history per customer',
            'Device records (IMEI, model, brand)',
            'Warranty tracking',
            'Customer search & filter',
            'Repeat customer identification',
        ],
        preview: [
            { label: 'Total Customers', value: '1,240', color: 'text-blue-600' },
            { label: 'New This Month',  value: '48',    color: 'text-green-600' },
            { label: 'Repeat Customers',value: '62%',   color: 'text-purple-600' },
            { label: 'Under Warranty',  value: '31',    color: 'text-orange-600' },
        ],
    },
    {
        key: 'reports',
        label: 'Reports',
        icon: '📊',
        title: 'Reports & Analytics',
        desc: 'Get clear insights into your shop performance — revenue, technician productivity, and popular repairs.',
        features: [
            'Daily, weekly, monthly revenue reports',
            'Technician performance tracking',
            'Most common repair types',
            'Parts usage & cost analysis',
            'Customer retention metrics',
            'Export to PDF / Excel',
        ],
        preview: [
            { label: 'Monthly Revenue', value: '৳ 1,84,000', color: 'text-green-600' },
            { label: 'Jobs Completed',  value: '186',         color: 'text-blue-600' },
            { label: 'Top Repair',      value: 'Screen Fix',  color: 'text-cyan-600' },
            { label: 'Growth',          value: '+18%',        color: 'text-emerald-600' },
        ],
    },
];

export default function MobileServicing({ service }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const [activeTab, setActiveTab] = useState('jobcards');

    const tab = TABS.find(t => t.key === activeTab);
    const ctaHref = isLoggedIn
        ? '/dashboard'
        : `/login?redirect=${encodeURIComponent('/dashboard')}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Mobile Servicing — Software Center" />

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
            <section className="bg-gradient-to-br from-cyan-600 to-cyan-500 text-white py-16 px-6 md:px-20">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">← Back to Services</Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-5xl">📱</span>
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Mobile Servicing</h1>
                    <p className="text-white/80 text-lg max-w-2xl mb-8">
                        Complete mobile repair shop management — job cards, inventory, billing, and customer tracking in one system.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <Link href={ctaHref} className="bg-white text-cyan-700 hover:bg-cyan-50 font-semibold px-6 py-3 rounded-lg transition-colors">
                            {isLoggedIn ? 'Open Dashboard →' : 'Get Started →'}
                        </Link>
                        {!isLoggedIn && (
                            <Link href="/register" className="border border-white/50 text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-colors">
                                Create Free Account
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Module Tabs */}
            <section className="py-14 px-6 md:px-20 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Everything Your Repair Shop Needs</h2>
                    <p className="text-gray-500 mb-8">Explore each module below.</p>

                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === t.key
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                                }`}
                            >
                                <span>{t.icon}</span> {t.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="grid md:grid-cols-2 gap-8 items-start"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{tab.title}</h3>
                                <p className="text-gray-500 mb-5">{tab.desc}</p>
                                <ul className="space-y-2">
                                    {tab.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-cyan-500 font-bold mt-0.5">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-6">
                                <div className="text-sm font-semibold text-cyan-700 mb-4 uppercase tracking-wide">{tab.title} Overview</div>
                                <div className="grid grid-cols-2 gap-4">
                                    {tab.preview.map((p, i) => (
                                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                                            <div className={`text-2xl font-extrabold ${p.color}`}>{p.value}</div>
                                            <div className="text-xs text-gray-500 mt-1">{p.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 text-center bg-cyan-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Run your repair shop smarter</h2>
                <p className="text-gray-500 mb-6">
                    {isLoggedIn ? 'Access the mobile servicing module from your dashboard.' : 'Sign up free and get full access instantly.'}
                </p>
                <Link href={ctaHref} className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                    {isLoggedIn ? 'Open Dashboard →' : 'Get Started Free →'}
                </Link>
            </section>

            <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
                © {new Date().getFullYear()} Software Center. All Rights Reserved.
            </footer>
        </div>
    );
}
