<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resume Preview</title>
<style>
    /* ── Anti-piracy CSS ── */
    * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
    }
    body {
        margin: 0;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
        line-height: 1.6;
        color: #1f2937;
        background: #fff;
        /* Disable right-click context menu via CSS (JS handles the rest) */
        -webkit-touch-callout: none;
    }
    @media print {
        /* Block printing entirely */
        body { display: none !important; }
    }

    /* ── Watermark overlay — covers entire page, pointer-events off ── */
    .watermark-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 9999;
        pointer-events: none;
        overflow: hidden;
    }
    .watermark-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-35deg);
        font-size: 28px;
        font-weight: 700;
        color: rgba(99, 102, 241, 0.12);
        white-space: nowrap;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    /* Tiled watermark pattern */
    .watermark-tile {
        position: absolute;
        font-size: 13px;
        font-weight: 600;
        color: rgba(99, 102, 241, 0.07);
        white-space: nowrap;
        transform: rotate(-35deg);
        letter-spacing: 0.03em;
    }

    /* ── Resume styles ── */
    @php
        $style   = $resume->template->style_config ?? [];
        $layout  = $resume->template->layout ?? 'single-column';
        $isTwoCol = in_array($layout, ['two-column', 'sidebar-left', 'sidebar-right']);
        $accentColor = $style['accent_color'] ?? '#2563EB';
        $headerBg    = $style['header_bg']    ?? '#1E3A5F';
        $headerText  = $style['header_text']  ?? '#ffffff';
        $sidebarBg   = $style['sidebar_bg']   ?? '#F1F5F9';
        $sidebarText = $style['sidebar_text'] ?? '#1f2937';
    @endphp

    .header { background: {{ $headerBg }}; color: {{ $headerText }}; padding: 26px 30px; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 3px; }
    .header .job-title { font-size: 13px; opacity: 0.85; margin-bottom: 8px; }
    .header .contacts { font-size: 11px; opacity: 0.75; }
    .header .contacts span { margin-right: 14px; }
    .body-wrap { display: flex; }
    .main-col { flex: {{ $isTwoCol ? '0 0 62%' : '1' }}; padding: 22px 26px; }
    .side-col { flex: 0 0 38%; padding: 22px 18px; background: {{ $sidebarBg }}; color: {{ $sidebarText }}; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: {{ $accentColor }}; border-bottom: 1.5px solid {{ $accentColor }}; padding-bottom: 3px; margin-bottom: 10px; }
    .entry { margin-bottom: 11px; }
    .entry-row { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: 600; font-size: 12.5px; }
    .entry-date  { font-size: 10.5px; color: #6b7280; white-space: nowrap; margin-left: 8px; }
    .entry-sub   { font-size: 11.5px; color: #4b5563; margin-top: 1px; }
    .entry-desc  { font-size: 11.5px; color: #374151; margin-top: 4px; white-space: pre-line; }
    .summary { font-size: 12px; color: #374151; line-height: 1.7; margin-bottom: 18px; }
    .skill-item { margin-bottom: 5px; }
    .skill-name { font-size: 11.5px; font-weight: 500; }
    .bar-wrap { background: #e5e7eb; height: 4px; border-radius: 2px; margin-top: 2px; }
    .bar-fill { height: 4px; border-radius: 2px; background: {{ $accentColor }}; }
    .tag { display: inline-block; background: {{ $accentColor }}22; color: {{ $accentColor }}; font-size: 10px; padding: 2px 6px; border-radius: 8px; margin: 2px 2px 2px 0; }
    .lang-item { display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 5px; }
    .social-item { font-size: 11px; margin-bottom: 4px; }
</style>
</head>
<body
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
>

{{-- ── Watermark overlay ── --}}
<div class="watermark-overlay" aria-hidden="true">
    <div class="watermark-text">PREVIEW ONLY</div>
    @for($row = 0; $row < 8; $row++)
        @for($col = 0; $col < 5; $col++)
        <div class="watermark-tile" style="top:{{ $row * 130 + 40 }}px; left:{{ $col * 220 + 20 }}px;">
            {{ $watermark }}
        </div>
        @endfor
    @endfor
</div>

{{-- ── Resume content ── --}}
<div class="header">
    <h1>{{ $resume->full_name }}</h1>
    @if($resume->job_title)<div class="job-title">{{ $resume->job_title }}</div>@endif
    <div class="contacts">
        @if($resume->email)<span>✉ {{ $resume->email }}</span>@endif
        @if($resume->phone)<span>📞 {{ $resume->phone }}</span>@endif
        @if($resume->city || $resume->country)<span>📍 {{ collect([$resume->city, $resume->country])->filter()->implode(', ') }}</span>@endif
        @if($resume->website)<span>🌐 {{ $resume->website }}</span>@endif
    </div>
</div>

<div class="body-wrap">
    <div class="main-col">
        @if($resume->summary)<div class="summary">{{ $resume->summary }}</div>@endif

        @foreach($resume->sections->where('is_visible', true) as $section)
        <div class="section">
            <div class="section-title">{{ $section->title }}</div>
            @foreach($section->items as $item)
            <div class="entry">
                <div class="entry-row">
                    <div class="entry-title">{{ $item->title }}</div>
                    @if($item->start_date || $item->end_date)
                    <div class="entry-date">{{ $item->start_date }}{{ $item->start_date ? ' – ' : '' }}{{ $item->is_current ? 'Present' : $item->end_date }}</div>
                    @endif
                </div>
                @if($item->subtitle)<div class="entry-sub">{{ $item->subtitle }}{{ $item->location ? ' · '.$item->location : '' }}</div>@endif
                @if($item->description)<div class="entry-desc">{{ $item->description }}</div>@endif
            </div>
            @endforeach
        </div>
        @endforeach

        @if(!$isTwoCol && $resume->skills->count())
        <div class="section">
            <div class="section-title">Skills</div>
            @foreach($resume->skills as $skill)<span class="tag">{{ $skill->name }}</span>@endforeach
        </div>
        @endif
    </div>

    @if($isTwoCol)
    <div class="side-col">
        @if($resume->skills->count())
        <div class="section">
            <div class="section-title">Skills</div>
            @foreach($resume->skills->groupBy('category') as $cat => $skills)
                @if($cat)<div style="font-size:10.5px;font-weight:600;color:#6b7280;margin:6px 0 3px;">{{ $cat }}</div>@endif
                @foreach($skills as $skill)
                <div class="skill-item">
                    <div class="skill-name">{{ $skill->name }}</div>
                    @if($skill->level > 0)<div class="bar-wrap"><div class="bar-fill" style="width:{{ ($skill->level/5)*100 }}%"></div></div>@endif
                </div>
                @endforeach
            @endforeach
        </div>
        @endif
        @if($resume->languages->count())
        <div class="section">
            <div class="section-title">Languages</div>
            @foreach($resume->languages as $lang)
            <div class="lang-item"><span style="font-weight:500">{{ $lang->name }}</span><span style="color:#6b7280">{{ $lang->proficiency }}</span></div>
            @endforeach
        </div>
        @endif
        @if($resume->socialLinks->count())
        <div class="section">
            <div class="section-title">Links</div>
            @foreach($resume->socialLinks as $link)
            <div class="social-item"><strong style="text-transform:capitalize">{{ $link->platform }}</strong>: {{ $link->label ?: $link->url }}</div>
            @endforeach
        </div>
        @endif
    </div>
    @endif
</div>

<script>
    // Block keyboard shortcuts for copy/print/save
    document.addEventListener('keydown', function(e) {
        if (
            (e.ctrlKey || e.metaKey) &&
            ['c','a','s','p','u','j'].includes(e.key.toLowerCase())
        ) { e.preventDefault(); return false; }
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))) {
            e.preventDefault(); return false;
        }
    });
    // Block right-click
    document.addEventListener('contextmenu', e => e.preventDefault());
    // Block drag
    document.addEventListener('dragstart', e => e.preventDefault());
    // Detect DevTools open (basic heuristic)
    setInterval(function() {
        if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#6b7280;font-size:14px;">Preview unavailable while DevTools is open.</div>';
        }
    }, 1000);
</script>
</body>
</html>
