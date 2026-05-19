import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type RequestRow = {
    id: number;
    employee_label: string;
    date: string;
    description: string;
    reason: string | null;
    status: string;
};
type RejectTarget = { type: 'attendance' | 'leaves' | 'overtimes'; row: RequestRow } | null;
type PageProps = {
    status: string;
    subCompanies: Array<{ id: number; code: string; name: string }>;
    attendanceRequests: RequestRow[];
    leaveRequests: RequestRow[];
    overtimeRequests: RequestRow[];
};

const pageUrl = '/client/approvals';
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Approval Klien', href: pageUrl }];
const statusLabels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
const approveUrls = {
    attendance: (id: number) => `${pageUrl}/attendance/${id}/approve`,
    leaves: (id: number) => `${pageUrl}/leaves/${id}/approve`,
    overtimes: (id: number) => `${pageUrl}/overtimes/${id}/approve`,
};
const rejectUrls = {
    attendance: (id: number) => `${pageUrl}/attendance/${id}/reject`,
    leaves: (id: number) => `${pageUrl}/leaves/${id}/reject`,
    overtimes: (id: number) => `${pageUrl}/overtimes/${id}/reject`,
};

export default function ClientApprovalPage() {
    const { status, subCompanies, attendanceRequests, leaveRequests, overtimeRequests } = usePage<PageProps>().props;
    const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
    const rejectForm = useForm({ rejection_reason: '' });

    const submitReject = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!rejectTarget) return;

        rejectForm.post(rejectUrls[rejectTarget.type](rejectTarget.row.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectTarget(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Klien" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Klien</CardTitle>
                        <CardDescription>
                            Scope: {subCompanies.length ? subCompanies.map((company) => `${company.code} - ${company.name}`).join(', ') : '-'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-w-xs">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(value) => router.get(pageUrl, { status: value }, { preserveState: true, replace: true })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {['pending', 'approved', 'rejected'].map((item) => <SelectItem key={item} value={item}>{statusLabels[item]}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <ApprovalTable title="Request Absensi" type="attendance" rows={attendanceRequests} status={status} onReject={setRejectTarget} />
                <ApprovalTable title="Request Cuti" type="leaves" rows={leaveRequests} status={status} onReject={setRejectTarget} />
                <ApprovalTable title="Request Lembur" type="overtimes" rows={overtimeRequests} status={status} onReject={setRejectTarget} />
            </div>

            <Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Pengajuan</DialogTitle>
                        <DialogDescription>{rejectTarget?.row.employee_label}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Alasan penolakan</Label>
                            <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={rejectForm.data.rejection_reason} onChange={(event) => rejectForm.setData('rejection_reason', event.target.value)} />
                            <InputError message={rejectForm.errors.rejection_reason} />
                        </div>
                        <Button variant="destructive" disabled={rejectForm.processing}>Tolak</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function ApprovalTable({
    title,
    type,
    rows,
    status,
    onReject,
}: {
    title: string;
    type: 'attendance' | 'leaves' | 'overtimes';
    rows: RequestRow[];
    status: string;
    onReject: (target: RejectTarget) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Total data: {rows.length}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-sm">
                        <thead><tr className="border-b text-left"><th className="px-3 py-2">Karyawan</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Keterangan</th><th className="px-3 py-2">Alasan</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Aksi</th></tr></thead>
                        <tbody>
                            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Tidak ada data.</td></tr>}
                            {rows.map((row) => (
                                <tr key={`${type}-${row.id}`} className="border-b align-top">
                                    <td className="px-3 py-3 font-medium">{row.employee_label}</td>
                                    <td className="px-3 py-3">{row.date}</td>
                                    <td className="px-3 py-3">{row.description}</td>
                                    <td className="max-w-[280px] px-3 py-3"><p className="line-clamp-2 whitespace-normal">{row.reason ?? '-'}</p></td>
                                    <td className="px-3 py-3"><Badge>{statusLabels[row.status] ?? row.status}</Badge></td>
                                    <td className="px-3 py-3">
                                        {status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => router.post(approveUrls[type](row.id), undefined, { preserveScroll: true })}><Check className="size-4" />Setujui</Button>
                                                <Button size="sm" variant="destructive" onClick={() => onReject({ type, row })}><X className="size-4" />Tolak</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
