# Employee Invitation n8n Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the employee portal invitation email dispatch with a secure, retryable n8n webhook containing employee identity, organization, contact, and temporary login credentials.

**Architecture:** Keep portal-account creation in `UserPortalAccountService` and the existing invitation controller route. Introduce one encrypted queued job responsible only for the outbound n8n HTTP contract, with URL and Basic Auth supplied through `config/services.php`.

**Tech Stack:** Laravel 13, Laravel HTTP client, database queue, PHPUnit feature tests.

## Global Constraints

- Keep the existing `hris.employees.invite-user` route and employee-table action.
- Store the webhook password only in `.env`; tracked files contain safe placeholders.
- Use `POST` JSON with Basic Auth.
- The queued job must implement `ShouldQueue` and `ShouldBeEncrypted`.
- Never log the Basic Auth password, temporary password, or complete payload.
- Use `https://auto.humi.web.id/webhook-test/staff-invitation` as the initial development endpoint.
- Preserve existing portal-account creation, password reset, and OTP-setting behavior.

---

## File Structure

- Create `app/Jobs/SendEmployeeInvitationWebhook.php`: encrypted queued outbound HTTP request and retry policy.
- Create `tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php`: real job behavior at the HTTP boundary.
- Modify `app/Http/Controllers/Hris/EmployeeController.php`: build the invitation payload and dispatch the webhook job.
- Modify `tests/Feature/Hris/EmployeeManagementTest.php`: verify route-level account creation and webhook dispatch.
- Modify `config/services.php`: expose the n8n staff invitation configuration.
- Modify `.env.example`: document safe environment placeholders.
- Modify local `.env`: add the provided endpoint and Basic Auth credentials without committing them.

### Task 1: Encrypted n8n Webhook Job

**Files:**
- Create: `app/Jobs/SendEmployeeInvitationWebhook.php`
- Create: `tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php`
- Modify: `config/services.php`
- Modify: `.env.example`
- Modify: `.env`

**Interfaces:**
- Consumes: `config('services.n8n.staff_invitation.*')`.
- Produces: `SendEmployeeInvitationWebhook::__construct(array $payload)` and `handle(): void`.

- [ ] **Step 1: Write the failing job test**

Create a test that configures:

```php
config()->set('services.n8n.staff_invitation', [
    'url' => 'https://n8n.example.test/webhook/staff-invitation',
    'username' => 'test-user',
    'password' => 'test-password',
    'timeout' => 10,
]);
```

Instantiate the job with a literal ten-field payload, assert it implements `ShouldBeEncrypted`, execute `handle()`, then use `Http::assertSent()` to verify the URL, `Authorization: Basic ...` header, and exact JSON body.

Add a second test with `Http::response([], 500)` and assert that `handle()` throws `RequestException`, proving n8n failures remain retryable.

- [ ] **Step 2: Run the job test and verify RED**

Run:

```bash
php artisan test tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php
```

Expected: FAIL because `SendEmployeeInvitationWebhook` does not exist.

- [ ] **Step 3: Implement configuration and the minimal job**

Add:

```php
'n8n' => [
    'staff_invitation' => [
        'url' => env('N8N_STAFF_INVITATION_WEBHOOK_URL'),
        'username' => env('N8N_STAFF_INVITATION_USERNAME'),
        'password' => env('N8N_STAFF_INVITATION_PASSWORD'),
        'timeout' => (int) env('N8N_STAFF_INVITATION_TIMEOUT', 15),
    ],
],
```

The job must:

```php
class SendEmployeeInvitationWebhook implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public readonly array $payload)
    {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        Http::withBasicAuth($username, $password)
            ->acceptJson()
            ->asJson()
            ->timeout($timeout)
            ->post($url, $this->payload)
            ->throw();
    }
}
```

Validate that URL and Basic Auth values are non-empty before sending and throw `RuntimeException` when configuration is incomplete.
Before rethrowing an unsuccessful response, log only the employee identifier and HTTP status.

- [ ] **Step 4: Add environment values**

Add safe empty placeholders to `.env.example`. Put the supplied URL, username, and password only in the ignored local `.env`.

- [ ] **Step 5: Run the job test and verify GREEN**

Run:

```bash
php artisan test tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Jobs/SendEmployeeInvitationWebhook.php tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php config/services.php .env.example
git commit -m "feat: add n8n employee invitation webhook job"
```

