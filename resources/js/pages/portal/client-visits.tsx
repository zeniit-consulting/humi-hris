import { LoaderCircle, MapPinned, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
    chips,
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

const fallbackLinks: PortalLinkMap = {
    attendance: '/portal/attendance',
    leaves: '/portal/leaves',
    overtimes: '/portal/overtimes',
    payroll: '/portal/payroll',
    activity: '/portal/activity',
    client_visits: '/portal/activity/client-visits',
    performance_activity: '/portal/activity/performance',
    profile: '/portal/profile',
};

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

export default function PortalClientVisitsPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [visits, setVisits] = useState<ClientVisit[]>([]);
    const [visitDate, setVisitDate] = useState(localDateString());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [visitForm, setVisitForm] = useState({
        client_name: '',
        work_description: '',
    });

    const loadVisits = async (date = visitDate) => {
        const response = await requestApi<ClientVisitPayload>(
            `/portal/api/client-visits?date=${date}`,
        );
        setVisits(response.data.items);
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [portalResponse, visitResponse] = await Promise.all([
                    requestApi<PortalSummary>('/portal/api/summary'),
                    requestApi<ClientVisitPayload>(
                        `/portal/api/client-visits?date=${visitDate}`,
                    ),
                ]);

                if (cancelled) {
                    return;
                }

                setPortal(portalResponse.data);
                setVisits(visitResponse.data.items);
            } catch (error) {
                notifyPortal(
                    'error',
                    error instanceof Error
                        ? translatePortalError(
                              error.message,
                              'Kunjungan client tidak bisa dimuat.',
                          )
                        : 'Kunjungan client tidak bisa dimuat.',
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

    const openVisit = useMemo(
        () => visits.find((visit) => visit.status === 'in_progress') ?? null,
        [visits],
    );

    const startVisit = async (event: FormEvent) => {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);

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
            await loadVisits();
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
            setIsSaving(false);
        }
    };

    const finishVisit = async (visit: ClientVisit) => {
        if (isSaving) {
            return;
        }

        setIsSaving(true);

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
            await loadVisits();
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
            setIsSaving(false);
        }
    };

    const links = portal?.links ?? fallbackLinks;

    return (
        <PortalShell
            title={pageTitle ?? 'Client Visit'}
            eyebrow="Aktivitas"
            active="activity"
            links={links}
        >
            <div className="space-y-4">
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
                            onChange={(event) =>
                                setVisitDate(event.target.value)
                            }
                            className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm outline-none focus:border-[#006069]"
                        />
                    </div>
                </section>

                <section className="rounded-[16px] border border-slate-200 bg-white p-5">
                    {openVisit ? (
                        <div className="rounded-[12px] border border-teal-100 bg-teal-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {openVisit.client_name}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Mulai{' '}
                                        {formatTime(openVisit.clock_in_at)} ·{' '}
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
                                disabled={isSaving}
                                className="portal-primary-bg mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isSaving ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <Navigation className="size-4" />
                                )}
                                Selesai kunjungan
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={startVisit} className="space-y-3">
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
                                disabled={isSaving}
                                className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isSaving ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <MapPinned className="size-4" />
                                )}
                                Mulai kunjungan
                            </button>
                        </form>
                    )}
                </section>

                <section className="space-y-3">
                    {isLoading ? (
                        <>
                            <div className="h-24 animate-pulse rounded-[12px] bg-stone-100" />
                            <div className="h-24 animate-pulse rounded-[12px] bg-stone-100" />
                        </>
                    ) : visits.length ? (
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
                </section>
            </div>
        </PortalShell>
    );
}
