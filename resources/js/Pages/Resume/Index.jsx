import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const STATUS_STYLE = {
    draft:     'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    archived:  'bg-amber-100 text-amber-700',
};

function ResumeCard({ resume, onDelete }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{resume.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{resume.full_name}{resume.job_title ? ` · ${resume.job_title}` : ''}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${STATUS_STYLE[resume.status] ?? STATUS_STYLE.draft}`}>
                    {resume.status}
                </span>
            </div>

            {/* Template badge */}
            {resume.template && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                        {resume.template.name}
                    </span>
                    <span className="capitalize">{resume.template.layout?.replace('-', ' ')}</span>
                </div>
            )}

            {/* Date */}
            <p className="text-xs text-gray-400">
                Created {new Date(resume.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-gray-100">
                <Link
                    href={route('resume.edit', resume.id)}
                    className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
                >
                    Edit
                </Link>
                <Link
                    href={route('resume.preview', resume.id)}
                    className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
                >
                    Preview
                </Link>
                {resume.is_public && resume.status === 'published' && (
                    <a
                        href={`/r/${resume.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium py-1.5 rounded-lg transition-colors"
                    >
                        View
                    </a>
                )}
                <button
                    onClick={() => onDelete(resume)}
                    className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm rounded-lg transition-colors"
                    aria-label="Delete resume"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function Index({ auth, resumes }) {
    const handleDelete = (resume) => {
        if (!confirm(`Delete "${resume.title}"? This cannot be undone.`)) return;
        router.delete(route('resume.destroy', resume.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">My Resumes</h2>}
        >
            <Head title="My Resumes" />

            <div className="space-y-5">
                {/* Header bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href={route('resume.templates')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Resume
                    </Link>
                </div>

                {resumes.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
                        <div className="text-5xl mb-4">📄</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No resumes yet</h3>
                        <p className="text-gray-400 text-sm mb-6">Create your first resume in minutes with our guided builder.</p>
                        <Link
                            href={route('resume.templates')}
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                        >
                            Build My Resume →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {resumes.map(resume => (
                            <ResumeCard key={resume.id} resume={resume} onDelete={handleDelete} />
                        ))}

                        {/* Add new card */}
                        <Link
                            href={route('resume.templates')}
                            className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-500 min-h-[180px]"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm font-medium">New Resume</span>
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
