import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, Head } from '@inertiajs/react';

const TABS = [
    {
        key: 'templates',
        label: 'Templates',
        icon: '🎨',
        title: 'Professional Templates',
        desc: 'Start with a polished, ATS-friendly template. Every design is crafted to pass automated screening and impress hiring managers.',
        features: [
            'Modern, classic, and creative layouts',
            'ATS-optimized structure',
            'One-click template switching',
            'Color scheme customization',
            'Font & spacing controls',
            'Mobile-preview before export',
        ],
        preview: [
            { label: 'Templates Available', value: '24',    color: 'text-teal-600' },
            { label: 'ATS Pass Rate',        value: '98%',   color: 'text-green-600' },
            { label: 'Most Used',            value: 'Modern Clean', color: 'text-blue-600' },
            { label: 'Custom Colors',        value: '∞',     color: 'text-purple-600' },
        ],
    },
    {
        key: 'experience',
        label: 'Experience',
        icon: '💼',
        title: 'Work Experience',
        desc: 'Add your work history with guided prompts. Get bullet-point suggestions to describe your achievements effectively.',
        features: [
            'Multiple job entries with date ranges',
            'Role, company & location fields',
            'Achievement bullet-point builder',
            'Action verb suggestions',
            'Gap detection & tips',
            'Drag-to-reorder entries',
        ],
        preview: [
            { label: 'Avg Entries',       value: '3–5',    color: 'text-teal-600' },
            { label: 'Bullet Suggestions', value: '200+',  color: 'text-blue-600' },
            { label: 'Action Verbs',       value: '150+',  color: 'text-green-600' },
            { label: 'Reorderable',        value: 'Yes',   color: 'text-purple-600' },
        ],
    },
    {
        key: 'education',
        label: 'Education',
        icon: '🎓',
        title: 'Education & Certifications',
        desc: 'Showcase your academic background and professional certifications with clean, structured formatting.',
        features: [
            'Degree, institution & graduation year',
            'GPA / CGPA display option',
            'Certifications with issuer & date',
            'Online course & bootcamp support',
            'Honors & awards section',
            'Multiple entries with reorder',
        ],
        preview: [
            { label: 'Sections',          value: '3',     color: 'text-teal-600' },
            { label: 'Cert Formats',      value: '10+',   color: 'text-blue-600' },
            { label: 'GPA Display',       value: 'Optional', color: 'text-green-600' },
            { label: 'Reorderable',       value: 'Yes',   color: 'text-purple-600' },
        ],
    },
    {
        key: 'skills',
        label: 'Skills',
        icon: '⚡',
        title: 'Skills & Keywords',
        desc: 'Highlight your technical and soft skills. Get keyword suggestions based on your target job title to beat ATS filters.',
        features: [
            'Technical & soft skill categories',
            'Proficiency level indicators',
            'Job-title-based keyword suggestions',
            'ATS keyword density checker',
            'Language proficiency section',
            'Skill grouping & reorder',
        ],
        preview: [
            { label: 'Skill Categories',  value: '6',     color: 'text-teal-600' },
            { label: 'Keyword Database',  value: '5,000+', color: 'text-blue-600' },
            { label: 'ATS Score',         value: 'Live',  color: 'text-green-600' },
            { label: 'Languages',         value: 'Yes',   color: 'text-purple-600' },
        ],
    },
    {
        key: 'coverletter',
        label: 'Cover Letter',
        icon: '✉️',
        title: 'Cover Letter Builder',
        desc: 'Generate a tailored cover letter that complements your resume. Customize tone, length, and content for each application.',
        features: [
            'Auto-fill from resume data',
            'Job description paste & match',
            'Tone selector (formal, friendly, confident)',
            'Paragraph-by-paragraph editing',
            'Multiple cover letter profiles',
            'PDF export matching resume style',
        ],
        preview: [
            { label: 'Templates',         value: '12',    color: 'text-teal-600' },
            { label: 'Tone Options',      value: '3',     color: 'text-blue-600' },
            { label: 'Auto-fill Fields',  value: '15+',   color: 'text-green-600' },
            { label: 'Export Formats',    value: 'PDF, DOCX', color: 'text-purple-600' },
        ],
    },
    {
        key: 'export',
        label: 'Export',
        icon: '📥',
        title: 'Export & Share',
        desc: 'Download your finished resume in multiple formats, share a live link, or print directly — ready to send in seconds.',
        features: [
            'PDF export (print-ready)',
            'DOCX export for editing',
            'Shareable public link',
            'One-page auto-fit option',
            'Multiple resume profiles saved',
            'Version history & restore',
        ],
        preview: [
            { label: 'Export Formats',    value: 'PDF, DOCX', color: 'text-teal-600' },
            { label: 'Saved Profiles',    value: 'Unlimited', color: 'text-blue-600' },
            { label: 'Share Link',        value: 'Yes',       color: 'text-green-600' },
            { label: 'Version History',   value: 'Yes',       color: 'text-purple-600' },
        ],
    },
];

