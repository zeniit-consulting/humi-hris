export type PayrollEmployeeStatus = 'active' | 'inactive' | 'resigned';
export type PayrollEmployeeFilters = {
    status: PayrollEmployeeStatus | 'all' | 'default';
    subCompany: string;
    scope: string;
};

type PayrollEmployee = {
    id: number;
    payroll_status: PayrollEmployeeStatus;
    sub_company_id?: number | null;
    regular_paid?: boolean;
    is_default?: boolean;
};

export function filterPayrollEmployees<T extends PayrollEmployee>(
    employees: T[],
    filters: PayrollEmployeeFilters,
): T[] {
    return employees.filter(
        (employee) =>
            (filters.status === 'all' ||
                (filters.status === 'default'
                    ? employee.payroll_status === 'active' ||
                      employee.payroll_status === 'resigned' ||
                      Boolean(employee.is_default)
                    : employee.payroll_status === filters.status)) &&
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
