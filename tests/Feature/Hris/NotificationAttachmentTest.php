<?php

namespace Tests\Feature\Hris;

use App\Models\NotificationAnnouncement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NotificationAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_attachment_is_stored_on_local_disk(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('hris.notifications.store'), [
            'title' => 'Panduan onboarding',
            'message' => 'Silakan membaca dokumen terlampir.',
            'audience' => 'all',
            'channel' => 'portal',
            'status' => 'published',
            'attachment' => UploadedFile::fake()->create('panduan.pdf', 120, 'application/pdf'),
        ])->assertRedirect();

        $notification = NotificationAnnouncement::query()->firstOrFail();

        $this->assertSame('panduan.pdf', $notification->attachment_name);
        $this->assertSame('application/pdf', $notification->attachment_mime_type);
        $this->assertNotNull($notification->attachment_path);
        Storage::disk('local')->assertExists($notification->attachment_path);
    }
}
