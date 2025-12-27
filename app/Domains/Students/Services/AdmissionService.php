<?php

namespace App\Domains\Students\Services;

use App\Models\AdmissionApplication;
use App\Models\Student;
use App\Models\User;
use App\Models\Guardian;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdmissionService
{
    /**
     * Convert an approved application into a Student record.
     */
    public function convertToStudent(AdmissionApplication $application)
    {
        return DB::transaction(function () use ($application) {
            // 1. Create Student User
            $studentUser = User::create([
                'name' => $application->first_name . ' ' . $application->last_name,
                'email' => $application->email ?? (strtolower($application->first_name . '.' . $application->last_name . $application->id) . '@school.com'),
                'password' => Hash::make(Str::random(12)),
                'tenant_id' => $application->tenant_id,
            ]);
            $studentUser->assignRole('student');

            // 2. Create/Find Guardian
            $guardianUser = User::firstOrCreate(
                ['email' => $application->guardian_email],
                [
                    'name' => $application->guardian_name,
                    'password' => Hash::make(Str::random(12)),
                    'tenant_id' => $application->tenant_id,
                ]
            );
            if (!$guardianUser->hasRole('parent')) {
                $guardianUser->assignRole('parent');
            }

            $guardian = Guardian::firstOrCreate(
                ['user_id' => $guardianUser->id, 'tenant_id' => $application->tenant_id],
                [
                    'occupation' => $application->guardian_occupation,
                    'relation_type' => $this->mapRelation($application->guardian_relation),
                ]
            );

            // 3. Create Student
            $student = Student::create([
                'tenant_id' => $application->tenant_id,
                'user_id' => $studentUser->id,
                'admission_no' => $application->application_no, // Or generate new one
                'admission_date' => now(),
                'class_id' => $application->class_id,
                'academic_year_id' => $application->academic_year_id,
                'date_of_birth' => $application->date_of_birth,
                'gender' => $application->gender,
                'blood_group' => $application->blood_group,
                'religion' => $application->religion,
                'nationality' => $application->nationality,
                'present_address' => $application->address,
                'previous_school' => $application->previous_school,
                'previous_class' => $application->previous_class,
                'photo' => $application->photo,
                'status' => 'active',
            ]);

            // Link Student and Guardian
            $student->guardians()->attach($guardian->id, [
                'relationship' => $application->guardian_relation,
                'is_emergency_contact' => true,
            ]);

            // Update Application Status
            $application->update(['status' => 'approved']);

            return $student;
        });
    }

    protected function mapRelation($relation)
    {
        $map = [
            'Father' => 'father',
            'Mother' => 'mother',
            'Guardian' => 'guardian',
        ];
        return $map[$relation] ?? 'other';
    }
}
