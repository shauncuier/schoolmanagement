<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure a demo tenant exists
        $tenant = Tenant::firstOrCreate(
            ['id' => 'demo-school'],
            [
                'name' => 'Demo International School',
                'slug' => 'demo-school',
                'email' => 'info@demo.com',
                'status' => 'active',
                'subscription_plan' => 'free',
            ]
        );

        $users = [
            [
                'name' => 'Dr. Jane Smith',
                'email' => 'principal@demo.com',
                'role' => 'principal',
            ],
            [
                'name' => 'John Doe',
                'email' => 'teacher@demo.com',
                'role' => 'teacher',
            ],
            [
                'name' => 'Alice Johnson',
                'email' => 'student@demo.com',
                'role' => 'student',
            ],
            [
                'name' => 'Robert Johnson',
                'email' => 'parent@demo.com',
                'role' => 'parent',
            ],
            [
                'name' => 'Mark Accountant',
                'email' => 'accountant@demo.com',
                'role' => 'accountant',
            ],
            [
                'name' => 'Sarah Librarian',
                'email' => 'librarian@demo.com',
                'role' => 'librarian',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            if (!$user->hasRole($userData['role'])) {
                $user->assignRole($userData['role']);
            }
        }

        // Update the school admin from DatabaseSeeder to belong to this tenant
        $schoolAdmin = User::where('email', 'school@demo.com')->first();
        if ($schoolAdmin) {
            $schoolAdmin->update(['tenant_id' => $tenant->id]);
        }
    }
}
