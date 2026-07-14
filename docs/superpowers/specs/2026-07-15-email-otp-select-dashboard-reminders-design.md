# Email OTP, Select Interaction, and Employment Reminders Design

## Goal

Move every authentication OTP delivery path from WhatsApp to email, remove the WhatsApp OTP login experience, restore mouse selection for searchable selects inside dialogs, and surface contract and probation reminders on the dashboard.

## Scope

This change covers account activation, portal OTP login, profile changes that require account re-verification, the shared searchable select component, and the authenticated admin dashboard. Existing non-OTP WhatsApp features such as payslip delivery and operational reminders remain unchanged.

The existing NIK and password portal login remains available. Its current password contract is not changed by this work.

## Email OTP Architecture

Introduce an email-focused OTP service that owns OTP generation, hashing, resend throttling, expiry, delivery, and verification. OTP messages are delivered through Laravel Mail to the user's registered email address. Account activation marks `email_verified_at`; it no longer depends on `phone_verified_at`.

Use explicit generic email OTP persistence fields:

- `email_otp_code`
- `email_otp_sent_at`
- `email_otp_expires_at`

A migration adds these fields and removes the obsolete WhatsApp OTP fields after application references have moved. Existing verified accounts remain activated by copying `phone_verified_at` to `email_verified_at` only when `email_verified_at` is empty. Existing unhashed or active WhatsApp OTP values are not migrated because delivery has changed and stale OTP sessions must request a new email code.

The activation controller and UI display the destination email, use email-specific copy, retain the one-minute resend cooldown, and keep the ten-minute OTP lifetime.

Portal OTP login resolves a portal user by registered employee email instead of WhatsApp phone number. Its session keys and validation messages become email-oriented. Successful verification authenticates the portal user and marks their email verified. The NIK/password login remains as the alternate login method.

Registration and profile changes dispatch email OTP through the new service. Changing an email address clears `email_verified_at` and requires a new OTP. Changing only a phone number no longer invalidates account activation.

Remove the WhatsApp OTP job, service, rate-limit key, imports, UI labels, and tests that exist only for authentication OTP. Do not remove WAHA or WhatsApp notification services used by other application features.

## Mail Configuration

Production SMTP is configured exclusively through environment values. The sender address is `no-reply@humi.my.id`. The supplied mailbox password is stored only in the local/deployment `.env` and must not appear in committed source, tests, logs, generated files, or this specification.

`.env.example` documents placeholder SMTP variables without a real password. Delivery failures are reported through Laravel's normal exception reporting and shown to users as a generic retry message without exposing SMTP details.

## Searchable Select Fix

The root cause is the interaction between Headless UI's anchored `ComboboxOptions` and the modal Radix Dialog. Setting `anchor="bottom"` portals the options outside the dialog. Radix marks content outside its modal layer with `pointer-events: none`, so keyboard selection works while pointer clicks cannot reach the option.

Keep the searchable combobox and stop portaling its options. Render `ComboboxOptions` inside the component's existing `relative` wrapper and position it with local absolute positioning below the input. This preserves search, keyboard navigation, and existing call-site APIs while keeping options inside the modal's interactive layer.

The shared fix applies to Division, Sub Company, Position, Supervisor, employee filters, and every other `SearchableSelect` consumer. The primary regression flow is Add Employee, step 2, selecting Division and Sub Company with the mouse.

## Dashboard Employment Reminders

Add an `employmentReminders` payload to the dashboard controller for the authenticated account owner.

The current employee schema does not contain `contract_end_date`. Add a nullable date column, model cast, store/update validation, employee form field, and employee detail display for the contract end date. The field is relevant to fixed-term employees but remains nullable so existing employee records and non-contract employment types continue to work. This also makes the existing contract-expiry console command operational instead of silently depending on a missing column.

Contract reminders include active employees whose `contract_end_date` is between today and 30 days from today. Each item contains employee ID, display label, contract end date, remaining days, urgency, and an employee-page link.

Probation reminders include active employees with `employment_status = probation`. The expected review date is 90 days after `hire_date`. Items show days remaining before review or days overdue after the review date. Overdue reviews sort first, followed by the nearest upcoming review.

Render a compact dashboard card with separate Contract and Probation sections, summary counts, clear empty states, and links to the relevant employee record. The card follows the current dashboard visual system and does not redesign existing widgets.

## Error Handling and Security

- Do not log OTP codes or SMTP credentials.
- Store only hashed OTP codes.
- Keep the existing one-minute resend limit and ten-minute expiry.
- Return generic delivery errors to the browser while reporting the underlying exception server-side.
- Scope portal email lookup and dashboard reminders to the correct account owner.
- Preserve all non-OTP WhatsApp behavior.

## Testing and Verification

Backend feature tests cover:

- registration queues or sends an email OTP and never dispatches a WhatsApp OTP job;
- activation accepts a valid email OTP, rejects invalid or expired codes, clears used OTP fields, and marks the email verified;
- portal login requests OTP by registered employee email and authenticates after valid verification;
- profile email changes require a new email OTP while phone-only changes do not deactivate the account;
- dashboard contract reminders respect the 30-day window and account scope;
- dashboard probation reminders calculate upcoming and overdue 90-day reviews correctly.
- employee create and update flows persist an optional contract end date.

Frontend regression coverage verifies that searchable select options remain inside the dialog interaction layer. Browser QA repeats the exact Add Employee flow with mouse clicks for Division and Sub Company, then confirms the selected values change. Browser QA also checks the email OTP copy and the dashboard reminder card without relevant console errors.

Final verification runs targeted PHP tests, the full relevant auth/dashboard test set, formatting, TypeScript checks, the production frontend build, and browser interaction checks.

## Out of Scope

- Removing WAHA or WhatsApp notifications unrelated to authentication OTP.
- Changing the NIK/password portal authentication contract.
- Sending contract or probation reminder emails; this request adds dashboard reminders only.
- Redesigning the employee form or dashboard.
