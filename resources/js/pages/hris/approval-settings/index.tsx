import { Head, router, usePage } from '@inertiajs/react';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Setting = { request_type: string; two_line_enabled: boolean; first_approver_employee_id: number | null; second_approver_employee_id: number | null };
type Employee = { id: number; label: string };
const labels: Record<string, string> = { attendance: 'Absensi', leave: 'Cuti', overtime: 'Lembur', shift_change: 'Perubahan Jadwal' };

export default function ApprovalSettingsPage() {
    const { settings, employees } = usePage<{ settings: Setting[]; employees: Employee[] }>().props;
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pengaturan Approval', href: '/hris/approval-settings' }];
    const save = (setting: Setting, patch: Partial<Setting>) => router.put(`/hris/approval-settings/${setting.request_type}`, { ...setting, ...patch }, { preserveScroll: true });
    return <AppLayout breadcrumbs={breadcrumbs}><Head title="Pengaturan Approval" /><div className="space-y-5 p-4"><div><h1 className="flex items-center gap-2 text-xl font-semibold"><Settings2 className="size-5" />Pengaturan Approval</h1><p className="text-sm text-muted-foreground">Atur approval satu atau dua tahap untuk setiap jenis pengajuan baru.</p></div><div className="grid gap-4 lg:grid-cols-2">{settings.map((setting) => <Card key={setting.request_type}><CardHeader><CardTitle>{labels[setting.request_type]}</CardTitle><CardDescription>Default tahap 1: Kepala/Direktur Divisi (level 1). Tahap 2: President Director (level 0).</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-2"><Checkbox id={`${setting.request_type}-two`} checked={setting.two_line_enabled} onCheckedChange={(checked) => save(setting, { two_line_enabled: checked === true })} /><Label htmlFor={`${setting.request_type}-two`}>Gunakan 2 line approval</Label></div><ApproverSelect label="Approver tahap 1 (opsional override)" value={setting.first_approver_employee_id} employees={employees} onChange={(value) => save(setting, { first_approver_employee_id: value })} />{setting.two_line_enabled && <ApproverSelect label="Approver tahap 2 (opsional override)" value={setting.second_approver_employee_id} employees={employees} onChange={(value) => save(setting, { second_approver_employee_id: value })} />}</CardContent></Card>)}</div></div></AppLayout>;
}
function ApproverSelect({ label, value, employees, onChange }: { label: string; value: number | null; employees: Employee[]; onChange: (value: number | null) => void }) { return <div className="grid gap-2"><Label>{label}</Label><select className="h-9 rounded-md border bg-background px-3 text-sm" value={value ?? ''} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}><option value="">Gunakan default jabatan</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.label}</option>)}</select></div>; }
