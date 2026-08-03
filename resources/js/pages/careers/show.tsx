import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    FileText,
    Link as LinkIcon,
    MapPin,
    Send,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { frontHeroTitleClass } from '@/components/front-hero-typography';
import InputError from '@/components/input-error';
import SeoHead from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    formatThousandDigits,
    normalizeDigitInput,
} from '@/lib/currency-input';

type Vacancy = {
    id: number;
    title: string;
    slug: string;
    employment_type: string | null;
    workplace_type: string | null;
    location: string | null;
    openings: number;
    min_salary: string | null;
    max_salary: string | null;
    description: string | null;
    requirements: string | null;
    benefits: string | null;
    closing_date: string | null;
    division: string | null;
    position: string | null;
    apply_url: string;
    list_url: string;
};

type PageProps = {
    vacancy: Vacancy;
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    auth: {
        user?: unknown;
    };
};

type ApplicationFormData = {
    full_name: string;
    email: string;
    phone: string;
    birth_date: string;
    address: string;
    last_education: string;
    years_experience: string;
    current_company: string;
    take_home_pay_min: string;
    take_home_pay_max: string;
    expected_salary: string;
    expected_join_date: string;
    portfolio_url: string;
    linkedin_url: string;
    cover_letter: string;
    resume: File | null;
};

const defaultForm: ApplicationFormData = {
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    last_education: '',
    years_experience: '',
    current_company: '',
    take_home_pay_min: '',
    take_home_pay_max: '',
    expected_salary: '',
    expected_join_date: '',
    portfolio_url: '',
    linkedin_url: '',
    cover_letter: '',
    resume: null,
};

const employmentTypeLabels: Record<string, string> = {
    permanent: 'Tetap',
    contract: 'Kontrak',
    internship: 'Magang',
    freelance: 'Freelance',
};

const workplaceTypeLabels: Record<string, string> = {
    onsite: 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
};

const formatCurrency = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
};

const stripText = (value: string | null, maxLength = 155) => {
    const fallback =
        'Lowongan aktif Humi HRIS. Lihat detail posisi, kualifikasi, benefit, dan kirim lamaran secara online.';
    const text = (value ?? fallback).replace(/\s+/g, ' ').trim();

    return text.length > maxLength
        ? `${text.slice(0, maxLength).trim()}...`
        : text;
};

