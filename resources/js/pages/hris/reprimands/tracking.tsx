import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Reprimand = { id: number; reprimand_number: string; level: string; issued_date: string; incident_date: string | null; subject: string; description: string | null; action_plan: string | null; status: string; resolution_notes: string | null; validity_months: number | null; expires_at: string | null; attachment_url: string | null; attachment_name: string | null };
const labels: Record<string, string> = { verbal: 'Teguran Lisan', sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3', active: 'Aktif', resolved: 'Selesai', void: 'Dibatalkan' };

export default function TrackingPage() {
    const { employee, reprimands } = usePage<{ employee: { label: string }; reprimands: Reprimand[] }>().props;
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Teguran', href: '/hris/reprimands' }, { title: 'Tracking', href: '#' }];
    return <AppLayout breadcrumbs={breadcrumbs}><Head title={`Tracking Teguran - ${employee.label}`} /><div className="space-y-4 p-4">
        <Button asChild variant="outline"><Link href="/hris/reprimands"><ArrowLeft className="size-4" />Kembali</Link></Button>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="size-5" />Linimasa Teguran: {employee.label}</CardTitle></CardHeader><CardContent>
            {reprimands.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada riwayat teguran.</p> : <div className="relative space-y-6 border-l pl-6">{reprimands.map((item) => <div key={item.id} className="relative"><span className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" /><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted-foreground">{item.issued_date}</span><Badge>{labels[item.level]}</Badge><Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{labels[item.status]}</Badge></div><h3 className="mt-1 font-semibold">{item.subject}</h3><p className="text-sm text-muted-foreground">{item.description || 'Tidak ada detail deskripsi.'}</p>{item.action_plan && <p className="mt-2 text-sm"><strong>Tindak lanjut:</strong> {item.action_plan}</p>}{item.validity_months && <p className="text-xs text-muted-foreground">Masa berlaku {item.validity_months} bulan, sampai {item.expires_at}</p>}{item.attachment_url && <a className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline" href={item.attachment_url} target="_blank" rel="noreferrer"><ExternalLink className="size-4" />{item.attachment_name || 'Lihat attachment'}</a>}</div>)}</div>}
        </CardContent></Card>
    </div></AppLayout>;
}
