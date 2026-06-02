@php
    $style   = $resume->template->style_config ?? [];
    $config  = $resume->template->sections_config ?? [];
    $layout  = $resume->template->layout ?? 'single-column';
    $isTwoCol = in_array($layout, ['two-column', 'sidebar-left', 'sidebar-right']);

    $accentColor = $style['accent_color'] ?? '#2563EB';
    $headerBg    = $style['header_bg']    ?? '#1E3A5F';
    $headerText  = $style['header_text']  ?? '#ffffff';
    $sidebarBg   = $style['sidebar_bg']   ?? '#F1F5F9';
    $sidebarText = $style['sidebar_text'] ?? '#1f2937';
    $fontSize    = $style['font_size_base'] ?? '13px';
    $lineHeight  = $style['line_height']    ?? '1.6';
    $fontFamily  = match($resume->template->font_family ?? 'Inter') {
        'Merriweather', 'Georgia' => 'DejaVu Serif',
        default                   => 'DejaVu Sans',
    };

    $sidebarSections = $config['sidebar_sections'] ?? [];
    $mainSections    = $resume->sections->filter(fn($s) => $s->is_visible);
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>{{ $resume->full_name }} — Resume</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "{{ $fontFamily }}", sans-serif; font-size: {{ $fontSize }}; line-height: {{ $lineHeight }}; color: #1f2937; background: #fff; }
    a { color: {{ $accentColor }}; text-decoration: none; }
    .header { background: {{ $headerBg }}; color: {{ $headerText }}; padding: 26px 30px; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 3px; }
    .header .job-title { font-size: 13px; opacity: 0.85; margin-bottom: 8px; }
    .header .contacts { font-size: 10.5px; opacity: 0.75; }
    .header .contacts span { margin-right: 12px; }
    .body-wrap { display: table; width: 100%; }
    .main-col  { display: table-cell; width: {{ $isTwoCol ? '62%' : '100%' }}; padding: 22px 26px; vertical-align: top; }
    .side-col  { display: table-cell; width: 38%; padding: 22px 18px; vertical-align: top; background: {{ $sidebarBg }}; color: {{ $sidebarText }}; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: {{ $accentColor }}; border-bottom: 1.5px solid {{ $accentColor }}; padding-bottom: 3px; margin-bottom: 10px; }
    .entry { margin-bottom: 11px; }
    .entry-row { display: table; width: 100%; }
    .entry-title { display: table-cell; font-weight: 600; font-size: 12.5px; }
    .entry-date  { display: table-cell; text-align: right; font-size: 10.5px; color: #6b7280; white-space: nowrap; }
    .entry-sub   { font-size: 11.5px; color: #4b5563; margin-top: 1px; }
    .entry-desc  { font-size: 11.5px; color: #374151; margin-top: 4px; white-space: pre-line; }
    .summary { font-size: 12px; color: #374151; line-height: 1.7; margin-bottom: 18px; }
    .skill-item { margin-bottom: 5px; }
    .skill-name { font-size: 11.5px; font-weight: 500; }
    .bar-wrap { background: #e5e7eb; height: 4px; border-radius: 2px; margin-top: 2px; }
    .bar-fill { height: 4px; border-radius: 2px; background: {{ $accentColor }}; }
    .tag-wrap { margin-top: 3px; }
    .tag { display: inline-block; background: {{ $accentColor }}22; color: {{ $accentColor }}; font-size: 10px; padding: 2px 6px; border-radius: 8px; margin: 2px 2px 2px 0; }
    .lang-item { display: table; width: 100%; margin-bottom: 5px; font-size: 11.5px; }
    .lang-name  { display: table-cell; font-weight: 500; }
    .lang-level { display: table-cell; text-align: right; color: #6b7280; }
    .social-item { font-size: 11px; margin-bottom: 4px; }
</style>
</head>
<body>

{{-- ── Header ── --}}
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

{{-- ── Body ── --}}
<div class="body-wrap">

    {{-- ── Main column ── --}}
    <div class="main-col">

        @if($resume->summary)
        <div class="summary">{{ $resume->summary }}</div>
        @endif

        @foreach($mainSections as $section)
        <div class="section">
            <div class="section-title">{{ $section->title }}</div>
            @foreach($section->items as $item)
            <div class="entry">
                <div class="entry-row">
                    <div class="entry-title">{{ $item->title }}</div>
                    @if($item->start_date || $item->end_date)
                    <div class="entry-date">
                        {{ $item->start_date }}{{ $item->start_date ? ' – ' : '' }}{{ $item->is_current ? 'Present' : $item->end_date }}
                    </div>
                    @endif
                </div>
                @if($item->subtitle)<div class="entry-sub">{{ $item->subtitle }}{{ $item->location ? ' · ' . $item->location : '' }}</div>@endif
                @if($item->description)<div class="entry-desc">{{ $item->description }}</div>@endif
            </div>
            @endforeach
        </div>
        @endforeach

    </div>

    {{-- ── Sidebar (only for multi-column layouts) ── --}}
    @if($isTwoCol)
    <div class="side-col">

        {{-- Skills --}}
        @if($resume->skills->count())
        <div class="section">
            <div class="section-title">Skills</div>
            @php $grouped = $resume->skills->groupBy('category'); @endphp
            @foreach($grouped as $cat => $skills)
                @if($cat)<div style="font-size:10.5px;font-weight:600;color:#6b7280;margin-bottom:4px;margin-top:6px;">{{ $cat }}</div>@endif
                @foreach($skills as $skill)
                <div class="skill-item">
                    <div class="skill-name">{{ $skill->name }}</div>
                    @if($skill->level > 0)
                    <div class="bar-wrap"><div class="bar-fill" style="width:{{ ($skill->level / 5) * 100 }}%"></div></div>
                    @endif
                </div>
                @endforeach
            @endforeach
        </div>
        @endif

        {{-- Languages --}}
        @if($resume->languages->count())
        <div class="section">
            <div class="section-title">Languages</div>
            @foreach($resume->languages as $lang)
            <div class="lang-item">
                <div class="lang-name">{{ $lang->name }}</div>
                <div class="lang-level">{{ $lang->proficiency }}</div>
            </div>
            @endforeach
        </div>
        @endif

        {{-- Social Links --}}
        @if($resume->socialLinks->count())
        <div class="section">
            <div class="section-title">Links</div>
            @foreach($resume->socialLinks as $link)
            <div class="social-item">
                <span style="font-weight:500;text-transform:capitalize;">{{ $link->platform }}</span>:
                <a href="{{ $link->url }}">{{ $link->label ?: $link->url }}</a>
            </div>
            @endforeach
        </div>
        @endif

    </div>
    @endif

</div>

{{-- Single-column: skills/languages below sections --}}
@if(!$isTwoCol)
<div style="padding: 0 26px 22px;">
    @if($resume->skills->count())
    <div class="section">
        <div class="section-title">Skills</div>
        <div class="tag-wrap">
            @foreach($resume->skills as $skill)
            <span class="tag">{{ $skill->name }}</span>
            @endforeach
        </div>
    </div>
    @endif
    @if($resume->languages->count())
    <div class="section">
        <div class="section-title">Languages</div>
        @foreach($resume->languages as $lang)
        <div class="lang-item"><div class="lang-name">{{ $lang->name }}</div><div class="lang-level">{{ $lang->proficiency }}</div></div>
        @endforeach
    </div>
    @endif
</div>
@endif

</body>
</html>
