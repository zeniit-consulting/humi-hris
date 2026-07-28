# Employee Invitation n8n Webhook Design

## Objective

Replace direct email delivery for the employee-table “Kirim invitation login” action with a queued HTTP webhook to n8n, while preserving the existing portal-account creation and temporary-password reset behavior.

## Data Flow

1. An authorized admin triggers the existing employee invitation route.
2. `UserPortalAccountService` creates or synchronizes the portal user and generates the temporary password.
3. The controller dispatches an encrypted queued webhook job instead of `SendEmployeePortalInvitation`.
4. The job sends a JSON `POST` request to the configured n8n endpoint using Basic Authentication.
5. n8n handles the final invitation delivery workflow.

The controller continues to apply the existing employee-activation OTP setting before dispatching the webhook.

## Webhook Configuration

Configuration is read through `config/services.php` from environment variables:

- `N8N_STAFF_INVITATION_WEBHOOK_URL`
- `N8N_STAFF_INVITATION_USERNAME`
- `N8N_STAFF_INVITATION_PASSWORD`
- `N8N_STAFF_INVITATION_TIMEOUT`

The initial development URL is `https://auto.humi.web.id/webhook-test/staff-invitation`. Production can switch to the n8n production webhook without changing application code.

Secrets must not be committed to tracked source files. `.env.example` contains safe empty placeholders.

## Payload Contract

The webhook receives:

```json
{
  "employee_id": "EMP-001",
  "company_name": "Example Company",
  "name": "Employee Name",
  "division": "Operations",
  "position": "Supervisor",
  "email": "employee@example.com",
  "phone": "628123456789",
  "username": "EMP-001",
  "temporary_password": "generated-password",
  "login_url": "https://example.com/portal/login"
}
```

`employee_id` and `username` use the established employee code. Company name follows the account owner’s company identity. Missing optional organization values are sent as empty strings. Phone numbers use the application’s normalized WhatsApp-compatible format when available.

## Queue and Failure Handling

The webhook job:

- implements `ShouldQueue` and `ShouldBeEncrypted` because it contains a temporary password;
- uses a dedicated queue suitable for outbound notifications;
- has bounded retries and timeout;
- throws when n8n returns a non-success response so Laravel retries the job;
- logs the employee identifier and response status without logging credentials, temporary passwords, or the full payload.

The HTTP action returns immediately after the job is accepted. Its success message states that invitation automation has been scheduled, not that n8n has completed delivery.

## Compatibility

The existing invitation route and employee-table action remain unchanged, so no frontend route regeneration is required. The old mail job and template may remain available for other callers, but this employee invitation action no longer dispatches it.

## Verification

Feature coverage must prove:

- the invitation route still creates or updates the portal account;
- the n8n job is queued instead of the email invitation job;
- the job sends the expected URL, Basic Auth, and complete JSON payload;
- successful n8n responses complete the job;
- unsuccessful responses raise an exception and remain retryable;
- missing employee email still prevents invitation dispatch.
