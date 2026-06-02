import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

const TABS = [
    {
        key: 'pos',
        label: 'POS',
        icon: '🖥️',
        title: 'Point of Sale',
        desc: 'A fast, touch-friendly POS built for busy restaurants. Handle dine-in, takeaway, and delivery orders from one screen.',
        features: [
            'Table-based order management',
            'Split bills & multiple payment methods',
            'Discount & coupon support',
            'Kitchen display system integration',
            'Real-time order status updates',
            'End-of-day cash reconciliation',
        ],
        preview: [
            { label: 'Orders Today',   value: '142',    color: 'text-orange-600' },
            { label: 'Revenue Today',  value: '৳ 28,400', color: 'text-green-600' },
            { label: 'Open Tables',    value: '8 / 20',  color: 'text-blue-600' },
            { label: 'Pending Orders', value: '5',       color: 'text-red-500' },
        ],
    },
    {
        key: 'menu',
        label: 'Menu Manager',
        icon: '📋',
        title: 'Menu Manager',
        desc: 'Build and update your menu with categories, prices, images, and availability — no technical skills needed.',
        features: [
            'Unlimited menu categories & items',
            'Item images and descriptions',
            'Price & availability toggle',
            'Combo & set meal builder',
            'Seasonal menu scheduling',
            'Multi-language menu support',
        ],
        preview: [
            { label: 'Menu Items',    value: '86',   color: 'text-orange-600' },
            { label: 'Categories',    value: '12',   color: 'text-blue-600' },
            { label: 'Active Items',  value: '74',   color: 'text-green-600' },
            { label: 'Combos',        value: '8',    color: 'text-purple-600' },
        ],
    },
    {
        key: 'orders',
        label: 'Orders',
        icon: '🛎️',
        title: 'Order Management',
        desc: 'Track every order from placement to delivery. Manage dine-in, takeaway, and online orders in one unified view.',
        features: [
            'Real-time order queue',
            'Order status tracking (New → Preparing → Ready → Served)',
            'Delivery assignment & tracking',
            'Order history & re-order',
            'Customer order notes',
            'Refund & cancellation management',
        ],
        preview: [
            { label: 'New',       value: '5',  color: 'text-blue-600' },
            { label: 'Preparing', value: '8',  color: 'text-yellow-600' },
            { label: 'Ready',     value: '3',  color: 'text-green-600' },
            { label: 'Delivered', value: '126', color: 'text-gray-500' },
        ],
    },
    {
        key: 'inventory',
        label: 'Inventory',
        icon: '📦',
        title: 'Inventory & Stock',
        desc: 'Track ingredients and supplies in real time. Get low-stock alerts before you run out.',
        features: [
            'Ingredient-level stock tracking',
            'Automatic deduction on order',
            'Reorder level alerts',
            'Supplier management',
            'Purchase order creation',
            'Wastage & spoilage logging',
        ],
        preview: [
            { label: 'Total Items',   value: '234',  color: 'text-blue-600' },
            { label: 'Low Stock',     value: '7',    color: 'text-red-500' },
            { label: 'Suppliers',     value: '14',   color: 'text-green-600' },
            { label: 'Pending POs',   value: '3',    color: 'text-orange-600' },
        ],
    },
    {
        key: 'staff',
        label: 'Staff',
        icon: '👨‍🍳',
        title: 'Staff Management',
        desc: 'Manage your team — roles, shifts, attendance, and performance — all in one place.',
        features: [
            'Role-based access (Admin, Manager, Waiter, Chef)',
            'Shift scheduling & roster',
            'Attendance tracking',
            'Sales performance per staff',
            'Payroll summary export',
            'Staff activity logs',
        ],
        preview: [
            { label: 'Total Staff',   value: '18',  color: 'text-blue-600' },
            { label: 'On Shift',      value: '11',  color: 'text-green-600' },
            { label: 'On Leave',      value: '2',   color: 'text-yellow-600' },
            { label: 'Roles',         value: '4',   color: 'text-purple-600' },
        ],
    },
    {
        key: 'analytics',
        label: 'Analytics',
        icon: '📊',
        title: 'Analytics & Reports',
        desc: 'Understand your business with daily, weekly, and monthly reports on revenue, top items, and peak hours.',
        features: [
            'Daily & monthly revenue reports',
            'Top-selling items ranking',
            'Peak hour analysis',
            'Category-wise sales breakdown',
            'Staff performance reports',
            'Export to PDF / Excel',
        ],
        preview: [
            { label: 'This Month Revenue', value: '৳ 3,84,200', color: 'text-green-600' },
            { label: 'Avg Daily Orders',   value: '138',         color: 'text-blue-600' },
            { label: 'Top Item',           value: 'Chicken Rice', color: 'text-orange-600' },
            { label: 'Growth',             value: '+12%',         color: 'text-emerald-600' },
        ],
    },
];

export default function RestaurantBusiness({ service }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const [activeTab, setActiveTab] = useState('pos');

    const tab = TABS.find(t => t.key === activeTab);
    const ctaHref = isLoggedIn
        ? '/dashboard'
        : `/login?redirect=${encodeURIComponent('/dashboard')}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Restaurant Business — Software Center" />

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
            <section className="bg-gradient-to-br from-orange-600 to-orange-500 text-white py-16 px-6 md:px-20">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">← Back to Services</Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-5xl">🍽️</span>
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">New</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Restaurant Business</h1>
                    <p className="text-white/80 text-lg max-w-2xl mb-8">
                        Full-featured restaurant management — POS, menu, orders, inventory, staff, and analytics in one platform.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <Link href={ctaHref} className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-6 py-3 rounded-lg transition-colors">
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Everything Your Restaurant Needs</h2>
                    <p className="text-gray-500 mb-8">Explore each module below.</p>

                    {/* Tab bar */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === t.key
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                            >
                                <span>{t.icon}</span> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="grid md:grid-cols-2 gap-8 items-start"
                        >
                            {/* Left: description + features */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{tab.title}</h3>
                                <p className="text-gray-500 mb-5">{tab.desc}</p>
                                <ul className="space-y-2">
                                    {tab.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-orange-500 font-bold mt-0.5">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right: mock stats card */}
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                                <div className="text-sm font-semibold text-orange-700 mb-4 uppercase tracking-wide">{tab.title} Overview</div>
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
            <section className="py-16 px-6 text-center bg-orange-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Start managing your restaurant today</h2>
                <p className="text-gray-500 mb-6">
                    {isLoggedIn ? 'Access the restaurant module from your dashboard.' : 'Sign up free and get full access instantly.'}
                </p>
                <Link href={ctaHref} className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                    {isLoggedIn ? 'Open Dashboard →' : 'Get Started Free →'}
                </Link>
            </section>

            <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
                © {new Date().getFullYear()} Software Center. All Rights Reserved.
            </footer>
        </div>
    );
}
