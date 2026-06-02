<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>{{ $resume->full_name }} — Resume</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: {{ $fontFamily ?? 'DejaVu Sans' }}, sans-serif;
        font-size: {{ $fontSize ?? '13px' }};
        line-height: {{ $lineHeight ?? '1.6' }};
        color: #1f2937;
        background: #fff;
    }
    a { color: {{ $accentColor ?? '#2563EB' }}; text-decoration: none; }

    /* ── Header ── */
    .header {
        background: {{ $headerBg ?? '#020202ff' }};
        color: {{ $headerText ?? '#ffffff' }};
        padding: 28px 32px;
    }
    .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .header .job-title { font-size: 14px; opacity: 0.85; margin-bottom: 10px; }
    .header .contact-row { font-size: 11px; opacity: 0.75; }
    .header .contact-row span { margin-right: 14px; }

    /* ── Two-column layout ── */
    .body-wrap { display: table; width: 100%; }
    .main-col  { display: table-cell; width: 62%; padding: 24px 28px; vertical-align: top; }
    .side-col  { display: table-cell; width: 38%; padding: 24px 20px; vertical-align: top;
                 background: {{ $sidebarBg ?? '#F1F5F9' }}; color: {{ $sidebarText ?? '#1f2937' }}; }

    /* ── Single-column layout ── */
    .single-col { padding: 24px 32px; }

    /* ── Section ── */
    .section { margin-bottom: 20px; }
    .section-title {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: {{ $accentColor ?? '#2563EB' }};
        border-bottom: 2px solid {{ $accentColor ?? '#2563EB' }};
        padding-bottom: 4px;
        margin-bottom: 12px;
    }

    /* ── Entry ── */
    .entry { margin-bottom: 12px; }
    .entry-header { display: table; width: 100%; }
    .entry-title  { display: table-cell; font-weight: 600; font-size: 13px; }
    .entry-date   { display: table-cell; text-align: right; font-size: 11px; color: #6b7280; white-space: nowrap; }
    .entry-sub    { font-size: 12px; color: #4b5563; margin-top: 1px; }
    .entry-desc   { font-size: 12px; color: #374151; margin-top: 5px; white-space: pre-line; }

    /* ── Skills ── */
    .skill-item { margin-bottom: 6px; }
    .skill-name { font-size: 12px; font-weight: 500; }
    .skill-bar-wrap { background: #e5e7eb; height: 5px; border-radius: 3px; margin-top: 3px; }
    .skill-bar-fill { height: 5px; border-radius: 3px; background: {{ $accentColor ?? '#2563EB' }}; }

    /* ── Tags (skills without bars) ── */
    .tag-wrap { margin-top: 4px; }
    .tag {
        display: inline-block;
        background: {{ $accentColor ?? '#2563EB' }}22;
        color: {{ $accentColor ?? '#2563EB' }};
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 10px;
        margin: 2px 2px 2px 0;
    }

    /* ── Summary ── */
    .summary { font-size: 12px; color: #374151; line-height: 1.7; margin-bottom: 20px; }

    /* ── Page break ── */
    .page-break { page-break-after: always; }
</style>
</head>
<body>
@yield('content')
</body>
</html>
