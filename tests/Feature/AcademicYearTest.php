<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AcademicYearTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        // Create tenant
        $this->tenant = Tenant::create([
            'id' => 'test-school',
            'name' => 'Test School',
            'slug' => 'test-school',
            'email' => 'test@school.com',
            'status' => 'active',
            'subscription_plan' => 'free',
        ]);

        // Create role with permissions
        $role = Role::create(['name' => 'school-owner', 'guard_name' => 'web']);

        // Create user
        $this->user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email_verified_at' => now(),
        ]);
        $this->user->assignRole($role);
    }

    public function test_user_can_view_academic_years_list(): void
    {
        AcademicYear::create([
            'tenant_id' => $this->tenant->id,
            'name' => '2024-2025',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->get('/academic-years');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('academic-years/index')
                ->has('academicYears.data', 1)
        );
    }

    public function test_user_can_view_create_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/academic-years/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('academic-years/create')
        );
    }

    public function test_user_can_create_academic_year(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/academic-years', [
                'name' => '2025-2026',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => 'upcoming',
            ]);

        $response->assertRedirect('/academic-years');

        $this->assertDatabaseHas('academic_years', [
            'tenant_id' => $this->tenant->id,
            'name' => '2025-2026',
            'status' => 'upcoming',
        ]);
    }

    public function test_validation_fails_for_invalid_dates(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/academic-years', [
                'name' => '2025-2026',
                'start_date' => '2025-12-31',
                'end_date' => '2025-01-01', // End before start
                'status' => 'upcoming',
            ]);

        $response->assertSessionHasErrors('end_date');
    }

    public function test_user_can_update_academic_year(): void
    {
        $academicYear = AcademicYear::create([
            'tenant_id' => $this->tenant->id,
            'name' => '2024-2025',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'upcoming',
        ]);

        $response = $this->actingAs($this->user)
            ->put("/academic-years/{$academicYear->id}", [
                'name' => '2024-2025 Updated',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'status' => 'active',
            ]);

        $response->assertRedirect('/academic-years');

        $this->assertDatabaseHas('academic_years', [
            'id' => $academicYear->id,
            'name' => '2024-2025 Updated',
            'status' => 'active',
        ]);
    }

    public function test_user_can_delete_academic_year(): void
    {
        $academicYear = AcademicYear::create([
            'tenant_id' => $this->tenant->id,
            'name' => '2024-2025',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'upcoming',
        ]);

        $response = $this->actingAs($this->user)
            ->delete("/academic-years/{$academicYear->id}");

        $response->assertRedirect('/academic-years');

        $this->assertSoftDeleted('academic_years', [
            'id' => $academicYear->id,
        ]);
    }

    public function test_user_can_set_current_academic_year(): void
    {
        $year1 = AcademicYear::create([
            'tenant_id' => $this->tenant->id,
            'name' => '2024-2025',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'active',
            'is_current' => true,
        ]);

        $year2 = AcademicYear::create([
            'tenant_id' => $this->tenant->id,
            'name' => '2025-2026',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => 'upcoming',
            'is_current' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->post("/academic-years/{$year2->id}/set-current");

        $response->assertRedirect('/academic-years');

        // Verify year2 is now current
        $this->assertDatabaseHas('academic_years', [
            'id' => $year2->id,
            'is_current' => true,
        ]);

        // Verify year1 is no longer current
        $this->assertDatabaseHas('academic_years', [
            'id' => $year1->id,
            'is_current' => false,
        ]);
    }

    public function test_user_cannot_access_other_tenant_academic_year(): void
    {
        $otherTenant = Tenant::create([
            'id' => 'other-school',
            'name' => 'Other School',
            'slug' => 'other-school',
            'email' => 'other@school.com',
            'status' => 'active',
            'subscription_plan' => 'free',
        ]);

        $otherYear = AcademicYear::create([
            'tenant_id' => $otherTenant->id,
            'name' => '2024-2025',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->get("/academic-years/{$otherYear->id}/edit");

        $response->assertStatus(403);
    }
}
