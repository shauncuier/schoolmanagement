<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolePermissionSeeder::class);

        // Create Super Admin user
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@schoolsync.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Create a demo school admin (for testing)
        $schoolAdmin = User::firstOrCreate(
            ['email' => 'school@demo.com'],
            [
                'name' => 'Demo School Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $schoolAdmin->assignRole('school-owner');

        // Seed other demo users
        $this->call(DemoUserSeeder::class);

        $this->command->info('✅ Roles, permissions, and default users seeded successfully!');
    }
}

