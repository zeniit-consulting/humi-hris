# Lupa Absen Pulang dan Pengaturan Cut-off Absensi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan request Lupa Absen Pulang yang disetujui atasan, dibatasi H+N serta cut-off bulanan, dan dikelola dari halaman Pengaturan Absensi.

**Architecture:** Tetap gunakan `AttendanceCorrectionRequest` dan workflow approval `attendance`; kolom `request_type` membedakan koreksi manual dari jam pulang yang terlupa. Kebijakan perusahaan disimpan dalam `company_settings`, dihitung server-side oleh service khusus, lalu dipakai controller portal sebelum request dibuat. Halaman pengaturan baru memakai pola Inertia controller/request yang sama seperti Pengaturan Payroll & Lembur.

**Tech Stack:** Laravel 12, PHP, MySQL migrations, Inertia React/TypeScript, Tailwind/shadcn, PHPUnit, Vitest/Node test, Wayfinder, Vite.

## Global Constraints

- Visible copy uses Indonesian; existing internal attendance route/model names remain compatible.
- `missing_clock_out` must keep using approval type `attendance` and the existing one/two-line approval snapshot.
- Deadline is inclusive and is the earlier of attendance date plus configured H+N and monthly cut-off.
- Cut-off supports values `1`--`28` or `end_of_month`; the latter must use the real last day in the attendance month.
- Enforce eligibility, ownership, cutoff, and duplicate prevention on the server; the portal form is only a client convenience.
- Use `apply_patch` for code changes, TDD for every task, and avoid committing unrelated existing changes.

---

## File structure

- `database/migrations/2026_07_29_000001_add_missing_clock_out_request_settings.php` — adds tenant-scoped deadline/cut-off settings and `attendance_correction_requests.request_type`, backfills existing requests.
- `app/Models/CompanySetting.php` — exposes the two new setting attributes and casts.
- `app/Models/AttendanceCorrectionRequest.php` — exposes and casts `request_type`.
- `app/Services/MissingClockOutRequestPolicy.php` — single source of truth for deadline, eligibility, and error messages.
- `app/Http/Controllers/Settings/AttendanceSettingController.php` — renders and saves the dedicated settings page.
- `app/Http/Requests/Settings/AttendanceSettingUpdateRequest.php` — validates the attendance policy configuration.
- `routes/settings.php`, `resources/js/layouts/settings/layout.tsx`, `resources/js/pages/settings/attendance.tsx` — settings route, navigation, and UI.
- `app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php` — validates request categories and delegates Lupa Absen Pulang policy checks.
- `app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php` and `app/Http/Controllers/Api/PortalApprovalController.php` — preserve existing attendance fields while approving only the requested clock-out.
- `resources/js/pages/portal/attendance-request.tsx` and `resources/js/pages/hris/attendance-approvals/index.tsx` — category selection and category labels.
- Feature tests cover settings, policy boundaries, portal request API, both approval surfaces, and UI payload structure.

## Task 1: Persist the policy and create an isolated policy service

**Files:**
- Create: `database/migrations/2026_07_29_000001_add_missing_clock_out_request_settings.php`
- Create: `app/Services/MissingClockOutRequestPolicy.php`
- Modify: `app/Models/CompanySetting.php`
- Modify: `app/Models/AttendanceCorrectionRequest.php`
- Test: `tests/Feature/Hris/MissingClockOutRequestPolicyTest.php`

**Interfaces:**
- Consumes: `CompanySetting`, `EmployeeAttendance`, authenticated account owner ID, local `Carbon` date.
- Produces: `MissingClockOutRequestPolicy::assertEligible(int $ownerId, int $employeeId, string $attendanceDate, string $timezone): EmployeeAttendance` and `deadlineFor(CompanySetting $setting, CarbonInterface $attendanceDate): CarbonInterface`.

- [ ] **Step 1: Write failing policy tests for defaults, date cut-off, and end-of-month.**

```php
public function test_deadline_is_the_earlier_of_h_plus_two_and_monthly_cutoff(): void
{
    Carbon::setTestNow('2026-07-02 09:00:00');
    $setting = CompanySetting::factory()->create([
        'missing_clock_out_request_days' => 2,
        'attendance_revision_cutoff_day' => '2',
    ]);

    $deadline = app(MissingClockOutRequestPolicy::class)
        ->deadlineFor($setting, Carbon::parse('2026-07-01'));

    $this->assertSame('2026-07-02', $deadline->toDateString());
}

public function test_end_of_month_cutoff_uses_leap_year_february(): void
{
    $setting = CompanySetting::factory()->create([
        'missing_clock_out_request_days' => 31,
        'attendance_revision_cutoff_day' => 'end_of_month',
    ]);

    $deadline = app(MissingClockOutRequestPolicy::class)
        ->deadlineFor($setting, Carbon::parse('2028-02-01'));

    $this->assertSame('2028-02-29', $deadline->toDateString());
}
```

