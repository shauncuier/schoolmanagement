<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    /**
     * Seed sample data for testing the application.
     */
    public function run(): void
    {
        // Get the demo tenant
        $tenant = Tenant::where('slug', 'demo-school')->first();
        
        if (!$tenant) {
            $this->command->warn('Demo tenant not found. Run DatabaseSeeder first.');
            return;
        }

        $this->command->info('Creating sample data for: ' . $tenant->name);

        // Create Academic Year
        $academicYear = $this->createAcademicYear($tenant);

        // Create Subjects
        $subjects = $this->createSubjects($tenant);

        // Create Classes and Sections
        $classesWithSections = $this->createClassesAndSections($tenant, $academicYear);

        // Create Teachers
        $teachers = $this->createTeachers($tenant, $classesWithSections);

        // Create Students and Guardians
        $this->createStudentsAndGuardians($tenant, $academicYear, $classesWithSections);

        $this->command->info('✅ Sample data created successfully!');
    }

    /**
     * Create academic year
     */
    private function createAcademicYear(Tenant $tenant): AcademicYear
    {
        $academicYear = AcademicYear::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'name' => '2024-2025',
            ],
            [
                'start_date' => '2024-04-01',
                'end_date' => '2025-03-31',
                'is_current' => true,
                'status' => 'active',
            ]
        );

        $this->command->info('  ✓ Academic Year: ' . $academicYear->name);
        return $academicYear;
    }

    /**
     * Create subjects
     */
    private function createSubjects(Tenant $tenant): array
    {
        $subjectData = [
            ['name' => 'English', 'code' => 'ENG', 'type' => 'theory', 'is_optional' => false],
            ['name' => 'Mathematics', 'code' => 'MATH', 'type' => 'theory', 'is_optional' => false],
            ['name' => 'Science', 'code' => 'SCI', 'type' => 'both', 'is_optional' => false],
            ['name' => 'Social Studies', 'code' => 'SS', 'type' => 'theory', 'is_optional' => false],
            ['name' => 'Computer Science', 'code' => 'CS', 'type' => 'both', 'is_optional' => true],
            ['name' => 'Physical Education', 'code' => 'PE', 'type' => 'practical', 'is_optional' => true],
            ['name' => 'Art', 'code' => 'ART', 'type' => 'practical', 'is_optional' => true],
            ['name' => 'Music', 'code' => 'MUS', 'type' => 'practical', 'is_optional' => true],
        ];

        $subjects = [];
        foreach ($subjectData as $data) {
            $subject = Subject::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                [
                    'name' => $data['name'],
                    'type' => $data['type'],
                    'is_optional' => $data['is_optional'],
                    'is_active' => true,
                ]
            );
            $subjects[] = $subject;
        }

        $this->command->info('  ✓ Subjects: ' . count($subjects) . ' created');
        return $subjects;
    }

    /**
     * Create classes and sections
     */
    private function createClassesAndSections(Tenant $tenant, AcademicYear $academicYear): array
    {
        $classData = [
            ['name' => 'Class 1', 'level' => 1],
            ['name' => 'Class 2', 'level' => 2],
            ['name' => 'Class 3', 'level' => 3],
            ['name' => 'Class 4', 'level' => 4],
            ['name' => 'Class 5', 'level' => 5],
            ['name' => 'Class 6', 'level' => 6],
            ['name' => 'Class 7', 'level' => 7],
            ['name' => 'Class 8', 'level' => 8],
            ['name' => 'Class 9', 'level' => 9],
            ['name' => 'Class 10', 'level' => 10],
        ];

        $sectionNames = ['A', 'B'];
        $result = [];

        foreach ($classData as $index => $data) {
            $class = SchoolClass::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'name' => $data['name'],
                ],
                [
                    'numeric_name' => $data['level'],
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );

            $classSections = [];
            foreach ($sectionNames as $sectionName) {
                $section = Section::firstOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'class_id' => $class->id,
                        'name' => $sectionName,
                    ],
                    [
                        'academic_year_id' => $academicYear->id,
                        'capacity' => 30,
                        'is_active' => true,
                    ]
                );
                $classSections[] = $section;
            }

            $result[] = [
                'class' => $class,
                'sections' => $classSections,
            ];
        }

        $this->command->info('  ✓ Classes: ' . count($classData) . ' with ' . count($sectionNames) . ' sections each');
        return $result;
    }

    /**
     * Create teachers
     */
    private function createTeachers(Tenant $tenant, array $classesWithSections): array
    {
        $teacherData = [
            ['name' => 'Sarah Thompson', 'email' => 'sarah.thompson@demo.com', 'subject' => 'English'],
            ['name' => 'Michael Chen', 'email' => 'michael.chen@demo.com', 'subject' => 'Mathematics'],
            ['name' => 'Emily Rodriguez', 'email' => 'emily.rodriguez@demo.com', 'subject' => 'Science'],
            ['name' => 'David Williams', 'email' => 'david.williams@demo.com', 'subject' => 'Social Studies'],
            ['name' => 'Jessica Brown', 'email' => 'jessica.brown@demo.com', 'subject' => 'Computer Science'],
            ['name' => 'James Miller', 'email' => 'james.miller@demo.com', 'subject' => 'Physical Education'],
        ];

        $teachers = [];
        $sectionIndex = 0;
        
        foreach ($teacherData as $data) {
            // Create user account
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            if (!$user->hasRole('teacher')) {
                $user->assignRole('teacher');
            }

            // Create teacher record
            $teacher = Teacher::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                ],
                [
                    'employee_id' => 'TCH' . str_pad(count($teachers) + 1, 3, '0', STR_PAD_LEFT),
                    'qualification' => 'M.Ed',
                    'specialization' => $data['subject'],
                    'employment_type' => 'full-time',
                    'joining_date' => now()->subYears(rand(1, 5))->format('Y-m-d'),
                    'is_active' => true,
                ]
            );

            // Assign as class teacher for a section
            if ($sectionIndex < count($classesWithSections)) {
                $section = $classesWithSections[$sectionIndex]['sections'][0] ?? null;
                if ($section) {
                    $section->update(['class_teacher_id' => $user->id]);
                }
                $sectionIndex++;
            }

            $teachers[] = $teacher;
        }

        $this->command->info('  ✓ Teachers: ' . count($teachers) . ' created');
        return $teachers;
    }

    /**
     * Create students and guardians
     */
    private function createStudentsAndGuardians(Tenant $tenant, AcademicYear $academicYear, array $classesWithSections): void
    {
        $firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas',
                       'Mia', 'Aiden', 'Charlotte', 'James', 'Amelia', 'Oliver', 'Harper', 'Benjamin', 'Evelyn', 'Elijah'];
        
        $lastNames = ['Anderson', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 
                      'Lopez', 'Gonzalez', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 
                      'Martin', 'Thompson', 'Young'];

        $studentCount = 0;
        $guardianCount = 0;

        // Only create students for first 3 classes to keep data manageable
        $limitedClasses = array_slice($classesWithSections, 0, 3);

        foreach ($limitedClasses as $classData) {
            $class = $classData['class'];
            
            foreach ($classData['sections'] as $section) {
                // Create 5 students per section
                $numStudents = 5;
                
                for ($i = 0; $i < $numStudents; $i++) {
                    $firstName = $firstNames[array_rand($firstNames)];
                    $lastName = $lastNames[array_rand($lastNames)];
                    $gender = rand(0, 1) ? 'male' : 'female';
                    $uniqueId = $studentCount + 1;

                    // Check if student with this email already exists
                    $studentEmail = 'student' . $uniqueId . '@demo.com';
                    $parentEmail = 'parent' . $uniqueId . '@demo.com';
                    
                    $existingStudent = User::where('email', $studentEmail)->first();
                    if ($existingStudent) {
                        $studentCount++;
                        continue; // Skip if already exists
                    }

                    // Create guardian user
                    $guardianUser = User::firstOrCreate(
                        ['email' => $parentEmail],
                        [
                            'tenant_id' => $tenant->id,
                            'name' => 'Mr./Mrs. ' . $lastName,
                            'password' => Hash::make('password'),
                            'email_verified_at' => now(),
                            'status' => 'active',
                        ]
                    );
                    if (!$guardianUser->hasRole('parent')) {
                        $guardianUser->assignRole('parent');
                    }

                    // Create guardian record
                    $guardian = Guardian::firstOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'user_id' => $guardianUser->id,
                        ],
                        [
                            'occupation' => 'Professional',
                            'relation_type' => rand(0, 1) ? 'father' : 'mother',
                            'is_primary_contact' => true,
                            'is_active' => true,
                        ]
                    );
                    $guardianCount++;

                    // Create student user
                    $studentUser = User::firstOrCreate(
                        ['email' => $studentEmail],
                        [
                            'tenant_id' => $tenant->id,
                            'name' => $firstName . ' ' . $lastName,
                            'password' => Hash::make('password'),
                            'email_verified_at' => now(),
                            'status' => 'active',
                        ]
                    );
                    if (!$studentUser->hasRole('student')) {
                        $studentUser->assignRole('student');
                    }

                    // Create student record
                    $baseYear = 2024 - $class->numeric_name - 5;
                    $student = Student::firstOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'user_id' => $studentUser->id,
                        ],
                        [
                            'admission_no' => 'STU' . str_pad($uniqueId, 5, '0', STR_PAD_LEFT),
                            'class_id' => $class->id,
                            'section_id' => $section->id,
                            'academic_year_id' => $academicYear->id,
                            'date_of_birth' => now()->setYear($baseYear)->setMonth(rand(1, 12))->setDay(rand(1, 28))->format('Y-m-d'),
                            'gender' => $gender,
                            'blood_group' => ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][rand(0, 7)],
                            'admission_date' => now()->subMonths(rand(1, 36))->format('Y-m-d'),
                            'status' => 'active',
                        ]
                    );

                    // Link student to guardian via pivot table if not already linked
                    if (!$student->guardians()->where('guardian_id', $guardian->id)->exists()) {
                        $student->guardians()->attach($guardian->id, [
                            'relationship' => $guardian->relation_type,
                            'is_emergency_contact' => true,
                            'can_pickup' => true,
                        ]);
                    }

                    $studentCount++;
                }
            }
        }

        $this->command->info('  ✓ Students: ' . $studentCount . ' created');
        $this->command->info('  ✓ Guardians: ' . $guardianCount . ' created');
    }
}
