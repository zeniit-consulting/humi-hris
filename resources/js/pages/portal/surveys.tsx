import { Send, SquarePen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
    formatDate,
    notifyPortal,
    requestApi,
    statusLabels,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type PortalSummary = {
    links: PortalLinkMap;
};

type Survey = {
    id: number;
    title: string;
    description: string | null;
    status: string;
    is_anonymous: boolean;
    starts_at: string | null;
    ends_at: string | null;
    questions: Array<{
        id: string | null;
        question: string;
        type: string;
    }>;
    has_responded: boolean;
    submitted_at: string | null;
    answers: string[];
};

type SurveyPayload = {
    items: Survey[];
};

export default function PortalSurveysPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<Survey[]>([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(
        null,
    );
    const [answers, setAnswers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedSurvey = useMemo(
        () => items.find((item) => item.id === selectedSurveyId) ?? null,
        [items, selectedSurveyId],
    );

    const loadData = async () => {
        try {
            const [portalResponse, surveyResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<SurveyPayload>('/portal/api/surveys'),
            ]);

            setPortal(portalResponse.data);
            setItems(surveyResponse.data.items);

            const initialSurvey = surveyResponse.data.items.find(
                (survey) => !survey.has_responded,
            );

            if (initialSurvey) {
                setSelectedSurveyId(initialSurvey.id);
                setAnswers(
                    initialSurvey.questions.map(
                        (_, index) => initialSurvey.answers[index] ?? '',
                    ),
                );
            }
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Survei tidak bisa dimuat.',
                      )
                    : 'Survey tidak bisa dimuat.',
            );
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        if (!selectedSurvey) {
            return;
        }

        setAnswers(
            selectedSurvey.questions.map(
                (_, index) => selectedSurvey.answers[index] ?? '',
            ),
        );
    }, [selectedSurvey]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedSurvey) {
            return;
        }

        try {
            setIsSubmitting(true);

            await requestApi(
                `/portal/api/surveys/${selectedSurvey.id}/responses`,
                'POST',
                {
                    answers,
                },
            );

            notifyPortal('success', 'Respons survei berhasil dikirim.');
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Respons survei gagal dikirim.',
                      )
                    : 'Respons survei gagal dikirim.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Survei karyawan"
            description="Isi survei aktif dan lihat riwayat respons Anda."
            active="home"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <SquarePen className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Survei aktif
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Survei karyawan
                        </h2>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {items.length ? (
                        items.map((survey) => (
                            <button
                                key={survey.id}
                                type="button"
                                onClick={() => setSelectedSurveyId(survey.id)}
                                className={`w-full rounded-[12px] border px-4 py-4 text-left ${
                                    selectedSurveyId === survey.id
                                        ? 'portal-primary-bg border-[#006069] text-white'
                                        : 'border-stone-200/80 bg-stone-50 text-slate-900'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {survey.title}
                                        </p>
                                        <p
                                            className={`mt-1 text-sm ${
                                                selectedSurveyId === survey.id
                                                    ? 'text-white/70'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {survey.questions.length} pertanyaan
                                            {survey.ends_at
                                                ? ` • berakhir ${formatDate(survey.ends_at)}`
                                                : ''}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                                            survey.has_responded
                                                ? 'portal-primary-soft'
                                                : 'portal-primary-soft'
                                        }`}
                                    >
                                        {survey.has_responded
                                            ? 'Terkirim'
                                            : (statusLabels.pending ??
                                              'Menunggu')}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Belum ada survey aktif.
                        </div>
                    )}
                </div>
            </section>

            {selectedSurvey ? (
                <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                    <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                        Formulir respons
                    </p>
                    <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                        {selectedSurvey.title}
                    </h2>
                    {selectedSurvey.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selectedSurvey.description}
                        </p>
                    ) : null}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        {selectedSurvey.questions.map((question, index) => (
                            <div key={question.id ?? `question-${index}`}>
                                <label className="block text-sm font-semibold text-slate-900">
                                    {index + 1}. {question.question}
                                </label>
                                <textarea
                                    value={answers[index] ?? ''}
                                    onChange={(event) =>
                                        setAnswers((current) =>
                                            current.map(
                                                (answer, answerIndex) =>
                                                    answerIndex === index
                                                        ? event.target.value
                                                        : answer,
                                            ),
                                        )
                                    }
                                    disabled={selectedSurvey.has_responded}
                                    className="mt-2 min-h-24 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none disabled:opacity-70"
                                    placeholder="Tulis jawaban Anda"
                                />
                            </div>
                        ))}

                        {selectedSurvey.has_responded ? (
                            <div className="portal-primary-text rounded-[10px] border border-[#b9dfe0] bg-[#f3fbfb] px-4 py-4 text-sm">
                                Respons sudah dikirim{' '}
                                {selectedSurvey.submitted_at
                                    ? `pada ${formatDate(selectedSurvey.submitted_at)}.`
                                    : '.'}
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9px] text-sm font-semibold disabled:opacity-60"
                            >
                                <Send className="size-4" />
                                {isSubmitting ? 'Mengirim...' : 'Kirim respons'}
                            </button>
                        )}
                    </form>
                </section>
            ) : null}
        </PortalShell>
    );
}
