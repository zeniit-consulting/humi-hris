import {
    Activity,
    CalendarCheck,
    ListChecks,
    LoaderCircle,
    MapPinned,
    Navigation,
    Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
    chips,
    formatDate,
    formatTime,
    localDateString,
    notifyPortal,
    requestApi,
    statusLabels,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type PortalSummary = {
    links: PortalLinkMap;
};

type KeyResult = {
    id: number;
    title: string;
    target_value: number;
    actual_value: number;
    unit: string | null;
    score: number;
    status: string;
};

type Objective = {
    id: number;
    title: string;
    description: string | null;
    weight: number;
    score: number;
    status: string;
    key_results: KeyResult[];
};

type KpiResult = {
    id: number;
    name: string;
    unit: string | null;
    target_value: number;
    actual_value: number;
    weight: number;
    input_type: string;
    score: number;
};

type CheckIn = {
    id: number;
    check_in_date: string | null;
    performance_kpi_result_id: number | null;
    kpi_result: {
        id: number;
        name: string;
        unit: string | null;
        target_value: number;
        actual_value: number;
        score: number;
    } | null;
    summary: string;
    action_items: string | null;
    status: string;
};

type PerformanceReview = {
    id: number;
    status: string;
    okr_score: number;
    kpi_score: number;
    manager_score: number | null;
    final_score: number;
    period: {
        id: number;
        name: string;
        starts_at: string | null;
        ends_at: string | null;
        status: string;
    } | null;
    manager: {
        id: number;
        label: string;
    } | null;
    objectives: Objective[];
    kpi_results: KpiResult[];
    check_ins: CheckIn[];
};

type PerformancePayload = {
    items: PerformanceReview[];
};

type ClientVisit = {
    id: number;
    employee_id: number;
    client_name: string;
    work_description: string;
    visit_date: string | null;
    clock_in_at: string | null;
    clock_in_latitude: number | null;
    clock_in_longitude: number | null;
    clock_out_at: string | null;
    clock_out_latitude: number | null;
    clock_out_longitude: number | null;
    duration_seconds: number;
    duration_label: string;
    status: string;
    notes: string | null;
};

type ClientVisitPayload = {
    date: string;
    items: ClientVisit[];
};

type Props = {
    pageTitle?: string;
};

const scoreLabel = (value: number | null) =>
    value === null
        ? '-'
        : value.toLocaleString('id-ID', { maximumFractionDigits: 2 });

const geolocationOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

const locationErrorMessage = (error: GeolocationPositionError): string => {
    if (error.code === 1) {
        return 'Akses lokasi ditolak. Aktifkan izin lokasi untuk melanjutkan.';
    }

    if (error.code === 2) {
        return 'Lokasi perangkat tidak ditemukan.';
    }

    if (error.code === 3) {
        return 'Permintaan lokasi melebihi batas waktu.';
    }

    return 'Gagal mengambil lokasi perangkat.';
};

const isGeolocationError = (
    error: unknown,
): error is GeolocationPositionError =>
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'number';

const getCurrentPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Browser tidak mendukung akses lokasi.'));

            return;
        }

        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            geolocationOptions,
        );
    });