const STEPS = [
    { step: '01', title: 'Pick a Template',    desc: 'Choose from 24 ATS-friendly designs.' },
    { step: '02', title: 'Fill Your Details',  desc: 'Guided sections for experience, education, and skills.' },
    { step: '03', title: 'Customize & Polish', desc: 'Adjust colors, fonts, and layout to your taste.' },
    { step: '04', title: 'Export & Apply',     desc: 'Download as PDF or DOCX and start applying.' },
];

export default function ResumeBuilder({ service }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const [activeTab, setActiveTab] = useState('templates');

    const tab = TABS.find(t => t.key === activeTab);
    const ctaHref = isLoggedIn
        ? '/resume/templates'
        : `/login?redirect=${encodeURIComponent('/resume/templates')}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Resume Builder — Software Center" />

            {/* Nav */}
            <header className="bg-white border-b border-gray-200 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="text-xl font-bold text-blue-600">Software Center</Link>
                <div className="flex gap-2">
                    {isLoggedIn ? (
                        <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login"    className="border border-gray-300 text-gray-600 hover:border-blue-400 px-4 py-2 rounded-lg text-sm font-medium">Login</Link>
                            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Register</Link>
                        </>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-600 to-teal-500 text-white py-16 px-6 md:px-20">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">← Back to Services</Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-5xl">📄</span>
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">New</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Resume Builder</h1>
                    <p className="text-white/80 text-lg max-w-2xl mb-8">
                        Create a professional, ATS-friendly resume in minutes. Smart templates, guided sections, and one-click PDF export.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <Link href={ctaHref} className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-6 py-3 rounded-lg transition-colors">
                            {isLoggedIn ? 'Build My Resume →' : 'Get Started Free →'}
                        </Link>
                        {!isLoggedIn && (
                            <Link href="/register" className="border border-white/50 text-white hover:bg-white/10 px-6 py-3 rounded-lg transition-colors">
                                Create Free Account
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-14 px-6 md:px-20 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">How It Works</h2>
                    <p className="text-gray-500 text-center mb-10">Build your resume in 4 simple steps.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map((s, i) => (
                            <motion.div
                                key={s.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-teal-600 text-white text-lg font-extrabold flex items-center justify-center mx-auto mb-3">
                                    {s.step}
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
                                <p className="text-sm text-gray-500">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Module Tabs */}
            <section className="py-14 px-6 md:px-20 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Explore Every Feature</h2>
                    <p className="text-gray-500 mb-8">Everything you need to build a standout resume.</p>

                    {/* Tab bar */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === t.key
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-200'
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
                            {/* Left */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{tab.title}</h3>
                                <p className="text-gray-500 mb-5">{tab.desc}</p>
                                <ul className="space-y-2">
                                    {tab.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-teal-500 font-bold mt-0.5">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right: mock stats */}
                            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                                <div className="text-sm font-semibold text-teal-700 mb-4 uppercase tracking-wide">{tab.title} at a Glance</div>
                                <div className="grid grid-cols-2 gap-4">
                                    {tab.preview.map((p, i) => (
                                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                                            <div className={`text-xl font-extrabold ${p.color}`}>{p.value}</div>
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
            <section className="py-16 px-6 text-center bg-white">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Your next job starts with a great resume</h2>
                <p className="text-gray-500 mb-6">
                    {isLoggedIn
                        ? 'Access the Resume Builder from your dashboard and start building.'
                        : 'Create a free account and build your resume in minutes.'}
                </p>
                <Link
                    href={ctaHref}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                    {isLoggedIn ? 'Build My Resume →' : 'Get Started Free →'}
                </Link>
            </section>

            <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
                © {new Date().getFullYear()} Software Center. All Rights Reserved.
            </footer>
        </div>
    );
}
