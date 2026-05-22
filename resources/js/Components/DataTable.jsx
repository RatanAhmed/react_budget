import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';

/**
 * DataTable — reusable table with custom columns, pagination, and mobile card view.
 *
 * Props
 * ─────
 * columns      Array<{ key, label, render?, className?, headerClassName?, mobileLabel? }>
 *              - key          : unique identifier (also used as fallback data accessor)
 *              - label        : column header text
 *              - render(row)  : optional custom cell renderer, receives the full row object
 *              - className    : td className
 *              - headerClassName : th className
 *              - mobileLabel  : label shown in mobile card view (defaults to label)
 *              - hideOnMobile : if true, field is omitted from mobile card view
 *
 * data         Array of row objects  OR  Laravel paginator object
 *              When a Laravel paginator is passed (has .data + .links), server-side
 *              pagination links are rendered. Otherwise client-side pagination is used.
 *
 * rowKey       string | function(row) — unique key per row (default: 'id')
 *
 * perPage      number — rows per page for client-side pagination (default: 15)
 *
 * emptyText    string — shown when there are no rows (default: 'No records found.')
 *
 * className    extra className on the wrapper div
 *
 * onRowClick   function(row) — optional row click handler (desktop table row)
 */
export default function DataTable({
    columns = [],
    data = [],
    rowKey = 'id',
    perPage = 15,
    emptyText = 'No records found.',
    className = '',
    onRowClick,
}) {
    // ── Detect Laravel paginator ──────────────────────────────────────────────
    const isServerPaginated =
        data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.data);

    const rows = isServerPaginated ? data.data : data;
    const serverLinks = isServerPaginated ? data.links : null;
    const serverMeta = isServerPaginated
        ? { from: data.from, to: data.to, total: data.total, currentPage: data.current_page, lastPage: data.last_page }
        : null;

    // ── Client-side pagination ────────────────────────────────────────────────
    const [page, setPage] = useState(1);

    const clientRows = useMemo(() => {
        if (isServerPaginated) return rows;
        const start = (page - 1) * perPage;
        return rows.slice(start, start + perPage);
    }, [rows, page, perPage, isServerPaginated]);

    const totalPages = isServerPaginated
        ? serverMeta.lastPage
        : Math.max(1, Math.ceil(rows.length / perPage));

    const currentPage = isServerPaginated ? serverMeta.currentPage : page;

    const displayRows = isServerPaginated ? rows : clientRows;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getKey = (row, idx) =>
        typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] ?? idx);

    const getCell = (col, row) =>
        typeof col.render === 'function' ? col.render(row) : row[col.key];

    // ── Page range for pagination buttons ────────────────────────────────────
    const pageRange = useMemo(() => {
        const delta = 2;
        const range = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);

        range.push(1);
        if (left > 2) range.push('...');
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push('...');
        if (totalPages > 1) range.push(totalPages);

        return range;
    }, [currentPage, totalPages]);

    // ── From / To counts ─────────────────────────────────────────────────────
    const fromCount = isServerPaginated
        ? serverMeta.from
        : rows.length === 0 ? 0 : (page - 1) * perPage + 1;
    const toCount = isServerPaginated
        ? serverMeta.to
        : Math.min(page * perPage, rows.length);
    const totalCount = isServerPaginated ? serverMeta.total : rows.length;

    // ── Pagination controls ───────────────────────────────────────────────────
    const PaginationBar = () => {
        if (totalPages <= 1 && !isServerPaginated) return null;

        const btnBase =
            'inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400';
        const btnActive = 'bg-indigo-600 text-white shadow-sm';
        const btnInactive = 'text-gray-600 hover:bg-gray-100';
        const btnDisabled = 'text-gray-300 cursor-not-allowed';

        // Server-side: render <Link> for each paginator link
        if (isServerPaginated) {
            const prev = data.prev_page_url;
            const next = data.next_page_url;

            return (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 order-2 sm:order-1">
                        Showing <span className="font-medium">{fromCount}</span>–<span className="font-medium">{toCount}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> results
                    </p>
                    <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                        {/* Prev */}
                        {prev ? (
                            <Link href={prev} className={`${btnBase} ${btnInactive}`} preserveScroll>
                                <ChevronLeft />
                            </Link>
                        ) : (
                            <span className={`${btnBase} ${btnDisabled}`}><ChevronLeft /></span>
                        )}

                        {/* Page numbers from server links (filter out prev/next) */}
                        {serverLinks
                            .filter((l) => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;')
                            .map((l, i) => {
                                if (l.label === '...') {
                                    return <span key={i} className={`${btnBase} ${btnDisabled}`}>…</span>;
                                }
                                return l.active ? (
                                    <span key={i} className={`${btnBase} ${btnActive}`}>{l.label}</span>
                                ) : (
                                    <Link key={i} href={l.url} className={`${btnBase} ${btnInactive}`} preserveScroll>
                                        {l.label}
                                    </Link>
                                );
                            })}

                        {/* Next */}
                        {next ? (
                            <Link href={next} className={`${btnBase} ${btnInactive}`} preserveScroll>
                                <ChevronRight />
                            </Link>
                        ) : (
                            <span className={`${btnBase} ${btnDisabled}`}><ChevronRight /></span>
                        )}
                    </div>
                </div>
            );
        }

        // Client-side pagination
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 order-2 sm:order-1">
                    Showing <span className="font-medium">{fromCount}</span>–<span className="font-medium">{toCount}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                </p>
                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft />
                    </button>

                    {pageRange.map((p, i) =>
                        p === '...' ? (
                            <span key={`ellipsis-${i}`} className={`${btnBase} ${btnDisabled}`}>…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
                                aria-current={p === currentPage ? 'page' : undefined}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
                        aria-label="Next page"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`w-full ${className}`}>
            {/* ── Desktop table (hidden on xs/sm) ── */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.headerClassName ?? ''}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {displayRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center text-gray-400 text-sm"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            displayRows.map((row, idx) => (
                                <tr
                                    key={getKey(row, idx)}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    className={`transition-colors hover:bg-indigo-50/40 ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-3 py-2.5 text-gray-700 ${col.className ?? ''}`}
                                        >
                                            {getCell(col, row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile card list (visible on xs/sm) ── */}
            <div className="md:hidden space-y-3">
                {displayRows.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-400 text-sm">
                        {emptyText}
                    </div>
                ) : (
                    displayRows.map((row, idx) => (
                        <div
                            key={getKey(row, idx)}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            className={`rounded-lg border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 ${onRowClick ? 'cursor-pointer active:bg-indigo-50' : ''}`}
                        >
                            {columns
                                .filter((col) => !col.hideOnMobile)
                                .map((col) => (
                                    <div key={col.key} className="flex items-start justify-between gap-2 px-4 py-2.5">
                                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0 w-28">
                                            {col.mobileLabel ?? col.label}
                                        </span>
                                        <span className={`text-sm text-gray-700 text-right ${col.className ?? ''}`}>
                                            {getCell(col, row)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    ))
                )}
            </div>

            {/* ── Pagination ── */}
            <PaginationBar />
        </div>
    );
}

// ── Tiny icon helpers (no extra dep) ─────────────────────────────────────────
function ChevronLeft() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}