export default function CareerShowPage() {
    const { vacancy, flash } = usePage<PageProps>().props;
    const form = useForm<ApplicationFormData>(defaultForm);

    const submitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(vacancy.apply_url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
        });
    };

    return (
        <>
            <SeoHead
                title={`${vacancy.title} - Karier Humi HRIS`}
                description={stripText(vacancy.description)}
                keywords={`${vacancy.title}, karier Humi, lowongan ${vacancy.position ?? vacancy.title}, ${vacancy.location ?? 'Indonesia'}, lowongan HRIS`}
                canonicalPath={`/careers/${vacancy.slug}`}
                type="article"
            />

            <div className="min-h-screen bg-[var(--landing-color-paper)] font-[family-name:var(--landing-font-body)] text-[var(--landing-color-ink)]">
                <header className="border-b border-[var(--landing-color-rule)] bg-[color-mix(in_oklch,var(--landing-color-paper)_94%,transparent)] backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                        <div>
                            <Link
                                href={vacancy.list_url}
                                className="text-lg font-semibold tracking-[-0.03em] text-[var(--landing-color-ink)]"
                            >
                                Humi Careers
                            </Link>
                            <p className="text-sm text-[var(--landing-color-muted)]">
                                Temukan peran yang cocok untuk langkah berikutnya.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href={vacancy.list_url}>
                                    <ArrowLeft className="size-4" />
                                    <span className="hidden sm:inline">Semua lowongan</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
                    {flash?.success ? (
                        <div className="mb-6 rounded-[var(--landing-radius-card)] border border-[var(--landing-color-success)]/25 bg-[var(--landing-color-success)]/10 px-4 py-3 text-sm text-[var(--landing-color-success)]">
                            {flash.success}
                        </div>
                    ) : null}

                    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(28rem,0.8fr)] xl:items-start xl:gap-12">
                        <div className="space-y-6">
                            <section className="rounded-[var(--landing-radius-panel)] bg-[var(--landing-color-ink)] px-6 py-8 text-[var(--landing-color-paper)] shadow-[var(--landing-shadow-panel)] sm:px-8 sm:py-10">
                                <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold">
                                    <span className="rounded-[var(--landing-radius-control)] bg-[var(--landing-color-accent)] px-3 py-1.5 text-[var(--landing-color-accent-ink)]">
                                        {employmentTypeLabels[
                                            vacancy.employment_type ?? ''
                                        ] ??
                                            vacancy.employment_type ??
                                            'Umum'}
                                    </span>
                                    <span className="rounded-[var(--landing-radius-control)] border border-[var(--landing-color-paper)]/20 px-3 py-1.5 text-[var(--landing-color-paper)]">
                                        {workplaceTypeLabels[
                                            vacancy.workplace_type ?? ''
                                        ] ??
                                            vacancy.workplace_type ??
                                            'Fleksibel'}
                                    </span>
                                </div>
                                <h1 className={`${frontHeroTitleClass} max-w-[16ch] !text-[var(--landing-color-paper)]`}>
                                    {vacancy.title}
                                </h1>
                                <div className="mt-6 grid gap-3 text-sm text-[var(--landing-color-paper)]/75 md:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        {vacancy.location ??
                                            'Lokasi belum ditentukan'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="size-4" />
                                        {vacancy.position ?? '-'} •{' '}
                                        {vacancy.division ?? '-'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4" />
                                        Kebutuhan {vacancy.openings} orang
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="size-4" />
                                        Closing {vacancy.closing_date ?? '-'}
                                    </div>
                                </div>
                                <div className="mt-6 rounded-[var(--landing-radius-card)] border border-[var(--landing-color-paper)]/15 bg-[var(--landing-color-paper)]/5 px-4 py-3 text-sm text-[var(--landing-color-paper)]/75">
                                    Rentang kompensasi:{' '}
                                    <strong>
                                        {formatCurrency(vacancy.min_salary)} -{' '}
                                        {formatCurrency(vacancy.max_salary)}
                                    </strong>
                                </div>
                            </section>

                            <Card className="border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] shadow-none">
                                <CardHeader>
                                    <CardTitle>Deskripsi Posisi</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm leading-7 whitespace-pre-line text-[var(--landing-color-ink-soft)]">
                                    {vacancy.description ??
                                        'Belum ada deskripsi.'}
                                </CardContent>
                            </Card>

                            <Card className="border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] shadow-none">
                                <CardHeader>
                                    <CardTitle>Kualifikasi</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm leading-7 whitespace-pre-line text-[var(--landing-color-ink-soft)]">
                                    {vacancy.requirements ??
                                        'Belum ada detail kualifikasi.'}
                                </CardContent>
                            </Card>

                            <Card className="border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] shadow-none">
                                <CardHeader>
                                    <CardTitle>Benefit</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm leading-7 whitespace-pre-line text-[var(--landing-color-ink-soft)]">
                                    {vacancy.benefits ??
                                        'Benefit akan dijelaskan pada tahap selanjutnya.'}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="h-fit border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] shadow-[var(--landing-shadow-panel)] xl:sticky xl:top-6">
                            <CardHeader>
                                <div className="mb-2 inline-flex w-fit items-center rounded-[var(--landing-radius-control)] bg-[var(--landing-color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--landing-color-accent)]">
                                    Langkah terakhir
                                </div>
                                <CardTitle className="text-2xl tracking-[-0.03em]">Kirim lamaran</CardTitle>
                                <CardDescription>
                                    Ceritakan sedikit tentang diri Anda. Data ini
                                    hanya digunakan untuk proses rekrutmen Humi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={submitForm}
                                    className="space-y-6"
                                >
                                    <div className="border-b border-[var(--landing-color-rule)] pb-5">
                                        <p className="text-sm font-semibold text-[var(--landing-color-ink)]">
                                            Data utama
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[var(--landing-color-muted)]">
                                            Isi informasi yang paling mudah kami gunakan untuk menghubungi Anda.
                                        </p>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="full_name">
                                                Nama lengkap
                                            </Label>
                                            <Input
                                                id="full_name"
                                                value={form.data.full_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'full_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={form.errors.full_name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={form.errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                No. telepon
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={form.errors.phone}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="birth_date">
                                                Tanggal lahir
                                            </Label>
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                value={form.data.birth_date}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'birth_date',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={form.errors.birth_date}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="last_education">
                                                Pendidikan terakhir
                                            </Label>
                                            <Input
                                                id="last_education"
                                                value={form.data.last_education}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'last_education',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.last_education
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="years_experience">
                                                Pengalaman (tahun)
                                            </Label>
                                            <Input
                                                id="years_experience"
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={
                                                    form.data.years_experience
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'years_experience',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.years_experience
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="current_company">
                                                Perusahaan saat ini
                                            </Label>
                                            <Input
                                                id="current_company"
                                                value={
                                                    form.data.current_company
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'current_company',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.current_company
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label>Take Home Pay Range</Label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="take_home_pay_min"
                                                        className="text-xs text-slate-500"
                                                    >
                                                        Minimum
                                                    </Label>
                                                    <Input
                                                        id="take_home_pay_min"
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatThousandDigits(
                                                            form.data
                                                                .take_home_pay_min,
                                                        )}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'take_home_pay_min',
                                                                normalizeDigitInput(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Rp 0"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors
                                                                .take_home_pay_min
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="take_home_pay_max"
                                                        className="text-xs text-slate-500"
                                                    >
                                                        Maksimum
                                                    </Label>
                                                    <Input
                                                        id="take_home_pay_max"
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatThousandDigits(
                                                            form.data
                                                                .take_home_pay_max,
                                                        )}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'take_home_pay_max',
                                                                normalizeDigitInput(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Rp 0"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors
                                                                .take_home_pay_max
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="expected_salary">
                                                Expected Salary
                                            </Label>
                                            <Input
                                                id="expected_salary"
                                                type="text"
                                                inputMode="numeric"
                                                value={formatThousandDigits(
                                                    form.data.expected_salary,
                                                )}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'expected_salary',
                                                        normalizeDigitInput(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="Rp 0"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.expected_salary
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="expected_join_date">
                                                Expected Join Date
                                            </Label>
                                            <Input
                                                id="expected_join_date"
                                                type="date"
                                                value={
                                                    form.data.expected_join_date
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'expected_join_date',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors
                                                        .expected_join_date
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="address">
                                                Alamat
                                            </Label>
                                            <textarea
                                                id="address"
                                                value={form.data.address}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'address',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={3}
                                                className="min-h-24 rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-3 py-2 text-sm text-[var(--landing-color-ink)] shadow-none outline-none focus-visible:border-[var(--landing-color-focus)] focus-visible:ring-2 focus-visible:ring-[var(--landing-color-focus)]/20"
                                            />
                                            <InputError
                                                message={form.errors.address}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="portfolio_url">
                                                Portfolio URL
                                            </Label>
                                            <Input
                                                id="portfolio_url"
                                                value={form.data.portfolio_url}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'portfolio_url',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.portfolio_url
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="linkedin_url">
                                                LinkedIn URL
                                            </Label>
                                            <Input
                                                id="linkedin_url"
                                                value={form.data.linkedin_url}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'linkedin_url',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.linkedin_url
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="cover_letter">
                                                Ringkasan profil / cover letter
                                            </Label>
                                            <textarea
                                                id="cover_letter"
                                                value={form.data.cover_letter}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'cover_letter',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={5}
                                                className="min-h-32 rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-3 py-2 text-sm text-[var(--landing-color-ink)] shadow-none outline-none focus-visible:border-[var(--landing-color-focus)] focus-visible:ring-2 focus-visible:ring-[var(--landing-color-focus)]/20"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.cover_letter
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="resume">
                                                Upload CV (PDF/DOC/DOCX)
                                            </Label>
                                            <Input
                                                id="resume"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(event) =>
                                                    form.setData(
                                                        'resume',
                                                        event.target
                                                            .files?.[0] ?? null,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={form.errors.resume}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={form.processing}
                                    >
                                        <Send className="size-4" />
                                        {form.processing
                                            ? 'Mengirim lamaran...'
                                            : 'Kirim lamaran'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
