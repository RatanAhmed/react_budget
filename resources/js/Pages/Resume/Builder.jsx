import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// ── Helpers ───────────────────────────────────────────────────────────────────
const SECTION_TYPE_LABELS = {
    experience:    'Work Experience',
    education:     'Education',
    certification: 'Certifications',
    project:       'Projects',
    volunteer:     'Volunteer',
    award:         'Awards',
    publication:   'Publications',
    reference:     'References',
    custom:        'Custom Section',
};

const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS);

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

const PLATFORMS = ['linkedin', 'github', 'twitter', 'portfolio', 'stackoverflow', 'behance', 'dribbble', 'other'];

function Field({ label, error, children }) {
    return (
        <div>
            {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
            {children}
            {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
        </div>
    );
}

function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
            {...props}
        />
    );
}

function Textarea({ className = '', ...props }) {
    return (
        <textarea
            className={`w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${className}`}
            rows={3}
            {...props}
        />
    );
}

function Select({ children, className = '', ...props }) {
    return (
        <select
            className={`w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

function SectionBadge({ children }) {
    return (
        <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">{children}</span>
    );
}

// ── Personal Info Panel ───────────────────────────────────────────────────────
function PersonalInfoPanel({ resume }) {
    const { data, setData, patch, processing, errors } = useForm({
        full_name: resume.full_name ?? '',
        job_title: resume.job_title ?? '',
        email:     resume.email ?? '',
        phone:     resume.phone ?? '',
        address:   resume.address ?? '',
        city:      resume.city ?? '',
        country:   resume.country ?? '',
        website:   resume.website ?? '',
        summary:   resume.summary ?? '',
    });

    const save = (e) => {
        e.preventDefault();
        patch(route('resume.update', resume.id), { preserveScroll: true });
    };

    return (
        <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full Name *" error={errors.full_name}>
                    <Input value={data.full_name} onChange={e => setData('full_name', e.target.value)} placeholder="Md. Ratan Howlader" />
                </Field>
                <Field label="Job Title" error={errors.job_title}>
                    <Input value={data.job_title} onChange={e => setData('job_title', e.target.value)} placeholder="Sr. Software Engineer" />
                </Field>
                <Field label="Email" error={errors.email}>
                    <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="you@example.com" />
                </Field>
                <Field label="Phone" error={errors.phone}>
                    <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+880 1926 166341" />
                </Field>
                <Field label="City" error={errors.city}>
                    <Input value={data.city} onChange={e => setData('city', e.target.value)} placeholder="Dhaka" />
                </Field>
                <Field label="Country" error={errors.country}>
                    <Input value={data.country} onChange={e => setData('country', e.target.value)} placeholder="Bangladesh" />
                </Field>
                <Field label="Address" error={errors.address}>
                    <Input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="638/Ka, Moghbazar" />
                </Field>
                <Field label="Website / Portfolio" error={errors.website}>
                    <Input value={data.website} onChange={e => setData('website', e.target.value)} placeholder="https://portfolio.ratan.com.bd" />
                </Field>
            </div>
            <Field label="Professional Summary" error={errors.summary}>
                <Textarea rows={4} value={data.summary} onChange={e => setData('summary', e.target.value)} placeholder="Brief overview of your experience and goals..." />
            </Field>
            <div className="flex justify-end">
                <button type="submit" disabled={processing}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                    {processing ? 'Saving…' : 'Save Info'}
                </button>
            </div>
        </form>
    );
}

// ── Section Item Form ─────────────────────────────────────────────────────────
function SectionItemForm({ resumeId, sectionId, item, onDone }) {
    const isEdit = !!item;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title:       item?.title ?? '',
        subtitle:    item?.subtitle ?? '',
        location:    item?.location ?? '',
        start_date:  item?.start_date ?? '',
        end_date:    item?.end_date ?? '',
        is_current:  item?.is_current ?? false,
        description: item?.description ?? '',
        url:         item?.url ?? '',
    });

    const save = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onDone };
        if (isEdit) {
            patch(route('resume.sections.items.update', [resumeId, sectionId, item.id]), opts);
        } else {
            post(route('resume.sections.items.store', [resumeId, sectionId]), opts);
        }
    };

    return (
        <form onSubmit={save} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title *" error={errors.title}>
                    <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Job title / Degree / Project name" required />
                </Field>
                <Field label="Subtitle" error={errors.subtitle}>
                    <Input value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} placeholder="Company / Institution / Issuer" />
                </Field>
                <Field label="Start Date" error={errors.start_date}>
                    <Input value={data.start_date} onChange={e => setData('start_date', e.target.value)} placeholder="Jan 2020" />
                </Field>
                <Field label="End Date" error={errors.end_date}>
                    <Input value={data.end_date} onChange={e => setData('end_date', e.target.value)} placeholder="Present" disabled={data.is_current} />
                </Field>
                <Field label="Location" error={errors.location}>
                    <Input value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Dhaka, Bangladesh" />
                </Field>
                <Field label="URL (optional)" error={errors.url}>
                    <Input value={data.url} onChange={e => setData('url', e.target.value)} placeholder="https://github.com/..." />
                </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={data.is_current} onChange={e => setData('is_current', e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
                Currently working here
            </label>
            <Field label="Description / Bullet Points" error={errors.description}>
                <Textarea rows={4} value={data.description} onChange={e => setData('description', e.target.value)} placeholder="• Describe your responsibilities and achievements..." />
            </Field>
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onDone} className="border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm px-4 py-1.5 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
                    {processing ? 'Saving…' : isEdit ? 'Update' : 'Add Entry'}
                </button>
            </div>
        </form>
    );
}

// ── Single Section Panel ──────────────────────────────────────────────────────
function SectionPanel({ resumeId, section }) {
    const [addingItem, setAddingItem] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const deleteItem = (item) => {
        if (!confirm('Remove this entry?')) return;
        router.delete(route('resume.sections.items.destroy', [resumeId, section.id, item.id]), { preserveScroll: true });
    };

    const deleteSection = () => {
        if (!confirm(`Remove the "${section.title}" section?`)) return;
        router.delete(route('resume.sections.destroy', [resumeId, section.id]), { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <SectionBadge>{SECTION_TYPE_LABELS[section.type] ?? section.type}</SectionBadge>
                    <span className="font-medium text-gray-800 text-sm">{section.title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setAddingItem(true)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition">
                        + Add
                    </button>
                    <button onClick={deleteSection}
                        className="text-xs border border-red-200 text-red-400 hover:bg-red-50 px-2 py-1 rounded-lg transition ml-1">
                        Remove
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Existing items */}
                {section.items?.map(item => (
                    <div key={item.id}>
                        {editingItem?.id === item.id ? (
                            <SectionItemForm resumeId={resumeId} sectionId={section.id} item={item} onDone={() => setEditingItem(null)} />
                        ) : (
                            <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="min-w-0">
                                    <p className="font-medium text-sm text-gray-800">{item.title}</p>
                                    {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                                    {(item.start_date || item.end_date) && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {item.start_date}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}
                                            {item.is_current ? 'Present' : item.end_date}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => setEditingItem(item)}
                                        className="text-xs border border-gray-200 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition">Edit</button>
                                    <button onClick={() => deleteItem(item)}
                                        className="text-xs border border-red-200 text-red-400 hover:bg-red-50 px-2 py-1 rounded transition">✕</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {section.items?.length === 0 && !addingItem && (
                    <p className="text-sm text-gray-400 text-center py-4">No entries yet. Click "+ Add" to start.</p>
                )}

                {addingItem && (
                    <SectionItemForm resumeId={resumeId} sectionId={section.id} item={null} onDone={() => setAddingItem(false)} />
                )}
            </div>
        </div>
    );
}

// ── Sections Panel ────────────────────────────────────────────────────────────
function SectionsPanel({ resume }) {
    const [addingSection, setAddingSection] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ type: 'experience', title: '' });

    const addSection = (e) => {
        e.preventDefault();
        post(route('resume.sections.store', resume.id), {
            preserveScroll: true,
            onSuccess: () => { reset(); setAddingSection(false); },
        });
    };

    return (
        <div className="space-y-4">
            {resume.sections?.map(section => (
                <SectionPanel key={section.id} resumeId={resume.id} section={section} />
            ))}

            {addingSection ? (
                <form onSubmit={addSection} className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
                    <h4 className="font-medium text-gray-700 text-sm">Add New Section</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Section Type">
                            <Select value={data.type} onChange={e => {
                                setData('type', e.target.value);
                                setData('title', SECTION_TYPE_LABELS[e.target.value] ?? '');
                            }}>
                                {SECTION_TYPES.map(t => <option key={t} value={t}>{SECTION_TYPE_LABELS[t]}</option>)}
                            </Select>
                        </Field>
                        <Field label="Section Title">
                            <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Section heading" required />
                        </Field>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setAddingSection(false)} className="border border-gray-300 text-gray-600 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
                            {processing ? 'Adding…' : 'Add Section'}
                        </button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setAddingSection(true)}
                    className="w-full border-2 border-dashed border-gray-200 hover:border-indigo-300 text-gray-400 hover:text-indigo-500 rounded-xl py-4 text-sm font-medium transition-colors">
                    + Add Section
                </button>
            )}
        </div>
    );
}

// ── Skills Panel ──────────────────────────────────────────────────────────────
function SkillsPanel({ resume }) {
    const [skills, setSkills] = useState(resume.skills ?? []);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 3 });

    const addSkill = () => {
        if (!newSkill.name.trim()) return;
        setSkills(prev => [...prev, { ...newSkill, id: Date.now() }]);
        setNewSkill({ name: '', category: '', level: 3 });
    };

    const removeSkill = (id) => setSkills(prev => prev.filter(s => s.id !== id));

    const syncSkills = () => {
        setSaving(true);
        router.post(route('resume.skills.sync', resume.id), { skills }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            {/* Add skill row */}
            <div className="flex gap-2 flex-wrap">
                <Input className="flex-1 min-w-32" value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} placeholder="Skill name (e.g. Laravel)" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <Input className="w-32" value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))} placeholder="Category" />
                <Select className="w-28" value={newSkill.level} onChange={e => setNewSkill(p => ({ ...p, level: Number(e.target.value) }))}>
                    <option value={0}>No bar</option>
                    <option value={1}>Beginner</option>
                    <option value={2}>Elementary</option>
                    <option value={3}>Intermediate</option>
                    <option value={4}>Advanced</option>
                    <option value={5}>Expert</option>
                </Select>
                <button onClick={addSkill} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg transition">Add</button>
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                    <div key={skill.id} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full">
                        <span>{skill.name}</span>
                        {skill.level > 0 && <span className="text-indigo-400 text-xs">{'●'.repeat(skill.level)}{'○'.repeat(5 - skill.level)}</span>}
                        <button onClick={() => removeSkill(skill.id)} className="text-indigo-300 hover:text-red-500 ml-1 transition">✕</button>
                    </div>
                ))}
                {skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
            </div>

            <div className="flex justify-end">
                <button onClick={syncSkills} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
                    {saving ? 'Saving…' : 'Save Skills'}
                </button>
            </div>
        </div>
    );
}

// ── Languages Panel ───────────────────────────────────────────────────────────
function LanguagesPanel({ resume }) {
    const [name, setName] = useState('');
    const [proficiency, setProficiency] = useState('Fluent');

    const add = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        router.post(route('resume.sections.store', resume.id), {}, { preserveScroll: true });
        // Use direct fetch for languages (no dedicated controller route needed — reuse pattern)
        router.post(`/resume/${resume.id}/languages`, { name, proficiency }, { preserveScroll: true, onSuccess: () => setName('') });
    };

    const remove = (id) => {
        router.delete(`/resume/${resume.id}/languages/${id}`, { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={add} className="flex gap-2 flex-wrap">
                <Input className="flex-1 min-w-32" value={name} onChange={e => setName(e.target.value)} placeholder="Language (e.g. English)" />
                <Select className="w-40" value={proficiency} onChange={e => setProficiency(e.target.value)}>
                    {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg transition">Add</button>
            </form>

            <div className="space-y-2">
                {resume.languages?.map(lang => (
                    <div key={lang.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <div>
                            <span className="font-medium text-sm text-gray-800">{lang.name}</span>
                            <span className="text-xs text-gray-400 ml-2">{lang.proficiency}</span>
                        </div>
                        <button onClick={() => remove(lang.id)} className="text-gray-300 hover:text-red-500 transition text-sm">✕</button>
                    </div>
                ))}
                {(!resume.languages || resume.languages.length === 0) && (
                    <p className="text-sm text-gray-400">No languages added yet.</p>
                )}
            </div>
        </div>
    );
}

// ── Social Links Panel ────────────────────────────────────────────────────────
function SocialLinksPanel({ resume }) {
    const [platform, setPlatform] = useState('linkedin');
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');

    const add = (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        router.post(`/resume/${resume.id}/social-links`, { platform, url, label }, {
            preserveScroll: true,
            onSuccess: () => { setUrl(''); setLabel(''); },
        });
    };

    const remove = (id) => {
        router.delete(`/resume/${resume.id}/social-links/${id}`, { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select value={platform} onChange={e => setPlatform(e.target.value)}>
                    {PLATFORMS.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </Select>
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://linkedin.com/in/..." required />
                <div className="flex gap-2">
                    <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional)" />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg transition flex-shrink-0">Add</button>
                </div>
            </form>

            <div className="space-y-2">
                {resume.social_links?.map(link => (
                    <div key={link.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                            <span className="font-medium text-sm text-gray-800 capitalize">{link.platform}</span>
                            <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline ml-2 truncate">{link.url}</a>
                        </div>
                        <button onClick={() => remove(link.id)} className="text-gray-300 hover:text-red-500 transition text-sm ml-2 flex-shrink-0">✕</button>
                    </div>
                ))}
                {(!resume.social_links || resume.social_links.length === 0) && (
                    <p className="text-sm text-gray-400">No social links added yet.</p>
                )}
            </div>
        </div>
    );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ resume }) {
    const { data, setData, patch, processing } = useForm({
        title:     resume.title ?? '',
        status:    resume.status ?? 'draft',
        is_public: resume.is_public ?? false,
    });

    const save = (e) => {
        e.preventDefault();
        patch(route('resume.update', resume.id), { preserveScroll: true });
    };

    return (
        <form onSubmit={save} className="space-y-4">
            <Field label="Resume Title">
                <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="My Software Engineer Resume" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                    <Select value={data.status} onChange={e => setData('status', e.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </Select>
                </Field>
                <Field label="Public Link">
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox" checked={data.is_public} onChange={e => setData('is_public', e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
                        <span className="text-sm text-gray-600">Enable shareable link</span>
                    </label>
                </Field>
            </div>
            {data.is_public && resume.status === 'published' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm">
                    <p className="text-indigo-700 font-medium mb-1">Public URL</p>
                    <a href={`/r/${resume.slug}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline break-all">
                        {window.location.origin}/r/{resume.slug}
                    </a>
                </div>
            )}
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
                    {processing ? 'Saving…' : 'Save Settings'}
                </button>
            </div>
        </form>
    );
}

