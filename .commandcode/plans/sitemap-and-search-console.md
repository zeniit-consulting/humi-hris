# Sitemap.xml & Google Search Console Support Plan

## Current State Analysis

### Existing SEO Infrastructure (Already Implemented)

| Component | Status | Location |
|-----------|--------|----------|
| `robots.txt` | ✅ Complete | `routes/web.php` (inline route) |
| `sitemap.xml` | ✅ Complete | `routes/web.php` + `resources/views/sitemap.blade.php` |
| SEO Head Component | ✅ Complete | `resources/js/components/seo-head.tsx` |
| Google Analytics 4 | ✅ Complete | `resources/views/app.blade.php` (G-05GPX3DNS1) |
| Meta Pixel (Facebook) | ✅ Complete | `resources/views/app.blade.php` |
| PWA Manifest | ✅ Complete | `/manifest.webmanifest` |
| Favicon & Icons | ✅ Complete | `/icons/` directory |
| Apple Touch Icons | ✅ Complete | `app.blade.php` |
| Theme Color | ✅ Complete | `#006069` |
| Structured Data | ✅ Complete | `SeoHead` component supports JSON-LD |
| SEO Tests | ✅ Complete | `tests/Feature/SeoInfrastructureTest.php` |

### Current Sitemap Coverage

The existing sitemap at `/sitemap.xml` includes:
1. **Homepage** (`/`) - Priority 1.0, changefreq weekly
2. **Careers Page** (`/careers`) - Priority 0.6, changefreq daily
3. **Active Job Vacancies** (`/careers/{slug}`) - Priority 0.5, changefreq weekly
   - Only published vacancies with no closing date or future closing date
   - Limited to 500 entries
   - Uses `updated_at` for lastmod

### Current robots.txt Coverage

Blocks these private paths from all crawlers:
- `/dashboard`, `/admin`, `/billing`, `/client`, `/hris`, `/portal`
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/two-factor-challenge`

Supports these crawlers:
- `*` (all crawlers)
- `Googlebot`, `Googlebot-Image`
- `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`
- `PerplexityBot`, `ClaudeBot`, `Claude-SearchBot`, `Applebot`

---

## Improvements Needed

### 1. Add Missing Public Pages to Sitemap

The `/docs` route (documentation manual) is public but not included in the sitemap.

**File to modify:** `routes/web.php`

**Current sitemap route (lines 88-114):**
```php
Route::get('sitemap.xml', function () {
    $baseUrl = rtrim((string) config('app.url'), '/');
    $urls = [
        [
            'loc' => $baseUrl,
            'priority' => '1.0',
            'changefreq' => 'weekly',
            'lastmod' => now()->toAtomString(),
        ],
        [
            'loc' => $baseUrl.'/careers',
            'priority' => '0.6',
            'changefreq' => 'daily',
            'lastmod' => now()->toAtomString(),
        ],
    ];
    // ... job vacancies
});
```

**Add after careers entry:**
```php
[
    'loc' => $baseUrl.'/docs',
    'priority' => '0.4',
    'changefreq' => 'weekly',
    'lastmod' => now()->toAtomString(),
],
```

### 2. Google Search Console Verification

Google Search Console requires one of these verification methods:

#### Option A: HTML Meta Tag (Recommended)

Add to `resources/views/app.blade.php` inside `<head>`:

```html
<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
```

**Note:** Replace `YOUR_VERIFICATION_CODE_HERE` with the actual verification code from Google Search Console.

#### Option B: HTML File Upload

Create file: `public/googleXXXXXXXXXXXXXXXX.html` (filename varies)

Content:
```html
google-site-verification: googleXXXXXXXXXXXXXXXX.html
```

#### Option C: DNS TXT Record

Add TXT record to DNS:
```
google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Add Canonical URL Headers to Sitemap

The sitemap already uses canonical URLs, but we should ensure all pages have proper canonical tags.

**Already implemented** in `SeoHead` component via:
```tsx
<link head-key="canonical" rel="canonical" href={canonicalUrl} />
```

### 4. Structured Data Enhancements

The `SeoHead` component already supports structured data. Current implementation in `welcome.tsx` includes:
- Organization schema
- WebSite schema  
- SoftwareApplication schema

**Recommendation:** Add BreadcrumbList structured data for better search appearance.

---

## Implementation Tasks

### Task 1: Update Sitemap Route

**File:** `routes/web.php`

