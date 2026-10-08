export type ExecutiveInsightsData = {
    active_employees: {
        total: number;
        active: number;
        active_rate: number;
        pkwtt_count: number;
        pkwt_count: number;
        probation_count: number;
        resigned_count: number;
    };
    payroll_cost: {
        total_cost: number;
        base_cost: number;
        allowance_cost: number;
        growth_rate: number;
        avg_per_employee: number;
        is_projected: boolean;
    };
    attendance_improvement: {
        verdict: 'membaik' | 'stabil' | 'menurun';
        verdict_label: string;
        verdict_badge: 'success' | 'default' | 'destructive';
        attendance_rate: number;
        prev_attendance_rate: number;
        attendance_diff: number;
        late_rate: number;
        prev_late_rate: number;
        late_diff: number;
        present_count: number;
        late_count: number;
        absent_count: number;
    };
    department_shortage: {
        total_shortage: number;
        departments: Array<{
            division_id: number;
            name: string;
            code?: string;
            headcount: number;
            vacancies_count: number;
            openings: number;
            shortage: number;
        }>;
    };
    frequent_late_and_absent: {
        top_late: Array<{
            id: number;
            name: string;
            code: string;
            division: string;
            count: number;
            href: string;
        }>;
        top_absent: Array<{
            id: number;
            name: string;
            code: string;
            division: string;
            count: number;
            href: string;
        }>;
    };
    contract_expiring: {
        total_expiring: number;
        items: Array<{
            id: number;
            name: string;
            code: string;
            division: string;
            type: string;
            end_date?: string;
            days_remaining: number;
            is_urgent: boolean;
            href: string;
        }>;
    };
    turnover_rate: {
        rate: number;
        status: 'healthy' | 'normal' | 'warning';
        status_label: string;
        retention_rate: number;
        resigned_ytd: number;
        active_employees: number;
    };
};

export function DashboardExecutiveQA(_props?: {
    data?: ExecutiveInsightsData;
}) {
    return null;
}