// ── Main Builder Page ─────────────────────────────────────────────────────────
const TABS = [
    { key: 'personal',  label: 'Personal Info', icon: '👤' },
    { key: 'sections',  label: 'Sections',      icon: '📋' },
    { key: 'skills',    label: 'Skills',         icon: '⚡' },
    { key: 'languages', label: 'Languages',      icon: '🌐' },
    { key: 'social',    label: 'Social Links',   icon: '🔗' },
    { key: 'settings',  label: 'Settings',       icon: '⚙️' },
];

export default function Builder({ auth, resume }) {
    const [activeTab, setActiveTab] = useState('personal');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('resume.index')} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h2 className="font-semibold text-lg text-gray-800 leading-tight">{resume.title}</h2>
                        <p className="text-xs text-gray-400">{resume.template?.name} · {resume.template?.layout?.replace('-', ' ')}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Editing: ${resume.title}`} />

            <div className="space-y-5">
                {/* Tab bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-1 flex flex-wrap gap-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}

                    {/* Template switcher */}
                    <div className="ml-auto flex items-center gap-1">
                        <Link
                            href={route('resume.preview', resume.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white bg-teal-600 hover:bg-teal-700 transition"
                        >
                            👁 <span className="hidden sm:inline">Preview & Download</span>
                        </Link>
                        <Link
                            href={route('resume.templates')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition border border-gray-200"
                        >
                            🎨 <span className="hidden sm:inline">Switch Template</span>
                        </Link>
                    </div>
                </div>

                {/* Panel content */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                    {activeTab === 'personal'  && <PersonalInfoPanel resume={resume} />}
                    {activeTab === 'sections'  && <SectionsPanel resume={resume} />}
                    {activeTab === 'skills'    && <SkillsPanel resume={resume} />}
                    {activeTab === 'languages' && <LanguagesPanel resume={resume} />}
                    {activeTab === 'social'    && <SocialLinksPanel resume={resume} />}
                    {activeTab === 'settings'  && <SettingsPanel resume={resume} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
