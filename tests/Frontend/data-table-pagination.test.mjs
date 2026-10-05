import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

test('SimplePagination provides records-per-page dropdown strictly with 10, 25, and 50 options', () => {
    const paginationFile = path.join(rootDir, 'resources/js/components/ui/simple-pagination.tsx');
    const content = fs.readFileSync(paginationFile, 'utf8');

    assert.match(content, /perPageOptions\s*=\s*\[10,\s*25,\s*50\]/);
    assert.match(content, /<Select/);
    assert.match(content, /<SelectContent/);
    assert.match(content, /<SelectItem/);
});

test('DataTable component is exported and configured with 10, 25, and 50 options', () => {
    const dataTableFile = path.join(rootDir, 'resources/js/components/ui/data-table.tsx');
    assert.ok(fs.existsSync(dataTableFile), 'data-table.tsx exists');

    const content = fs.readFileSync(dataTableFile, 'utf8');
    assert.match(content, /export function DataTable/);
    assert.match(content, /export const DataTablePagination = SimplePagination/);
    assert.match(content, /perPageOptions\s*=\s*\[10,\s*25,\s*50\]/);
});

test('Controllers validate and paginate with 10, 25, and 50 per_page options', () => {
    const employeeCtrl = fs.readFileSync(
        path.join(rootDir, 'app/Http/Controllers/Hris/EmployeeController.php'),
        'utf8'
    );
    assert.match(employeeCtrl, /'per_page'\s*=>\s*\[.*Rule::in\(\[10,\s*25,\s*50/);
    assert.match(employeeCtrl, /paginate\(\$perPage\)/);

    const attendanceCtrl = fs.readFileSync(
        path.join(rootDir, 'app/Http/Controllers/Hris/AttendanceController.php'),
        'utf8'
    );
    assert.match(attendanceCtrl, /'per_page'\s*=>\s*\['nullable',\s*'in:10,25,50'\]/);
    assert.match(attendanceCtrl, /paginate\(\$perPage\)/);

    const leaveCtrl = fs.readFileSync(
        path.join(rootDir, 'app/Http/Controllers/Hris/LeaveController.php'),
        'utf8'
    );
    assert.match(leaveCtrl, /'per_page'\s*=>\s*\['nullable',\s*'in:10,25,50'\]/);
    assert.match(leaveCtrl, /paginate\(\$perPage\)/);

    const overtimeCtrl = fs.readFileSync(
        path.join(rootDir, 'app/Http/Controllers/Hris/OvertimeController.php'),
        'utf8'
    );
    assert.match(overtimeCtrl, /'per_page'\s*=>\s*\['nullable',\s*'in:10,25,50'\]/);
    assert.match(overtimeCtrl, /paginate\(\$perPage\)/);
});
