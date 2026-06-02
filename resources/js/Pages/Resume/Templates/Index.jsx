import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const CATEGORY_LABELS = {
    all:          'All Templates',
    professional: 'Professional',
    minimal:      'Minimal',
    creative:     'Creative',
    executive:    'Executive',
    academic:     'Academic',
};

const LAYOUT_ICONS = {
    'single-column': '▬',
    'two-column':    '⬛',
    'sidebar-left':  '◧',
    'sidebar-right': '◨',
};

const COLOR_MAP = {
    blue:   { bg: 'bg-blue-600',   ring: 'ring-blue-400',   text: 'text-blue-600'   },
    gray:   { bg: 'bg-gray-500',   ring: 'ring-gray-400',   text: 'text-gray-600'   },
    purple: { bg: 'bg-purple-600', ring: 'ring-purple-400', text: 'text-purple-600' },
    dark:   { bg: 'bg-gray-900',   ring: 'ring-gray-600',   text: 'text-gray-800'   },
    green:  { bg: 'bg-emerald-600',ring: 'ring-emerald-400',text: 'text-emerald-600'},
    teal:   { bg: 'bg-teal-600',   ring: 'ring-teal-400',   text: 'text-teal-600'   },
    rose:   { bg: 'bg-rose-500',   ring: 'ring-rose-400',   text: 'text-rose-600'   },
    indigo: { bg: 'bg-indigo-600', ring: 'ring-indigo-400', text: 'text-indigo-600' },
    orange: { bg: 'bg-orange-500', ring: 'ring-orange-400', text: 'text-orange-600' },
    black:  { bg: 'bg-gray-950',   ring: 'ring-gray-700',   text: 'text-gray-900'   },
};

function TemplateMockup({ template }) {
    const color = COLOR_MAP[template.color_scheme] ?? COLOR_MAP.blue;
    const isTwoCol = template.layout === 'two-column';
    const isSidebarLeft  = template.layout === 'sidebar-left';
    const isSidebarRight = template.layout === 'sidebar-right';
    const hasSidebar = isTwoCol || isSidebarLeft || isSidebarRight;

    return (
        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col text-[4px] select-none">
            {/* Header bar */}
            <div className={`${color.bg} px-2 py-1.5 flex-shrink-0`}>
                <div className="bg-white/30 rounded h-1 w-16 mb-0.5" />
                <div className="bg-white/20 rounded h-0.5 w-10" />
            </div>

            {/* Body */}
            <div className={`flex flex-1 overflow-hidden ${isSidebarRight ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Sidebar */}
                {hasSidebar && (
                    <div className={`${isTwoCol ? 'w-2/5' : 'w-1/3'} ${color.bg} opacity-10 flex-shrink-0`} />
                )}
                {/* Main content lines */}
                <div className="flex-1 p-1.5 space-y-1">
                    {[80, 60, 90, 50, 70, 55, 65].map((w, i) => (
                        <div key={i} className="bg-gray-200 rounded" style={{ height: 2, width: `${w}%` }} />
                    ))}
                    <div className={`h-0.5 ${color.bg} opacity-40 w-full mt-1`} />
                    {[75, 55, 85, 45].map((w, i) => (
                        <div key={i} className="bg-gray-200 rounded" style={{ height: 2, width: `${w}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TemplateCard({ template, onSelect }) {
    const color = COLOR_MAP[template.color_scheme] ?? COLOR_MAP.blue;

    return (
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
            {/* Mockup preview */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
                <TemplateMockup template={template} />
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">{template.name}</h3>
                    <div className="flex gap-1 flex-shrink-0">
                        {template.is_premium && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">PRO</span>
                        )}
                        <span className={`${color.bg} text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize`}>
                            {template.color_scheme}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-gray-500 mb-3 flex-1 line-clamp-2">{template.description}</p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3">
                    <span title={template.layout}>{LAYOUT_ICONS[template.layout] ?? '▬'} {template.layout?.replace('-', ' ')}</span>
                    <span className="capitalize">{template.category}</span>
                </div>

                <button
                    onClick={() => onSelect(template)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                    Use This Template
                </button>
            </div>
        </div>
    );
}

export default function Index({ auth, templates }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState(null);
    const [title, setTitle] = useState('');
    const [fullName, setFullName] = useState(auth.user?.name ?? '');
    const [jobTitle, setJobTitle] = useState('');
    const [email, setEmail] = useState(auth.user?.email ?? '');
    const [errors, setErrors] = useState({});

    const categories = ['all', ...new Set(templates.map(t => t.category))];

    const filtered = activeCategory === 'all'
        ? templates
        : templates.filter(t => t.category === activeCategory);

    const handleSelect = (template) => {
        setSelected(template);
        setCreating(true);
        setErrors({});
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const errs = {};
        if (!title.trim())    errs.title    = 'Resume title is required.';
        if (!fullName.trim()) errs.fullName = 'Your name is required.';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        router.post(route('resume.store'), {
            resume_template_id: selected.id,
            title:    title.trim(),
            full_name: fullName.trim(),
            job_title: jobTitle.trim(),
            email:    email.trim(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">Resume Builder</h2>}
        >
            <Head title="Choose a Template — Resume Builder" />

            <div className="space-y-6">
                {/* Page header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-1">Choose Your Template</h1>
                    <p className="text-teal-100 text-sm">Pick a design to get started. You can switch templates anytime.</p>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                activeCategory === cat
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                        >
                            {CATEGORY_LABELS[cat] ?? cat}
                        </button>
                    ))}
                </div>

                {/* Template grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(template => (
                        <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-400">No templates in this category.</div>
                )}
            </div>

            {/* Create resume modal */}
            {creating && selected && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Start Your Resume</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Using: <span className="font-medium text-indigo-600">{selected.name}</span></p>
                            </div>
                            <button
                                onClick={() => setCreating(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Software Engineer Resume"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Md. Ratan Howlader"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                        placeholder="Sr. Software Engineer"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                                >
                                    Create Resume →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