- [ ] **Step 2: Run the policy test to verify it fails.**

Run: `php artisan test tests/Feature/Hris/MissingClockOutRequestPolicyTest.php`

Expected: FAIL because the settings columns and `MissingClockOutRequestPolicy` do not exist.

- [ ] **Step 3: Add the migration, model attributes, and policy implementation.**

```php
// migration columns
$table->unsignedTinyInteger('missing_clock_out_request_days')->default(2);
$table->string('attendance_revision_cutoff_day', 16)->default('end_of_month');

$table->string('request_type', 32)->default('manual_attendance')->after('reason');
```

```php
public function deadlineFor(CompanySetting $setting, CarbonInterface $attendanceDate): CarbonInterface
{
    $relative = $attendanceDate->copy()
        ->addDays($setting->missing_clock_out_request_days ?? 2)
        ->endOfDay();
    $cutoff = ($setting->attendance_revision_cutoff_day ?? 'end_of_month') === 'end_of_month'
        ? $attendanceDate->copy()->endOfMonth()->endOfDay()
        : $attendanceDate->copy()->day((int) $setting->attendance_revision_cutoff_day)->endOfDay();

    return $relative->lessThan($cutoff) ? $relative : $cutoff;
}
```

`assertEligible()` must find the tenant-owned attendance, require non-null `check_in_at` and null `check_out_at`, reject a pending `missing_clock_out` request for the same employee/date, and reject `now($timezone)` after `deadlineFor()`.

- [ ] **Step 4: Re-run the policy test.**

Run: `php artisan test tests/Feature/Hris/MissingClockOutRequestPolicyTest.php`

Expected: PASS, including inclusive deadline, dates 1--28, and end-of-month coverage.

- [ ] **Step 5: Commit the isolated data/policy slice.**

```bash
git add database/migrations/2026_07_29_000001_add_missing_clock_out_request_settings.php app/Models/CompanySetting.php app/Models/AttendanceCorrectionRequest.php app/Services/MissingClockOutRequestPolicy.php tests/Feature/Hris/MissingClockOutRequestPolicyTest.php
git commit -m "feat: add missing clock-out request policy"
```

## Task 2: Add the dedicated Attendance Settings page

**Files:**
- Create: `app/Http/Controllers/Settings/AttendanceSettingController.php`
- Create: `app/Http/Requests/Settings/AttendanceSettingUpdateRequest.php`
- Create: `resources/js/pages/settings/attendance.tsx`
- Modify: `routes/settings.php`
- Modify: `resources/js/layouts/settings/layout.tsx`
- Test: `tests/Feature/Settings/AttendanceSettingTest.php`

**Interfaces:**
- Consumes: `CompanySetting.missing_clock_out_request_days`, `CompanySetting.attendance_revision_cutoff_day` from Task 1.
- Produces: named routes `settings.attendance.edit` and `settings.attendance.update`, Inertia page props `settings: { missing_clock_out_request_days: number; attendance_revision_cutoff_day: string }`.

- [ ] **Step 1: Write the failing settings endpoint test.**

