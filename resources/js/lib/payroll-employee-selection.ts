export type PayrollEmployeeStatus = 'active' | 'inactive' | 'resigned';
export type PayrollEmployeeFilters = {
    status: PayrollEmployeeStatus | 'all';
    subCompany: string;
    scope: string;
};

type PayrollEmployee = {
    id: number;
    payroll_status: PayrollEmployeeStatus;
    sub_company_id?: number | null;
    regular_paid?: boolean;
};

export function filterPayrollEmployees<T extends PayrollEmployee>(
    employees: T[],
    filters: PayrollEmployeeFilters,
): T[] {
    return employees.filter(
        (employee) =>
            (filters.status === 'all' ||
                employee.payroll_status === filters.status) &&
            (filters.subCompany === '__all' ||
                String(employee.sub_company_id) === filters.subCompany) &&
            (filters.scope !== 'parent_only' || !employee.sub_company_id),
    );
}

export function selectablePayrollEmployeeIds(
    employees: PayrollEmployee[],
    batchPurpose: string,
    isCurrentPeriod: boolean,
): number[] {
    return employees
        .filter(
            (employee) =>
                batchPurpose === 'additional' ||
                !isCurrentPeriod ||
                !employee.regular_paid,
        )
        .map((employee) => employee.id);
}
