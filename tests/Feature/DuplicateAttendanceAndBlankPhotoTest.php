<?php

namespace Tests\Feature;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DuplicateAttendanceAndBlankPhotoTest extends TestCase
{
    use RefreshDatabase;

    private function generatePhotoBase64(bool $blank = false): string
    {
        $im = imagecreatetruecolor(200, 200);

        if (! $blank) {
            $bg = imagecolorallocate($im, 220, 180, 140);
            imagefilledrectangle($im, 0, 0, 200, 200, $bg);
            $fg = imagecolorallocate($im, 40, 80, 180);
            imagefilledellipse($im, 100, 100, 80, 100, $fg);
        }

        ob_start();
        imagejpeg($im);
        $binary = ob_get_clean();
        imagedestroy($im);

        return 'data:image/jpeg;base64,'.base64_encode($binary);
    }

    public function test_employee_cannot_have_double_attendance_on_same_day(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_wfa' => true,
        ]);
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'email' => $employee->email,
        ]);

        CompanySetting::query()->create([
            'user_id' => $admin->id,
            'attendance_mode' => 'wfa',
        ]);

        $date = '2026-10-05';

        // First check in succeeds
        $response1 = $this->actingAs($portalUser)->postJson(route('portal.api.attendances.store'), [
            'employee_id' => $employee->id,
            'attendance_date' => $date,
            'status' => 'present',
            'check_in_at' => '2026-10-05T08:00:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
        ]);

        $response1->assertStatus(201);
        $this->assertEquals(1, EmployeeAttendance::where('employee_id', $employee->id)->whereDate('attendance_date', $date)->count());

        // Second check in while first attendance is still open is rejected
        $response2 = $this->actingAs($portalUser)->postJson(route('portal.api.attendances.store'), [
            'employee_id' => $employee->id,
            'attendance_date' => $date,
            'status' => 'present',
            'check_in_at' => '2026-10-05T08:05:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
        ]);

        $response2->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Masih ada absensi yang belum clock out.',
            ]);

        // Clock out first attendance
        $att = EmployeeAttendance::where('employee_id', $employee->id)->whereDate('attendance_date', $date)->first();
        $att->update(['check_out_at' => '2026-10-05 17:00:00']);

        // Third check in after clock out is also rejected
        $response3 = $this->actingAs($portalUser)->postJson(route('portal.api.attendances.store'), [
            'employee_id' => $employee->id,
            'attendance_date' => $date,
            'status' => 'present',
            'check_in_at' => '2026-10-05T18:00:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
        ]);

        $response3->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Absensi untuk tanggal ini sudah ada.',
            ]);

        // Still exactly 1 attendance
        $this->assertEquals(1, EmployeeAttendance::where('employee_id', $employee->id)->whereDate('attendance_date', $date)->count());
    }

    public function test_database_unique_constraint_blocks_duplicate_regular_attendance(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create(['user_id' => $admin->id]);
        $date = '2026-10-05';

        // Insert first regular attendance
        EmployeeAttendance::create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => $date,
            'status' => 'present',
            'is_backup' => false,
        ]);

        // Direct second insert of regular attendance should fail at DB level
        $this->expectException(QueryException::class);

        EmployeeAttendance::create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => $date,
            'status' => 'present',
            'is_backup' => false,
        ]);
    }

    public function test_blank_black_photo_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_wfa' => true,
        ]);
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'email' => $employee->email,
        ]);

        CompanySetting::query()->create([
            'user_id' => $admin->id,
            'attendance_mode' => 'wfa',
        ]);

        $blankPhoto = $this->generatePhotoBase64(true);

        $response = $this->actingAs($portalUser)->postJson(route('portal.api.attendances.store'), [
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-05',
            'status' => 'present',
            'check_in_at' => '2026-10-05T08:00:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
            'check_in_photo' => $blankPhoto,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('Foto presensi terdeteksi kosong/blank', $response->json('message'));
        $this->assertEquals(0, EmployeeAttendance::where('employee_id', $employee->id)->count());
    }

    public function test_valid_photo_is_accepted_and_stored(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_wfa' => true,
        ]);
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'email' => $employee->email,
        ]);

        CompanySetting::query()->create([
            'user_id' => $admin->id,
            'attendance_mode' => 'wfa',
        ]);

        $validPhoto = $this->generatePhotoBase64(false);

        $response = $this->actingAs($portalUser)->postJson(route('portal.api.attendances.store'), [
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-05',
            'status' => 'present',
            'check_in_at' => '2026-10-05T08:00:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
            'check_in_photo' => $validPhoto,
        ]);

        $response->assertStatus(201);

        $attendance = EmployeeAttendance::where('employee_id', $employee->id)->first();
        $this->assertNotNull($attendance);
        $this->assertNotNull($attendance->check_in_photo_url);
    }

    public function test_attendance_can_be_soft_deleted_and_restored(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create(['user_id' => $admin->id]);

        $attendance = EmployeeAttendance::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-05',
            'status' => 'present',
            'check_in_at' => '2026-10-05 08:00:00',
        ]);

        $attendanceId = $attendance->id;

        // Perform soft delete
        $attendance->delete();

        // Normal query should not find it
        $this->assertNull(EmployeeAttendance::query()->find($attendanceId));

        // withTrashed query should find it
        $trashed = EmployeeAttendance::withTrashed()->find($attendanceId);
        $this->assertNotNull($trashed);
        $this->assertNotNull($trashed->deleted_at);

        // Database still contains the row
        $this->assertDatabaseHas('employee_attendances', [
            'id' => $attendanceId,
        ]);
        $this->assertNotNull(\Illuminate\Support\Facades\DB::table('employee_attendances')->where('id', $attendanceId)->value('deleted_at'));

        // Restore
        $trashed->restore();

        // Normal query should find it again
        $restored = EmployeeAttendance::query()->find($attendanceId);
        $this->assertNotNull($restored);
        $this->assertNull($restored->deleted_at);
    }

    public function test_soft_deleted_attendance_allows_new_attendance_on_same_day(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_wfa' => true,
        ]);
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'email' => $employee->email,
        ]);

        CompanySetting::query()->create([
            'user_id' => $admin->id,
            'attendance_mode' => 'wfa',
        ]);

        $validPhoto = $this->generatePhotoBase64(false);

        // First attendance
        $attendance1 = EmployeeAttendance::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-05',
            'status' => 'present',
            'check_in_at' => '2026-10-05 08:00:00',
        ]);

        // Soft delete the first attendance
        $attendance1->delete();
        $this->assertNotNull($attendance1->fresh()->deleted_at);

        // Submitting attendance on the same day should now succeed because the previous one is soft-deleted
        $response = $this->actingAs($portalUser)->postJson(route('portal.api.attendances.store'), [
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-05',
            'status' => 'present',
            'check_in_at' => '2026-10-05T08:30:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
            'check_in_photo' => $validPhoto,
        ]);

        $response->assertStatus(201);

        // Active attendance is the new one
        $activeAttendance = EmployeeAttendance::query()->where('employee_id', $employee->id)->first();
        $this->assertNotNull($activeAttendance);
        $this->assertNotEquals($attendance1->id, $activeAttendance->id);

        // Total attendances including trashed is 2
        $this->assertEquals(2, EmployeeAttendance::withTrashed()->where('employee_id', $employee->id)->count());
    }

    public function test_clock_out_does_not_fail_with_attendance_date_error_when_date_unchanged(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_wfa' => true,
        ]);
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'email' => $employee->email,
        ]);

        CompanySetting::query()->create([
            'user_id' => $admin->id,
            'attendance_mode' => 'wfa',
        ]);

        // Simulating two records existing for the same date (e.g. regular and backup)
        $todayStr = today()->toDateString();
        $attendance1 = EmployeeAttendance::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => $todayStr,
            'status' => 'present',
            'is_backup' => true,
            'check_in_at' => "{$todayStr} 14:05:00",
        ]);

        $attendance2 = EmployeeAttendance::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => $todayStr,
            'status' => 'present',
            'is_backup' => false,
            'check_in_at' => "{$todayStr} 14:05:00",
        ]);

        $validPhoto = $this->generatePhotoBase64(false);

        // Updating/clocking out on attendance2 should NOT fail with "Attendance date sudah digunakan."
        $response = $this->actingAs($portalUser)->putJson(route('portal.api.attendances.update', $attendance2), [
            'employee_id' => $employee->id,
            'attendance_date' => $todayStr,
            'status' => 'present',
            'check_in_at' => "{$todayStr}T14:05:00",
            'check_out_at' => "{$todayStr}T22:00:00",
            'check_out_latitude' => -6.2,
            'check_out_longitude' => 106.8,
            'check_out_photo' => $validPhoto,
        ]);

        $response->assertOk();
        $this->assertNotNull($attendance2->fresh()->check_out_at);
    }

    public function test_admin_can_delete_duplicate_attendance_record(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
        ]);

        $attendance = EmployeeAttendance::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-04',
            'status' => 'present',
            'check_in_at' => '2026-10-04 14:05:00',
        ]);

        $response = $this->actingAs($admin)->delete(route('hris.attendances.destroy', $attendance));

        $response->assertRedirect();
        $this->assertSoftDeleted('employee_attendances', ['id' => $attendance->id]);
    }

    public function test_admin_can_reupload_attendance_photo(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
        ]);

        $attendance = EmployeeAttendance::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-10-04',
            'status' => 'present',
            'check_in_at' => '2026-10-04 14:05:00',
            'check_in_photo_url' => null,
            'check_out_photo_url' => null,
        ]);

        $fileIn = UploadedFile::fake()->image('checkin_replacement.jpg', 300, 300);
        $fileOut = UploadedFile::fake()->image('checkout_replacement.jpg', 300, 300);

        // Upload check-in photo
        $responseIn = $this->actingAs($admin)->post(route('hris.attendances.photo.upload', $attendance), [
            'type' => 'in',
            'photo' => $fileIn,
        ]);

        $responseIn->assertRedirect();
        $attendance->refresh();
        $this->assertNotNull($attendance->check_in_photo_url);

        // Upload check-out photo
        $responseOut = $this->actingAs($admin)->post(route('hris.attendances.photo.upload', $attendance), [
            'type' => 'out',
            'photo' => $fileOut,
        ]);

        $responseOut->assertRedirect();
        $attendance->refresh();
        $this->assertNotNull($attendance->check_out_photo_url);
    }
}