```php
public function test_admin_can_update_missing_clock_out_cutoff_settings(): void
{
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('settings.attendance.update'), [
        'missing_clock_out_request_days' => 2,
        'attendance_revision_cutoff_day' => 'end_of_month',
    ])->assertRedirect(route('settings.attendance.edit'));

    $this->assertDatabaseHas('company_settings', [
        'user_id' => $user->id,
        'missing_clock_out_request_days' => 2,
        'attendance_revision_cutoff_day' => 'end_of_month',
    ]);
}
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `php artisan test tests/Feature/Settings/AttendanceSettingTest.php`

Expected: FAIL because named routes do not exist.

- [ ] **Step 3: Implement controller, request validation, route, navigation, and form.**

```php
// AttendanceSettingUpdateRequest::rules()
return [
    'missing_clock_out_request_days' => ['required', 'integer', 'min:0', 'max:31'],
    'attendance_revision_cutoff_day' => ['required', Rule::in([
        'end_of_month', ...array_map(strval(...), range(1, 28)),
    ])],
];
```

The React form posts `PATCH /settings/attendance`, renders a number input for the H+N value, a select with `1`--`28` plus `Akhir Bulan`, displays the effective-policy explanation, and uses `SettingsLayout`. Insert “Pengaturan Absensi” after “Profil” in the settings navigation.

- [ ] **Step 4: Re-run backend settings tests and typecheck the page.**

Run: `php artisan test tests/Feature/Settings/AttendanceSettingTest.php && npm run types`

Expected: PASS.

- [ ] **Step 5: Regenerate Wayfinder and commit the settings slice.**

```bash
php artisan wayfinder:generate --with-form
git add app/Http/Controllers/Settings/AttendanceSettingController.php app/Http/Requests/Settings/AttendanceSettingUpdateRequest.php routes/settings.php resources/js/layouts/settings/layout.tsx resources/js/pages/settings/attendance.tsx tests/Feature/Settings/AttendanceSettingTest.php resources/js/routes resources/js/actions
git commit -m "feat: add attendance cutoff settings"
```

## Task 3: Create category-aware portal requests with server-side enforcement

**Files:**
- Modify: `app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php`
- Modify: `tests/Feature/PortalPageTest.php`
- Test: `tests/Feature/Hris/MissingClockOutRequestPolicyTest.php`

**Interfaces:**
- Consumes: `MissingClockOutRequestPolicy::assertEligible()` from Task 1 and `request_type` from Task 1.
- Produces: portal request payload with `request_type`, and a `201` response only for eligible `missing_clock_out` submissions.

- [ ] **Step 1: Write failing portal API tests.**

```php
public function test_portal_user_can_request_missing_clock_out_before_inclusive_deadline(): void
{
    Carbon::setTestNow('2026-07-03 09:00:00');
    [$user, $employee] = $this->portalEmployeeWithMissingCheckout('2026-07-01');

    $this->actingAs($user)->withHeader('X-Timezone', 'Asia/Makassar')
        ->postJson(route('portal.api.attendance-requests.store'), [
            'request_type' => 'missing_clock_out',
            'attendance_date' => '2026-07-01',
            'check_out_at' => '2026-07-01T18:00:00',
            'reason' => 'Lupa clock out.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.request_type', 'missing_clock_out');
}

public function test_portal_user_cannot_request_missing_clock_out_after_effective_deadline(): void
{
    Carbon::setTestNow('2026-07-04 09:00:00');
    [$user] = $this->portalEmployeeWithMissingCheckout('2026-07-01');

    $this->actingAs($user)->postJson(route('portal.api.attendance-requests.store'), [
        'request_type' => 'missing_clock_out',
        'attendance_date' => '2026-07-01',
        'check_out_at' => '2026-07-01T18:00:00',
        'reason' => 'Lupa clock out.',
    ])->assertUnprocessable();
}
```

Cover the already-complete attendance, duplicate pending request, `check_out_at` before `check_in_at`, and manual-attendance backward-compatible request cases in the same test class.

- [ ] **Step 2: Run the portal tests to verify they fail.**

Run: `php artisan test tests/Feature/PortalPageTest.php --filter=missing_clock_out`

Expected: FAIL because `request_type` is ignored and the policy is not invoked.

- [ ] **Step 3: Implement request-type validation and normalization.**

```php
'request_type' => ['required', Rule::in(['manual_attendance', 'missing_clock_out'])],
```

For `missing_clock_out`, call `assertEligible()`, require `check_out_at`, prohibit `check_in_at`, derive `shift_id` from the eligible attendance when no override is needed, normalize the submitted local timestamp, and compare it with the attendance clock-in. For `manual_attendance`, retain the existing “one of check-in/check-out” behavior. Persist `request_type` and return it in `payload()`.

- [ ] **Step 4: Re-run the portal and policy tests.**

Run: `php artisan test tests/Feature/PortalPageTest.php --filter="attendance_correction|missing_clock_out" && php artisan test tests/Feature/Hris/MissingClockOutRequestPolicyTest.php`

Expected: PASS.

- [ ] **Step 5: Commit the API slice.**

```bash
git add app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php tests/Feature/PortalPageTest.php tests/Feature/Hris/MissingClockOutRequestPolicyTest.php
git commit -m "feat: validate missing clock-out requests"
```

## Task 4: Keep approvals partial and category-aware in admin and employee portal

**Files:**
- Modify: `app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php`
- Modify: `app/Http/Controllers/Api/PortalApprovalController.php`
- Modify: `resources/js/pages/hris/attendance-approvals/index.tsx`
- Modify: `tests/Feature/Hris/ApprovalSettingsTest.php`
- Create: `tests/Feature/Hris/MissingClockOutApprovalTest.php`

**Interfaces:**
- Consumes: `AttendanceCorrectionRequest.request_type = 'missing_clock_out'` from Task 3.
- Produces: final approval that modifies only `EmployeeAttendance.check_out_at` for a missing-clock-out request and payload rows with a `request_type` label.

- [ ] **Step 1: Write failing tests for admin and portal approval.**

```php
public function test_approval_of_missing_clock_out_preserves_existing_check_in(): void
{
    $attendance = EmployeeAttendance::factory()->create([
        'check_in_at' => '2026-07-01 01:00:00',
        'check_out_at' => null,
    ]);
    $request = AttendanceCorrectionRequest::factory()->create([
        'employee_id' => $attendance->employee_id,
        'attendance_date' => '2026-07-01',
        'request_type' => 'missing_clock_out',
        'check_in_at' => null,
        'check_out_at' => '2026-07-01 10:00:00',
    ]);

    $this->actingAs($owner)->post(route('hris.attendance-approvals.approve', $request));

    $this->assertSame('2026-07-01 01:00:00', $attendance->fresh()->check_in_at->format('Y-m-d H:i:s'));
    $this->assertSame('2026-07-01 10:00:00', $attendance->fresh()->check_out_at->format('Y-m-d H:i:s'));
}
```

Also assert the two-line first approval remains `pending`, and final approval through `/portal/api/approvals/attendance/{id}/approve` has the same partial-update behavior.

- [ ] **Step 2: Run approval tests to verify they fail.**

Run: `php artisan test tests/Feature/Hris/MissingClockOutApprovalTest.php tests/Feature/Hris/ApprovalSettingsTest.php`

Expected: FAIL because the payload lacks the category and the portal approval currently overwrites attendance with nullable fields.

- [ ] **Step 3: Extract one attendance-application helper and use it in both controllers.**

```php
private function attendanceAttributes(AttendanceCorrectionRequest $request, ?EmployeeAttendance $existing): array
{
    return [
        'check_in_at' => $request->request_type === 'missing_clock_out'
            ? $existing?->check_in_at
            : ($request->check_in_at ?? $existing?->check_in_at),
        'check_out_at' => $request->check_out_at ?? $existing?->check_out_at,
    ];
}
```

Keep `shift_id`, `timezone`, `status`, and notes consistent with the existing admin controller. Add `request_type` to each approval payload and show “Lupa Absen”/“Lupa Absen Pulang” in the admin table and detail dialog.

- [ ] **Step 4: Re-run approval tests and TypeScript checking.**

Run: `php artisan test tests/Feature/Hris/MissingClockOutApprovalTest.php tests/Feature/Hris/ApprovalSettingsTest.php && npm run types`

Expected: PASS.

- [ ] **Step 5: Commit the approval slice.**

```bash
git add app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php app/Http/Controllers/Api/PortalApprovalController.php resources/js/pages/hris/attendance-approvals/index.tsx tests/Feature/Hris/MissingClockOutApprovalTest.php tests/Feature/Hris/ApprovalSettingsTest.php
git commit -m "feat: approve missing clock-out corrections"
```

## Task 5: Make the portal form category-specific and expose eligibility cleanly

**Files:**
- Modify: `app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php`
- Modify: `resources/js/pages/portal/attendance-request.tsx`
- Create: `tests/Frontend/portal-attendance-request.test.mjs`
- Modify: `tests/Feature/PortalPageTest.php`

**Interfaces:**
- Consumes: category-bearing request API from Task 3.
- Produces: `request_type` selection in the portal UI; `missing_clock_out` payloads omit `check_in_at` and show a single clock-out time field.

- [ ] **Step 1: Write a failing frontend source test and eligibility API test.**

```js
test('portal attendance request offers the two request categories', () => {
    assert.match(source, /value="manual_attendance"/);
    assert.match(source, /value="missing_clock_out"/);
    assert.match(source, /Lupa Absen Pulang/);
    assert.match(source, /check_in_at: requestType === 'missing_clock_out' \? null/);
});
```

Add an API assertion that index payload includes `request_type`; if the controller exposes an `eligible_missing_clock_out_dates` list, assert the user only receives their own incomplete attendances within the effective deadline.

- [ ] **Step 2: Run tests to verify they fail.**

Run: `node --test tests/Frontend/portal-attendance-request.test.mjs && php artisan test tests/Feature/PortalPageTest.php --filter=attendance_correction`

Expected: FAIL because the current form has no category selector.

- [ ] **Step 3: Implement the conditional form.**

```tsx
<select value={form.request_type} onChange={(event) => setForm((current) => ({ ...current, request_type: event.target.value as RequestType }))}>
    <option value="manual_attendance">Lupa Absen</option>
    <option value="missing_clock_out">Lupa Absen Pulang</option>
</select>
```

When `request_type === 'missing_clock_out'`, restrict the date select to server-returned eligible dates, hide the clock-in field, require the clock-out field, use the selected attendance’s shift label, and submit `check_in_at: null`. Reset category-specific fields when the sheet closes. Render category labels on history cards.

- [ ] **Step 4: Re-run frontend and portal tests, then build.**

Run: `node --test tests/Frontend/portal-attendance-request.test.mjs && php artisan test tests/Feature/PortalPageTest.php --filter="attendance_correction|missing_clock_out" && npm run build`

Expected: PASS; Vite may emit the existing non-blocking chunk-size warning.

- [ ] **Step 5: Commit the portal UX slice.**

```bash
git add app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php resources/js/pages/portal/attendance-request.tsx tests/Frontend/portal-attendance-request.test.mjs tests/Feature/PortalPageTest.php
git commit -m "feat: add portal missing clock-out form"
```

## Task 6: Verify auto-sync interaction and run the final regression suite

**Files:**
- Modify: `app/Services/MissingCheckoutLeaveSyncService.php` only if a targeted test reveals that it changes a pending request; otherwise leave production code unchanged.
- Modify: `tests/Feature/Hris/MissingCheckoutLeaveSyncTest.php`
- Test: `tests/Feature/Hris/MissingClockOutRequestPolicyTest.php`
- Test: `tests/Feature/Hris/MissingClockOutApprovalTest.php`
- Test: `tests/Feature/Settings/AttendanceSettingTest.php`
- Test: `tests/Feature/PortalPageTest.php`

**Interfaces:**
- Consumes: all feature slices from Tasks 1--5.
- Produces: verified behavior that sync may complete attendance but does not mutate existing pending correction requests.

- [ ] **Step 1: Write a failing sync regression test.**

```php
public function test_sync_does_not_delete_or_approve_a_pending_missing_clock_out_request(): void
{
    $request = AttendanceCorrectionRequest::factory()->create([
        'request_type' => 'missing_clock_out',
        'status' => 'pending',
    ]);

    app(MissingCheckoutLeaveSyncService::class)->sync($request->user_id, $request->attendance_date->toDateString());

    $this->assertSame('pending', $request->fresh()->status);
}
```

- [ ] **Step 2: Run it to verify the current sync behavior.**

Run: `php artisan test tests/Feature/Hris/MissingCheckoutLeaveSyncTest.php --filter=pending_missing_clock_out`

Expected: PASS if the existing sync does not touch correction requests; otherwise FAIL and identify the smallest change needed to preserve pending requests.

- [ ] **Step 3: Make only the required sync safeguard.**

If the test failed, preserve the request row and its status while allowing attendance sync to complete. Do not auto-approve, delete, or silently rewrite a pending employee request.

- [ ] **Step 4: Run the complete focused verification set.**

Run: `php artisan test tests/Feature/Hris/MissingClockOutRequestPolicyTest.php tests/Feature/Hris/MissingClockOutApprovalTest.php tests/Feature/Hris/MissingCheckoutLeaveSyncTest.php tests/Feature/Settings/AttendanceSettingTest.php tests/Feature/PortalPageTest.php && node --test tests/Frontend/portal-attendance-request.test.mjs && npm run types && npm run build`

Expected: all tests pass; record unrelated pre-existing failures separately rather than changing unrelated code.

- [ ] **Step 5: Commit any necessary regression safeguard and inspect the final worktree.**

```bash
git add app/Services/MissingCheckoutLeaveSyncService.php tests/Feature/Hris/MissingCheckoutLeaveSyncTest.php
git commit -m "test: cover missing clock-out sync interaction"
git status --short
```

## Plan self-review

- Spec coverage: Tasks 1--2 cover tenant settings and dynamic cut-off; Task 3 enforces eligibility and duplicate prevention; Task 4 preserves approval behavior; Task 5 implements the portal categories and labels; Task 6 verifies interaction with auto-sync.
- Placeholder scan: no unfinished markers or unspecified validation remains; each task includes a concrete test command and expected result.
- Interface consistency: `request_type` uses only `manual_attendance` and `missing_clock_out`; both deadline and eligibility are owned by `MissingClockOutRequestPolicy`; all approval code retains the `attendance` workflow type.
