import { Activity, CalendarCheck, ListChecks, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
    chips,
    formatDate,
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

type Props = {
    pageTitle?: string;
};

const scoreLabel = (value: number | null) =>
    value === null
        ? '-'
        : value.toLocaleString('id-ID', { maximumFractionDigits: 2 });

export default function PortalActivityPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        check_in_date: localDateString(),
        summary: '',
        action_items: '',
        status: 'open',
    });

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [portalResponse, performanceResponse] = await Promise.all(
                    [
                        requestApi<PortalSummary>('/portal/api/summary'),
                        requestApi<PerformancePayload>(
                            '/portal/api/performances',
                        ),
                    ],
                );

                if (cancelled) {
                    return;
                }

                setPortal(portalResponse.data);
                setReviews(performanceResponse.data.items);
                setSelectedReviewId(
                    performanceResponse.data.items[0]?.id ?? null,
                );
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
    }, []);

    const selectedReview = useMemo(
        () =>
            reviews.find((review) => review.id === selectedReviewId) ??
            reviews[0] ??
            null,
        [reviews, selectedReviewId],
    );

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