### Task 2: Employee Invitation Route Integration

**Files:**
- Modify: `app/Http/Controllers/Hris/EmployeeController.php:1222-1255`
- Modify: `tests/Feature/Hris/EmployeeManagementTest.php:721-748`

**Interfaces:**
- Consumes: `SendEmployeeInvitationWebhook::__construct(array $payload)`.
- Produces: queued invitation payload with keys `employee_id`, `company_name`, `name`, `division`, `position`, `email`, `phone`, `username`, `temporary_password`, and `login_url`.

- [ ] **Step 1: Replace the existing queue assertion with a failing webhook assertion**

Create the owner `CompanySetting`, `Division`, `Position`, and employee fixtures with literal values. Trigger the existing route and assert that `SendEmployeeInvitationWebhook` is queued on `emails` with this exact payload:

```php
[
    'employee_id' => 'EMP-N8N-01',
    'company_name' => 'Humi Test Company',
    'name' => 'N8N Employee',
    'division' => 'Operations',
    'position' => 'Supervisor',
    'email' => 'n8n-invitation@example.com',
    'phone' => '628123456789',
    'username' => 'EMP-N8N-01',
    'temporary_password' => '628123456789',
    'login_url' => route('portal.login'),
]
```

Also assert `SendEmployeePortalInvitation` is not queued.

- [ ] **Step 2: Run the focused route test and verify RED**

Run:

```bash
php artisan test tests/Feature/Hris/EmployeeManagementTest.php --filter=employee_portal_invitation
```

Expected: FAIL because the route still dispatches the email job.

- [ ] **Step 3: Dispatch the webhook job**

Load `division` and `position`, resolve `CompanySetting.name` by the authenticated account owner, normalize the phone with `WhatsAppPhone::normalize()`, and dispatch:

```php
SendEmployeeInvitationWebhook::dispatch([
    'employee_id' => $employee->employee_code,
    'company_name' => $companyName,
    'name' => $employee->full_name,
    'division' => $employee->division?->name ?? '',
    'position' => $employee->position?->name ?? '',
    'email' => $portalUser->email,
    'phone' => $normalizedPhone,
    'username' => $employee->employee_code,
    'temporary_password' => $invitation['password'],
    'login_url' => route('portal.login'),
]);
```

Change the success copy to `Undangan login portal dijadwalkan melalui automation.` and the exception copy to `Undangan gagal: tidak dapat menjadwalkan automation karyawan.`

- [ ] **Step 4: Run route and job tests**

Run:

```bash
php artisan test tests/Feature/Hris/EmployeeManagementTest.php --filter=invitation
php artisan test tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php
```

Expected: PASS with no outbound network request.

- [ ] **Step 5: Run regression checks**

Run:

```bash
php artisan test tests/Feature/Hris/EmployeeManagementTest.php
php artisan test tests/Feature/Jobs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Hris/EmployeeController.php tests/Feature/Hris/EmployeeManagementTest.php
git commit -m "feat: route employee invitations through n8n"
```

### Task 3: Final Verification

**Files:**
- Verify only.

**Interfaces:**
- Consumes: completed webhook job and employee invitation route.
- Produces: evidence that application code and configuration are valid.

- [ ] **Step 1: Verify formatting and configuration**

Run:

```bash
vendor/bin/pint --test app/Jobs/SendEmployeeInvitationWebhook.php app/Http/Controllers/Hris/EmployeeController.php config/services.php tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php tests/Feature/Hris/EmployeeManagementTest.php
php artisan tinker --execute='dump([
    "url_configured" => filled(config("services.n8n.staff_invitation.url")),
    "username_configured" => filled(config("services.n8n.staff_invitation.username")),
    "password_configured" => filled(config("services.n8n.staff_invitation.password")),
]);'
```

Confirm all three values are `true` without printing any credential value.

- [ ] **Step 2: Run final focused tests**

Run:

```bash
php artisan test tests/Feature/Jobs/SendEmployeeInvitationWebhookTest.php tests/Feature/Hris/EmployeeManagementTest.php
```

Expected: all tests PASS.

- [ ] **Step 3: Verify frontend compilation remains intact**

Run:

```bash
npm run types:check
npm run build
```

Expected: both commands exit successfully.
