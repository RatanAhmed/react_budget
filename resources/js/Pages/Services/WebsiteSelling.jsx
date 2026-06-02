import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

const TABS = [
    {
        key: 'ecommerce',
        label: 'Ecommerce',
        icon: '🏪',
        title: 'Online Store',
        desc: 'Launch a beautiful, mobile-friendly online store. Showcase your products, accept orders, and grow your sales online.',
        features: [
            'Customizable storefront & branding',
            'Product pages with images, variants & descriptions',
            'Shopping cart & secure checkout',
            'Customer accounts & order history',
            'Product search & filtering',
            'SEO-friendly product URLs',
        ],
        preview: [
            { label: 'Products Listed', value: '248',    color: 'text-violet-600' },
            { label: 'Online Orders',   value: '1,340',  color: 'text-blue-600' },
            { label: 'Conversion Rate', value: '3.8%',   color: 'text-green-600' },
            { label: 'Avg Order Value', value: '৳ 1,240', color: 'text-orange-600' },
        ],
    },
    {
        key: 'pos',
        label: 'POS',
        icon: '🖥️',
        title: 'Point of Sale',
        desc: 'Sell in-store and online from the same system. Inventory stays in sync automatically across all channels.',
        features: [
            'Unified in-store & online inventory',
            'Barcode scanning support',
            'Multiple payment methods',
            'Discount & coupon application',
            'Receipt printing & email',
            'End-of-day cash reconciliation',
        ],
        preview: [
            { label: 'In-Store Sales Today', value: '৳ 18,400', color: 'text-green-600' },
            { label: 'Transactions',         value: '42',        color: 'text-blue-600' },
            { label: 'Avg Transaction',      value: '৳ 438',     color: 'text-orange-600' },
            { label: 'Returns',              value: '2',         color: 'text-red-500' },
        ],
    },
    {
        key: 'inventory',
        label: 'Inventory',
        icon: '📦',
        title: 'Inventory Management',
        desc: 'Manage stock across your online store and physical shop from one place. Never oversell or run out.',
        features: [
            'Unified stock across online & offline',
            'Low-stock alerts & reorder points',
            'Supplier & purchase order management',
            'Product variants (size, color, etc.)',
            'Stock adjustment & audit logs',
            'Bulk import via CSV',
        ],
        preview: [
            { label: 'Total SKUs',    value: '312',  color: 'text-violet-600' },
            { label: 'Low Stock',     value: '14',   color: 'text-red-500' },
            { label: 'Out of Stock',  value: '3',    color: 'text-red-700' },
            { label: 'Suppliers',     value: '18',   color: 'text-green-600' },
        ],
    },
    {
        key: 'orders',
        label: 'Orders',
        icon: '📬',
        title: 'Order Management',
        desc: 'Track, fulfill, and manage every customer order from placement to delivery — online and in-store.',
        features: [
            'Unified order queue (online + in-store)',
            'Order status tracking & updates',
            'Shipping label generation',
            'Delivery partner integration',
            'Refund & return management',
            'Bulk order processing',
        ],
        preview: [
            { label: 'Pending',    value: '18',  color: 'text-yellow-600' },
            { label: 'Processing', value: '24',  color: 'text-blue-600' },
            { label: 'Shipped',    value: '56',  color: 'text-green-600' },
            { label: 'Delivered',  value: '1,240', color: 'text-gray-500' },
        ],
    },
    {
        key: 'payments',
        label: 'Payments',
        icon: '💳',
        title: 'Payments & Finance',
        desc: 'Accept payments online and in-store. Full reconciliation, refund management, and payout tracking.',
        features: [
            'Card, mobile money & cash support',
            'Online payment gateway integration',
            'Automatic payment reconciliation',
            'Refund & chargeback management',
            'Payout scheduling',
            'Tax calculation & invoicing',
        ],
        preview: [
            { label: 'This Month Revenue', value: '৳ 4,28,000', color: 'text-green-600' },
            { label: 'Pending Payouts',    value: '৳ 12,400',   color: 'text-orange-600' },
            { label: 'Refunds',            value: '৳ 2,100',    color: 'text-red-500' },
            { label: 'Payment Methods',    value: '5',           color: 'text-blue-600' },
        ],
    },
    {
        key: 'analytics',
        label: 'Analytics',
        icon: '📊',
        title: 'Sales Analytics',
        desc: 'Understand what sells, who buys, and when. Make data-driven decisions to grow your business.',
        features: [
            'Revenue & sales trend charts',
            'Top-selling products & categories',
            'Customer acquisition & retention',
            'Traffic & conversion funnel',
            'Channel comparison (online vs in-store)',
            'Export to PDF / Excel',
        ],
        preview: [
            { label: 'Monthly Revenue',  value: '৳ 4,28,000', color: 'text-green-600' },
            { label: 'New Customers',    value: '184',         color: 'text-blue-600' },
            { label: 'Top Product',      value: 'T-Shirt XL',  color: 'text-violet-600' },
            { label: 'Growth',           value: '+22%',        color: 'text-emerald-600' },
        ],
    },
];

export default function WebsiteSelling({ service }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const [activeTab, setActiveTab] = useState('ecommerce');

    const tab = TABS.find(t => t.key === activeTab);
    const ctaHref = isLoggedIn
        ? '/dashboard'
        : `/login?redirect=${encodeURIComponent('/dashboard')}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Website Selling — Software Center" />

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
            <section className="bg-gradient-to-br from-violet-600 to-violet-500 text-white py-16 px-6 md:px-20">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">← Back to Services</Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-5xl">🛒</span>
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">New</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Website Selling</h1>
                    <p className="text-white/80 text-lg max-w-2xl mb-8">
                        Launch your online store with ecommerce, POS, inventory, payments, and analytics — all in one platform.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <Link href={ctaHref} className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-6 py-3 rounded-lg transition-colors">
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Everything You Need to Sell Online</h2>
                    <p className="text-gray-500 mb-8">Explore each module below.</p>

                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === t.key
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600'
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
                                            <span className="text-violet-500 font-bold mt-0.5">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
                                <div className="text-sm font-semibold text-violet-700 mb-4 uppercase tracking-wide">{tab.title} Overview</div>
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
            <section className="py-16 px-6 text-center bg-violet-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Start selling online today</h2>
                <p className="text-gray-500 mb-6">
                    {isLoggedIn ? 'Access the website selling module from your dashboard.' : 'Sign up free and launch your store in minutes.'}
                </p>
                <Link href={ctaHref} className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                    {isLoggedIn ? 'Open Dashboard →' : 'Get Started Free →'}
                </Link>
            </section>

            <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
                © {new Date().getFullYear()} Software Center. All Rights Reserved.
            </footer>
        </div>
    );
}
