<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\NotificationAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'audience' => ['nullable', 'string'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? '',
            'audience' => $validated['audience'] ?? '',
        ];

        $notifications = NotificationAnnouncement::query()
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['audience'] !== '', fn ($query) => $query->where('audience', $filters['audience']))
            ->latest('publish_at')
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (NotificationAnnouncement $notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'audience' => $notification->audience,
                'channel' => $notification->channel,
                'status' => $notification->status,
                'publish_at' => $notification->publish_at?->format('Y-m-d\TH:i'),
                'expires_at' => $notification->expires_at?->format('Y-m-d\TH:i'),
                'attachment_name' => $notification->attachment_name,
                'attachment_url' => $notification->attachment_path
                    ? route('hris.notifications.download', $notification)
                    : null,
            ]);

        return Inertia::render('hris/notifications/index', [
            'notifications' => $notifications,
            'filters' => $filters,
            'statusOptions' => ['draft', 'published', 'archived'],
            'audienceOptions' => ['all', 'active_employees', 'inactive_employees'],
            'channelOptions' => ['portal', 'whatsapp', 'email'],
            'stats' => [
                'published' => NotificationAnnouncement::query()->where('status', 'published')->count(),
                'draft' => NotificationAnnouncement::query()->where('status', 'draft')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $notification = NotificationAnnouncement::query()->create(
            $this->validatedPayload($request),
        );
        $this->storeAttachment($request->file('attachment'), $notification);

        return back();
    }

    public function update(Request $request, NotificationAnnouncement $notification): RedirectResponse
    {
        $notification->update($this->validatedPayload($request));
        $this->storeAttachment($request->file('attachment'), $notification);

        return back();
    }

    public function destroy(NotificationAnnouncement $notification): RedirectResponse
    {
        $this->deleteAttachment($notification);
        $notification->delete();

        return back();
    }

    public function download(NotificationAnnouncement $notification): StreamedResponse
    {
        abort_unless($notification->attachment_path, 404);

        return Storage::disk('local')->download(
            $notification->attachment_path,
            $notification->attachment_name ?? basename($notification->attachment_path),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
            'audience' => ['required', Rule::in(['all', 'active_employees', 'inactive_employees'])],
            'channel' => ['required', Rule::in(['portal', 'whatsapp', 'email'])],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'publish_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:publish_at'],
            'attachment' => ['nullable', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx'],
        ]);
    }

    private function storeAttachment(?UploadedFile $file, NotificationAnnouncement $notification): void
    {
        if (! $file) {
            return;
        }

        $this->deleteAttachment($notification);
        $path = $file->store('notification-attachments', 'local');

        $notification->update([
            'attachment_path' => $path,
            'attachment_name' => $file->getClientOriginalName(),
            'attachment_mime_type' => $file->getClientMimeType(),
            'attachment_size' => $file->getSize(),
        ]);
    }

    private function deleteAttachment(NotificationAnnouncement $notification): void
    {
        if ($notification->attachment_path) {
            Storage::disk('local')->delete($notification->attachment_path);
        }
    }
}