export default function PortalActivityPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [visits, setVisits] = useState<ClientVisit[]>([]);
    const [visitDate, setVisitDate] = useState(localDateString());
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisitSaving, setIsVisitSaving] = useState(false);
    const [visitForm, setVisitForm] = useState({
        client_name: '',
        work_description: '',
    });
    const [form, setForm] = useState({
        check_in_date: localDateString(),
        performance_kpi_result_id: '',
        summary: '',
        action_items: '',
        status: 'open',
    });

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const portalResponse =
                    await requestApi<PortalSummary>('/portal/api/summary');

                if (cancelled) {
                    return;
                }

                setPortal(portalResponse.data);

                const [visitResponse, performanceResponse] =
                    await Promise.allSettled([
                        requestApi<ClientVisitPayload>(
                            `/portal/api/client-visits?date=${visitDate}`,
                        ),
                        requestApi<PerformancePayload>(
                            '/portal/api/performances',
                        ),
                    ]);

                if (cancelled) {
                    return;
                }

                if (visitResponse.status === 'fulfilled') {
                    setVisits(visitResponse.value.data.items);
                } else {
                    notifyPortal(
                        'error',
                        visitResponse.reason instanceof Error
                            ? translatePortalError(
                                  visitResponse.reason.message,
                                  'Kunjungan client tidak bisa dimuat.',
                              )
                            : 'Kunjungan client tidak bisa dimuat.',
                    );
                }

                if (performanceResponse.status === 'fulfilled') {
                    setReviews(performanceResponse.value.data.items);
                    setSelectedReviewId(
                        performanceResponse.value.data.items[0]?.id ?? null,
                    );
                }
            } catch (error) {
                notifyPortal(
                    'error',
                    error instanceof Error
                        ? translatePortalError(
                              error.message,
                              'Aktivitas tidak bisa dimuat.',
                          )
                        : 'Aktivitas tidak bisa dimuat.',
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [visitDate]);

    const selectedReview = useMemo(
        () =>
            reviews.find((review) => review.id === selectedReviewId) ??
            reviews[0] ??
            null,
        [reviews, selectedReviewId],
    );
    const openVisit = useMemo(
        () => visits.find((visit) => visit.status === 'in_progress') ?? null,
        [visits],
    );

    const reloadVisits = async () => {
        const response = await requestApi<ClientVisitPayload>(
            `/portal/api/client-visits?date=${visitDate}`,
        );
        setVisits(response.data.items);
    };

    const startVisit = async (event: FormEvent) => {
        event.preventDefault();

        if (isVisitSaving) {
            return;
        }

        setIsVisitSaving(true);

        try {
            const position = await getCurrentPosition();
            await requestApi('/portal/api/client-visits', 'POST', {
                client_name: visitForm.client_name,
                work_description: visitForm.work_description,
                clock_in_at: new Date().toISOString(),
                clock_in_latitude: position.coords.latitude,
                clock_in_longitude: position.coords.longitude,
            });
            setVisitForm({ client_name: '', work_description: '' });
            await reloadVisits();
            notifyPortal('success', 'Kunjungan client dimulai.');
        } catch (error) {
            notifyPortal(
                'error',
                isGeolocationError(error)
                    ? locationErrorMessage(error)
                    : error instanceof Error
                      ? translatePortalError(
                            error.message,
                            'Kunjungan client tidak bisa dimulai.',
                        )
                      : 'Kunjungan client tidak bisa dimulai.',
            );
        } finally {
            setIsVisitSaving(false);
        }
    };

    const finishVisit = async (visit: ClientVisit) => {
        if (isVisitSaving) {
            return;
        }

        setIsVisitSaving(true);

        try {
            const position = await getCurrentPosition();
            await requestApi(
                `/portal/api/client-visits/${visit.id}/clock-out`,
                'PUT',
                {
                    clock_out_at: new Date().toISOString(),
                    clock_out_latitude: position.coords.latitude,
                    clock_out_longitude: position.coords.longitude,
                },
            );
            await reloadVisits();
            notifyPortal('success', 'Kunjungan client selesai.');
        } catch (error) {
            notifyPortal(
                'error',
                isGeolocationError(error)
                    ? locationErrorMessage(error)
                    : error instanceof Error
                      ? translatePortalError(
                            error.message,
                            'Kunjungan client tidak bisa diselesaikan.',
                        )
                      : 'Kunjungan client tidak bisa diselesaikan.',
            );
        } finally {
            setIsVisitSaving(false);
        }
    };

    const submitCheckIn = async (event: FormEvent) => {
        event.preventDefault();

        if (!selectedReview || isSaving) {
            return;
        }

        setIsSaving(true);

        try {
            await requestApi(
                `/portal/api/performances/${selectedReview.id}/check-ins`,
                'POST',
                {
                    check_in_date: form.check_in_date,
                    performance_kpi_result_id:
                        form.performance_kpi_result_id === ''
                            ? null
                            : Number(form.performance_kpi_result_id),
                    summary: form.summary,
                    action_items: form.action_items || null,
                    status: form.status,
                },
            );

            const performanceResponse = await requestApi<PerformancePayload>(
                '/portal/api/performances',
            );
            setReviews(performanceResponse.data.items);
            setForm({
                check_in_date: localDateString(),
                performance_kpi_result_id: '',
                summary: '',
                action_items: '',
                status: 'open',
            });
            notifyPortal('success', 'Aktivitas performance disimpan.');
        } catch (error) {
            notifyPortal(
                'error',
                error instanceof Error
                    ? translatePortalError(
                          error.message,
                          'Aktivitas tidak bisa disimpan.',
                      )
                    : 'Aktivitas tidak bisa disimpan.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle ?? 'Aktivitas'}
            eyebrow="Portal"
            active="activity"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                    activity: '/portal/activity',
                    profile: '/portal/profile',
                }
            }
        >
            <div className="space-y-4">
                <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Performance
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-slate-950">
                                Sedang berjalan
                            </h2>
                        </div>
                        <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                            <Activity className="portal-primary-text size-5" />
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="mt-5 space-y-3">
                            <div className="h-20 animate-pulse rounded-[12px] bg-stone-100" />
                            <div className="h-20 animate-pulse rounded-[12px] bg-stone-100" />
                        </div>
                    ) : null}

                    {!isLoading && reviews.length === 0 ? (
                        <div className="mt-5 rounded-[12px] bg-stone-50 px-4 py-5 text-sm leading-6 text-slate-500">
                            Belum ada performance aktif untuk akun ini.
                        </div>
                    ) : null}

                    {!isLoading && reviews.length > 1 ? (
                        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                            {reviews.map((review) => (
                                <button
                                    key={review.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedReviewId(review.id)
                                    }
                                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                                        selectedReview?.id === review.id
                                            ? 'portal-primary-bg text-white'
                                            : 'bg-stone-100 text-slate-700'
                                    }`}
                                >
                                    {review.period?.name ??
                                        `Review #${review.id}`}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Kunjungan Client
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-slate-950">
                                Catat aktivitas lapangan
                            </h2>
                        </div>
                        <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                            <MapPinned className="portal-primary-text size-5" />
                        </span>
                    </div>

                    <div className="mt-4">
                        <input
                            type="date"
                            value={visitDate}
                            onChange={(event) => setVisitDate(event.target.value)}
                            className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm outline-none focus:border-[#006069]"
                        />
                    </div>

                    {openVisit ? (
                        <div className="mt-4 rounded-[12px] border border-teal-100 bg-teal-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {openVisit.client_name}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Mulai {formatTime(openVisit.clock_in_at)} ·{' '}
                                        {openVisit.duration_label}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-teal-700 uppercase">
                                    Berjalan
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                                {openVisit.work_description}
                            </p>
                            <button
                                type="button"
                                onClick={() => void finishVisit(openVisit)}
                                disabled={isVisitSaving}
                                className="portal-primary-bg mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isVisitSaving ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <Navigation className="size-4" />
                                )}
                                Selesai kunjungan
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={startVisit} className="mt-4 space-y-3">
                            <input
                                value={visitForm.client_name}
                                onChange={(event) =>
                                    setVisitForm({
                                        ...visitForm,
                                        client_name: event.target.value,
                                    })
                                }
                                placeholder="Nama klien"
                                required
                                className="h-12 w-full rounded-[10px] border border-slate-200 px-3 text-sm outline-none focus:border-[#006069]"
                            />
                            <textarea
                                value={visitForm.work_description}
                                onChange={(event) =>
                                    setVisitForm({
                                        ...visitForm,
                                        work_description: event.target.value,
                                    })
                                }
                                placeholder="Keterangan pekerjaan"
                                required
                                rows={3}
                                className="w-full rounded-[10px] border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#006069]"
                            />
                            <button
                                type="submit"
                                disabled={isVisitSaving}
                                className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isVisitSaving ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <MapPinned className="size-4" />
                                )}
                                Mulai kunjungan
                            </button>
                        </form>
                    )}

                    <div className="mt-5 space-y-3">
                        {visits.length ? (
                            visits.map((visit) => (
                                <div
                                    key={visit.id}
                                    className="rounded-[12px] bg-stone-50 px-4 py-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-slate-950">
                                            {visit.client_name}
                                        </p>
                                        <span
                                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                                                chips[visit.status] ??
                                                'bg-stone-200 text-stone-800'
                                            }`}
                                        >
                                            {statusLabels[visit.status] ??
                                                visit.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatTime(visit.clock_in_at)} -{' '}
                                        {formatTime(visit.clock_out_at)} ·{' '}
                                        {visit.duration_label}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {visit.work_description}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                                Belum ada kunjungan client pada tanggal ini.
                            </p>
                        )}
                    </div>
                </section>

                {selectedReview ? (
                    <>
                        <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">
                                        {selectedReview.period?.name ??
                                            'Performance review'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatDate(
                                            selectedReview.period?.starts_at ??
                                                null,
                                        )}{' '}
                                        -{' '}
                                        {formatDate(
                                            selectedReview.period?.ends_at ??
                                                null,
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Manager:{' '}
                                        {selectedReview.manager?.label ?? '-'}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                                        chips[selectedReview.status] ??
                                        'bg-stone-200 text-stone-800'
                                    }`}
                                >
                                    {statusLabels[selectedReview.status] ??
                                        selectedReview.status}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <ScoreBox
                                    label="OKR 50%"
                                    value={selectedReview.okr_score}
                                />
                                <ScoreBox
                                    label="KPI 40%"
                                    value={selectedReview.kpi_score}
                                />
                                <ScoreBox
                                    label="Review 10%"
                                    value={selectedReview.manager_score}
                                />
                                <ScoreBox
                                    label="Final"
                                    value={selectedReview.final_score}
                                    strong
                                />
                            </div>
                        </section>

                        <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                            <SectionTitle icon={Target} title="OKR" />
                            <div className="mt-4 space-y-3">
                                {selectedReview.objectives.length ? (
                                    selectedReview.objectives.map(
                                        (objective) => (
                                            <div
                                                key={objective.id}
                                                className="rounded-[12px] border border-slate-200 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-950">
                                                            {objective.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Score{' '}
                                                            {scoreLabel(
                                                                objective.score,
                                                            )}{' '}
                                                            / Bobot{' '}
                                                            {objective.weight}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {statusLabels[
                                                            objective.status
                                                        ] ?? objective.status}
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    {objective.key_results.map(
                                                        (keyResult) => (
                                                            <div
                                                                key={
                                                                    keyResult.id
                                                                }
                                                                className="rounded-[10px] bg-stone-50 px-3 py-3"
                                                            >
                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {
                                                                        keyResult.title
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {
                                                                        keyResult.actual_value
                                                                    }
                                                                    /
                                                                    {
                                                                        keyResult.target_value
                                                                    }{' '}
                                                                    {keyResult.unit ??
                                                                        ''}{' '}
                                                                    - Score{' '}
                                                                    {scoreLabel(
                                                                        keyResult.score,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                                        Objective belum tersedia.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                            <SectionTitle icon={ListChecks} title="KPI" />
                            <div className="mt-4 space-y-3">
                                {selectedReview.kpi_results.length ? (
                                    selectedReview.kpi_results.map((kpi) => (
                                        <div
                                            key={kpi.id}
                                            className="rounded-[12px] border border-slate-200 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-950">
                                                        {kpi.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Actual{' '}
                                                        {kpi.actual_value} /
                                                        Target{' '}
                                                        {kpi.target_value}{' '}
                                                        {kpi.unit ?? ''} / Bobot{' '}
                                                        {kpi.weight}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-black text-slate-950">
                                                    {scoreLabel(kpi.score)}
                                                </span>
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
                                                <div
                                                    className="portal-primary-bg h-full rounded-full"
                                                    style={{
                                                        width: `${Math.min(kpi.score, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                                        KPI belum tersedia.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                            <SectionTitle
                                icon={CalendarCheck}
                                title="Update aktivitas"
                            />
                            <form
                                onSubmit={submitCheckIn}
                                className="mt-4 space-y-3"
                            >
                                <input
                                    type="date"
                                    value={form.check_in_date}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            check_in_date: event.target.value,
                                        })
                                    }
                                    className="h-12 w-full rounded-[10px] border border-slate-200 px-3 text-sm outline-none focus:border-[#006069]"
                                />
                                <select
                                    value={form.performance_kpi_result_id}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            performance_kpi_result_id:
                                                event.target.value,
                                        })
                                    }
                                    className="h-12 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#006069]"
                                >
                                    <option value="">Tanpa KPI acuan</option>
                                    {selectedReview.kpi_results.map((kpi) => (
                                        <option
                                            key={kpi.id}
                                            value={String(kpi.id)}
                                        >
                                            {kpi.name} - {kpi.actual_value}/
                                            {kpi.target_value}{' '}
                                            {kpi.unit ?? ''}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={form.summary}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            summary: event.target.value,
                                        })
                                    }
                                    placeholder="Ringkasan progress"
                                    required
                                    rows={4}
                                    className="w-full rounded-[10px] border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#006069]"
                                />
                                <textarea
                                    value={form.action_items}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            action_items: event.target.value,
                                        })
                                    }
                                    placeholder="Action item berikutnya"
                                    rows={3}
                                    className="w-full rounded-[10px] border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#006069]"
                                />
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="portal-primary-bg inline-flex h-12 w-full items-center justify-center rounded-[10px] text-sm font-bold text-white disabled:opacity-60"
                                >
                                    {isSaving
                                        ? 'Menyimpan...'
                                        : 'Simpan aktivitas'}
                                </button>
                            </form>

                            <div className="mt-5 space-y-3">
                                {selectedReview.check_ins.length ? (
                                    selectedReview.check_ins.map((checkIn) => (
                                        <div
                                            key={checkIn.id}
                                            className="rounded-[12px] bg-stone-50 px-4 py-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xs font-bold text-slate-500">
                                                    {formatDate(
                                                        checkIn.check_in_date,
                                                    )}
                                                </p>
                                                <span className="text-xs font-bold text-slate-500">
                                                    {statusLabels[
                                                        checkIn.status
                                                    ] ?? checkIn.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                {checkIn.summary}
                                            </p>
                                            {checkIn.kpi_result ? (
                                                <p className="mt-1 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                                                    KPI:{' '}
                                                    {checkIn.kpi_result.name}
                                                </p>
                                            ) : null}
                                            {checkIn.action_items ? (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {checkIn.action_items}
                                                </p>
                                            ) : null}
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                                        Belum ada aktivitas performance.
                                    </p>
                                )}
                            </div>
                        </section>
                    </>
                ) : null}
            </div>
        </PortalShell>
    );
}

function ScoreBox({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number | null;
    strong?: boolean;
}) {
    return (
        <div
            className={`rounded-[12px] px-4 py-4 ${strong ? 'portal-primary-bg text-white' : 'bg-stone-50 text-slate-950'}`}
        >
            <p
                className={`text-xs font-semibold ${strong ? 'text-white/80' : 'text-slate-500'}`}
            >
                {label}
            </p>
            <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                {scoreLabel(value)}
            </p>
        </div>
    );
}

function SectionTitle({
    icon: Icon,
    title,
}: {
    icon: LucideIcon;
    title: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold tracking-[-0.04em] text-slate-950">
                {title}
            </h2>
            <span className="portal-primary-soft inline-flex size-10 items-center justify-center rounded-lg">
                <Icon className="portal-primary-text size-5" />
            </span>
        </div>
    );
}
