@php($seo = $page['props']['seo'] ?? ['robots' => 'noindex, nofollow'])
<title inertia>{{ $seo['title'] ?? config('app.name', 'Humi HRIS') }}</title>
<meta inertia="robots" name="robots" content="{{ $seo['robots'] }}">
@if (isset($seo['canonicalUrl']))
    <meta inertia="description" name="description" content="{{ $seo['description'] }}">
    <meta inertia="keywords" name="keywords" content="{{ $seo['keywords'] ?? '' }}">
    <link inertia="canonical" rel="canonical" href="{{ $seo['canonicalUrl'] }}">
    <meta inertia="og:type" property="og:type" content="{{ $seo['type'] }}">
    <meta inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
    <meta inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
    <meta inertia="og:url" property="og:url" content="{{ $seo['canonicalUrl'] }}">
    <meta inertia="og:site_name" property="og:site_name" content="Humi HRIS">
    <meta inertia="og:image" property="og:image" content="{{ $seo['imageUrl'] }}">
    <meta inertia="og:image:alt" property="og:image:alt" content="Humi HRIS">
    <meta inertia="og:locale" property="og:locale" content="id_ID">
    <meta inertia="twitter:card" name="twitter:card" content="summary_large_image">
    <meta inertia="twitter:title" name="twitter:title" content="{{ $seo['title'] }}">
    <meta inertia="twitter:description" name="twitter:description" content="{{ $seo['description'] }}">
    <meta inertia="twitter:image" name="twitter:image" content="{{ $seo['imageUrl'] }}">
    <meta inertia="twitter:image:alt" name="twitter:image:alt" content="Humi HRIS">
    @if (isset($seo['publishedTime']))
        <meta inertia="article:published_time" property="article:published_time" content="{{ $seo['publishedTime'] }}">
        <meta inertia="article:modified_time" property="article:modified_time" content="{{ $seo['modifiedTime'] }}">
    @endif
    <script inertia="structured-data" type="application/ld+json">{!! json_encode($seo['structuredData'], JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR) !!}</script>
@endif
