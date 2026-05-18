<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $title }}</title>
        <meta
            name="description"
            content="Dokumentasi operasional admin HRIS untuk onboarding user baru."
        >
        @vite(['resources/css/app.css'])
        <style>
            :root {
                color-scheme: light;
            }

            body {
                background:
                    radial-gradient(circle at top left, rgba(0, 96, 105, 0.12), transparent 28%),
                    linear-gradient(180deg, #f4f8f9 0%, #eef4f5 100%);
            }

            .docs-shell {
                max-width: 1440px;
                margin: 0 auto;
            }

            .docs-prose h1,
            .docs-prose h2,
            .docs-prose h3 {
                scroll-margin-top: 2rem;
            }

            .docs-prose h1 {
                font-size: 2rem;
                line-height: 1.1;
                font-weight: 700;
                color: #102629;
                margin-bottom: 1.25rem;
            }

            .docs-prose h2 {
                margin-top: 2.75rem;
                margin-bottom: 1rem;
                font-size: 1.45rem;
                line-height: 1.2;
                font-weight: 700;
                color: #173337;
            }

            .docs-prose h3 {
                margin-top: 2rem;
                margin-bottom: 0.75rem;
                font-size: 1.1rem;
                line-height: 1.35;
                font-weight: 700;
                color: #214549;
            }

            .docs-prose p,
            .docs-prose li {
                color: #38575b;
                line-height: 1.75;
            }

            .docs-prose p {
                margin-bottom: 1rem;
            }

            .docs-prose ul,
            .docs-prose ol {
                margin: 0 0 1.25rem 1.25rem;
            }

            .docs-prose li + li {
                margin-top: 0.35rem;
            }

            .docs-prose code {
                background: rgba(15, 63, 67, 0.07);
                color: #0f3f43;
                border-radius: 0.45rem;
                padding: 0.12rem 0.45rem;
                font-size: 0.92em;
            }

            .docs-prose strong {
                color: #173337;
            }

            .toc-link {
                border-left: 2px solid transparent;
                transition: all 180ms ease;
            }

            .toc-link:hover {
                border-left-color: #006069;
                background: rgba(0, 96, 105, 0.06);
                color: #173337;
            }
        </style>
    </head>
    <body class="min-h-screen text-slate-800 antialiased">
        <div class="docs-shell px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <header class="overflow-hidden rounded-[2rem] border border-[#d7e6e8] bg-white/88 shadow-[0_20px_80px_rgba(12,48,51,0.08)] backdrop-blur">
                <div class="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-10">
                    <div class="space-y-5">
                        <div class="inline-flex items-center gap-3 rounded-full border border-[#dbe8ea] bg-[#f6fbfb] px-4 py-2 text-sm font-medium text-[#33555a]">
                            <img
                                src="{{ asset('logo-color.png') }}"
                                alt="Humi"
                                class="h-6 w-auto"
                            >
                            Dokumentasi Operasional Admin
                        </div>
                        <div class="space-y-3">
                            <p class="text-sm font-semibold uppercase tracking-[0.24em] text-[#628489]">
                                Manual Book
                            </p>
                            <h1 class="max-w-3xl text-4xl leading-tight font-semibold text-[#102629] sm:text-5xl">
                                Panduan kerja admin HRIS untuk onboarding user baru.
                            </h1>
                            <p class="max-w-2xl text-base leading-8 text-[#4d6d72] sm:text-lg">
                                Halaman ini merangkum fungsi tiap menu admin, alur kerja harian, setup awal tenant, dan langkah praktis agar user baru bisa langsung operasional.
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <a
                                href="#manual-book-admin-hris"
                                class="inline-flex items-center rounded-full bg-[#0f3f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3033]"
                            >
                                Baca Dokumentasi
                            </a>
                            <a
                                href="#alur-setup-awal-perusahaan"
                                class="inline-flex items-center rounded-full border border-[#cfe1e4] bg-white px-5 py-3 text-sm font-semibold text-[#173337] transition hover:bg-[#f5fbfb]"
                            >
                                Lihat Setup Awal
                            </a>
                        </div>
                    </div>

                    <div class="rounded-[1.75rem] border border-[#d7e6e8] bg-[#f7fbfb] p-5">
                        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#68868a]">
                            Highlight
                        </p>
                        <div class="mt-5 grid gap-4">
                            <div class="rounded-2xl border border-[#dce9eb] bg-white p-4">
                                <p class="text-sm text-[#6b878c]">Fokus utama</p>
                                <p class="mt-2 text-lg font-semibold text-[#173337]">Dashboard, Karyawan, Approval, Payroll, Pengaturan</p>
                            </div>
                            <div class="rounded-2xl border border-[#dce9eb] bg-white p-4">
                                <p class="text-sm text-[#6b878c]">Target pembaca</p>
                                <p class="mt-2 text-lg font-semibold text-[#173337]">Admin baru, admin staff, PIC operasional, trainer internal</p>
                            </div>
                            <div class="rounded-2xl border border-[#dce9eb] bg-white p-4">
                                <p class="text-sm text-[#6b878c]">Format dokumen</p>
                                <p class="mt-2 text-lg font-semibold text-[#173337]">Tutorial operasional dan manual book harian</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main class="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
                <aside class="lg:sticky lg:top-6">
                    <div class="rounded-[1.5rem] border border-[#d7e6e8] bg-white/90 p-5 shadow-[0_18px_60px_rgba(12,48,51,0.06)] backdrop-blur">
                        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#68868a]">
                            Daftar Isi
                        </p>
                        <nav class="mt-4 space-y-1">
                            @foreach ($tableOfContents as $item)
                                <a
                                    href="#{{ $item['id'] }}"
                                    class="toc-link block rounded-xl px-3 py-2 text-sm text-[#47666a] {{ $item['level'] === 3 ? 'ml-4' : '' }}"
                                >
                                    {{ $item['title'] }}
                                </a>
                            @endforeach
                        </nav>
                    </div>
                </aside>

                <section class="rounded-[1.75rem] border border-[#d7e6e8] bg-white/92 p-6 shadow-[0_20px_70px_rgba(12,48,51,0.08)] backdrop-blur sm:p-8 lg:p-10">
                    <article class="docs-prose max-w-none">
                        {!! $content !!}
                    </article>
                </section>
            </main>
        </div>
    </body>
</html>
