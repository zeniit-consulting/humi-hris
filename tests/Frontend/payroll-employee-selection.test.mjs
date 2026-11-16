import assert from 'node:assert/strict';
import test from 'node:test';
import { filterPayrollEmployees, selectablePayrollEmployeeIds } from '../../resources/js/lib/payroll-employee-selection.ts';

const employees = [
    { id: 1, payroll_status: 'active', sub_company_id: null },
    { id: 2, payroll_status: 'active', sub_company_id: 5, regular_paid: true },
    { id: 3, payroll_status: 'inactive', sub_company_id: null },
    { id: 4, payroll_status: 'resigned', sub_company_id: 5 },
];
const filters = { status: 'active', subCompany: '__all', scope: 'all' };

test('status filters include only the requested current status', () => {
    for (const [status, ids] of [['active', [1, 2]], ['inactive', [3]], ['resigned', [4]], ['all', [1, 2, 3, 4]]]) {
        assert.deepEqual(filterPayrollEmployees(employees, { ...filters, status }).map(e => e.id), ids);
    }
});
test('company and parent scope apply together with status', () => {
    assert.deepEqual(filterPayrollEmployees(employees, { ...filters, status: 'all', subCompany: '5' }).map(e => e.id), [2, 4]);
    assert.deepEqual(filterPayrollEmployees(employees, { ...filters, status: 'all', scope: 'parent_only' }).map(e => e.id), [1, 3]);
    assert.deepEqual(filterPayrollEmployees(employees, { ...filters, scope: 'parent_only', subCompany: '5' }), []);
});
test('auto selection excludes paid regular employees but allows additional or another period', () => {
    assert.deepEqual(selectablePayrollEmployeeIds(employees, 'regular', true), [1, 3, 4]);
    assert.deepEqual(selectablePayrollEmployeeIds(employees, 'additional', true), [1, 2, 3, 4]);
    assert.deepEqual(selectablePayrollEmployeeIds(employees, 'regular', false), [1, 2, 3, 4]);
    assert.deepEqual(selectablePayrollEmployeeIds([], 'regular', true), []);
});