Add the `/docs` page to the sitemap URLs array:

```php
$urls = [
    [
        'loc' => $baseUrl,
        'priority' => '1.0',
        'changefreq' => 'weekly',
        'lastmod' => now()->toAtomString(),
    ],
    [
        'loc' => $baseUrl.'/careers',
        'priority' => '0.6',
        'changefreq' => 'daily',
        'lastmod' => now()->toAtomString(),
    ],
    [
        'loc' => $baseUrl.'/docs',
        'priority' => '0.4',
        'changefreq' => 'weekly',
        'lastmod' => now()->toAtomString(),
    ],
];
```

### Task 2: Add Google Search Console Verification

**File:** `resources/views/app.blade.php`

Add after line 13 (after application-name meta tag):

```html
<meta name="google-site-verification" content="{{ config('services.google.search_console_verification') }}" />
```

**File:** `config/services.php`

Add to the array:

```php
'google' => [
    'search_console_verification' => env('GOOGLE_SEARCH_CONSOLE_VERIFICATION', ''),
],
```

**File:** `.env.example`

Add:
```
GOOGLE_SEARCH_CONSOLE_VERIFICATION=
```

### Task 3: Update Test Coverage

**File:** `tests/Feature/SeoInfrastructureTest.php`

Add test for docs page in sitemap:

```php
public function test_sitemap_includes_docs_page(): void
{
    config(['app.url' => 'https://humi.test']);

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertSee('<loc>https://humi.test/docs</loc>', false);
}
```

---

## Google Search Console Setup Steps

1. **Go to:** https://search.google.com/search-console

2. **Add Property:**
   - Select "URL prefix" option
   - Enter: `https://your-domain.com`

3. **Choose Verification Method:**
   - **Recommended:** HTML tag (copy the meta tag content value)
   - Paste the content value into `.env` as `GOOGLE_SEARCH_CONSOLE_VERIFICATION`

4. **Submit Sitemap:**
   - In Search Console, go to "Sitemaps" section
   - Enter: `sitemap.xml`
   - Click "Submit"

5. **Verify robots.txt:**
   - Search Console will automatically detect robots.txt
   - Check "robots.txt Tester" tool to verify blocking rules

6. **Monitor Coverage:**
   - Check "Coverage" report for indexing status
   - Check "Core Web Vitals" for performance metrics
   - Check "Mobile Usability" for mobile issues

---

## Files Summary

### Files to Modify (3 files)

| File | Changes |
|------|---------|
| `routes/web.php` | Add `/docs` to sitemap URLs array |
| `resources/views/app.blade.php` | Add Google Search Console verification meta tag |
| `config/services.php` | Add google.search_console_verification config |
| `.env.example` | Add GOOGLE_SEARCH_CONSOLE_VERIFICATION placeholder |
| `tests/Feature/SeoInfrastructureTest.php` | Add test for docs page in sitemap |

### Existing Files (No Changes Needed)

| File | Purpose |
|------|---------|
| `resources/views/sitemap.blade.php` | XML template for sitemap |
| `resources/js/components/seo-head.tsx` | React SEO component |
| `tests/Feature/SeoInfrastructureTest.php` | Existing SEO tests |
| `public/manifest.webmanifest` | PWA manifest |
| `public/icons/*` | Favicon and app icons |
| `public/robots.txt` | Not needed - served via route |

---

## Verification Checklist

After implementation, verify:

- [ ] `/sitemap.xml` returns valid XML with `/docs` entry
- [ ] `/robots.txt` returns correct text with sitemap reference
- [ ] Homepage has canonical tag pointing to root URL
- [ ] Careers page has canonical tag
- [ ] Job vacancy pages have canonical tags
- [ ] Docs page has canonical tag
- [ ] All public pages have proper meta description
- [ ] All public pages have Open Graph tags
- [ ] Google Search Console verification tag is present in HTML source
- [ ] Run `php artisan test --filter=SeoInfrastructureTest` - all tests pass
- [ ] Submit sitemap to Google Search Console
- [ ] Verify no private paths are indexable

---

## Additional SEO Recommendations (Optional)

1. **Add hreflang tags** if supporting multiple languages
2. **Implement breadcrumb structured data** for better SERP appearance
3. **Add FAQ structured data** to docs pages if applicable
4. **Create video sitemap** if adding video content
5. **Implement AMP** for faster mobile loading (optional)
6. **Add local business schema** with Indonesian address
