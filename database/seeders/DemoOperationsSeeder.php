<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\ExamType;
use App\Models\FeeCategory;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\NotificationTemplate;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use App\Models\Subject;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Exam\ExamGradingService;
use App\Services\FeeAllocationService;
use App\Services\ResultService;
use App\Services\Sms\SmsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoOperationsSeeder extends Seeder
{
    /**
     * Seed realistic operational data (fees, exams, results, SMS, attendance)
     * on top of the academic structure created by SampleDataSeeder.
     */
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'demo-school')->first();
        if (! $tenant) {
            $this->command->warn('Demo tenant not found. Run DatabaseSeeder first.');

            return;
        }

        $year = AcademicYear::where('tenant_id', $tenant->id)->where('is_current', true)->first()
            ?? AcademicYear::where('tenant_id', $tenant->id)->first();

        $students = Student::where('tenant_id', $tenant->id)->where('status', 'active')->get();
        if ($students->isEmpty() || ! $year) {
            $this->command->warn('No students/academic year found. Run SampleDataSeeder first.');

            return;
        }

        $this->assignPhones($tenant);
        $this->seedFees($tenant, $year);
        $this->seedExamsAndResults($tenant, $year, $students);
        $this->seedSmsTemplates($tenant);
        $this->seedAttendance($tenant, $year, $students);

        $this->command->info('✅ Operational demo data (fees, exams, results, SMS, attendance) created!');
    }

    /**
     * Give every tenant user a valid Bangladeshi mobile number so SMS demos work.
     */
    private function assignPhones(Tenant $tenant): void
    {
        $users = User::where('tenant_id', $tenant->id)->whereNull('phone')->get();
        foreach ($users as $i => $user) {
            $user->update(['phone' => '017'.str_pad((string) ($i + 10000000), 8, '0', STR_PAD_LEFT)]);
        }
        $this->command->info('  ✓ Phone numbers assigned to '.$users->count().' users');
    }

    private function seedFees(Tenant $tenant, AcademicYear $year): void
    {
        $allocator = app(FeeAllocationService::class);

        $categories = [
            ['name' => 'Tuition Fee', 'code' => 'TUITION', 'frequency' => 'monthly', 'amount' => 1500],
            ['name' => 'Examination Fee', 'code' => 'EXAM', 'frequency' => 'yearly', 'amount' => 600],
            ['name' => 'Admission Fee', 'code' => 'ADMISSION', 'frequency' => 'one_time', 'amount' => 5000],
        ];

        foreach ($categories as $data) {
            $category = FeeCategory::firstOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                ['name' => $data['name'], 'frequency' => $data['frequency'], 'is_mandatory' => true, 'is_active' => true]
            );

            $structure = FeeStructure::firstOrCreate(
                ['tenant_id' => $tenant->id, 'fee_category_id' => $category->id, 'academic_year_id' => $year->id, 'class_id' => null],
                ['amount' => $data['amount'], 'due_date' => now()->addDays(15)->format('Y-m-d'), 'is_active' => true]
            );

            $allocator->allocate($structure);
        }

        // Mark a realistic mix of allocations as paid / partial.
        $admin = User::where('tenant_id', $tenant->id)->first();
        $allocations = StudentFeeAllocation::where('tenant_id', $tenant->id)->get();
        $paid = 0;

        foreach ($allocations as $i => $allocation) {
            $roll = $i % 10;
            if ($roll < 5) {
                // fully paid
                FeePayment::create([
                    'tenant_id' => $tenant->id,
                    'student_id' => $allocation->student_id,
                    'student_fee_allocation_id' => $allocation->id,
                    'academic_year_id' => $allocation->academic_year_id,
                    'receipt_number' => 'RCP'.str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                    'amount' => $allocation->net_amount,
                    'total_amount' => $allocation->net_amount,
                    'payment_method' => ['cash', 'bank_transfer', 'mobile_banking'][$roll % 3],
                    'status' => 'completed',
                    'collected_by' => $admin?->id,
                    'paid_at' => now()->subDays(rand(1, 20)),
                ]);
                $allocation->update(['paid_amount' => $allocation->net_amount, 'due_amount' => 0, 'status' => 'paid']);
                $paid++;
            } elseif ($roll < 7) {
                // partial
                $part = round($allocation->net_amount / 2, 2);
                FeePayment::create([
                    'tenant_id' => $tenant->id,
                    'student_id' => $allocation->student_id,
                    'student_fee_allocation_id' => $allocation->id,
                    'academic_year_id' => $allocation->academic_year_id,
                    'receipt_number' => 'RCP'.str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                    'amount' => $part,
                    'total_amount' => $part,
                    'payment_method' => 'cash',
                    'status' => 'completed',
                    'collected_by' => $admin?->id,
                    'paid_at' => now()->subDays(rand(1, 20)),
                ]);
                $allocation->update(['paid_amount' => $part, 'due_amount' => $allocation->net_amount - $part, 'status' => 'partial']);
            }
        }

        $this->command->info('  ✓ Fees: '.$allocations->count().' allocations, '.$paid.' fully paid');
    }

    private function seedExamsAndResults(Tenant $tenant, AcademicYear $year, $students): void
    {
        $grading = app(ExamGradingService::class);
        $results = app(ResultService::class);

        $examType = ExamType::firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Final Term'],
            ['weightage' => 100, 'is_active' => true]
        );

        $exam = Exam::firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Final Examination '.$year->name],
            [
                'exam_type_id' => $examType->id,
                'academic_year_id' => $year->id,
                'start_date' => now()->subDays(20)->format('Y-m-d'),
                'end_date' => now()->subDays(10)->format('Y-m-d'),
                'status' => 'completed',
            ]
        );

        $coreSubjects = Subject::where('tenant_id', $tenant->id)->whereIn('code', ['ENG', 'MATH', 'SCI'])->get();
        $byClass = $students->groupBy('class_id');

        foreach ($byClass as $classId => $classStudents) {
            foreach ($coreSubjects as $subject) {
                $schedule = ExamSchedule::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'exam_id' => $exam->id, 'class_id' => $classId, 'subject_id' => $subject->id, 'section_id' => null],
                    [
                        'date' => now()->subDays(15)->format('Y-m-d'),
                        'start_time' => '10:00', 'end_time' => '12:00',
                        'full_marks' => 100, 'pass_marks' => 33,
                    ]
                );

                $rows = $classStudents->map(function (Student $student) {
                    $absent = rand(1, 100) <= 2;           // ~2% absent
                    $marks = rand(1, 100) <= 3              // ~3% fail a subject
                        ? rand(18, 32)
                        : rand(45, 95);                    // most pass, bell-ish

                    return ['student_id' => $student->id, 'marks_obtained' => $marks, 'is_absent' => $absent];
                })->all();

                $grading->enterMarks($schedule, $rows);
            }
        }

        $grading->generateReportCards($exam);
        $results->publish($exam);

        $this->command->info('  ✓ Exams: "'.$exam->name.'" with marks + published report cards');
    }

    private function seedSmsTemplates(Tenant $tenant): void
    {
        $templates = [
            ['name' => 'Absence Alert', 'body' => 'Dear Guardian, your child {{student}} was absent on {{date}}. - {{school}}'],
            ['name' => 'Result Published', 'body' => 'Result for {{exam}} published. {{student}}: GPA {{gpa}}. - {{school}}'],
            ['name' => 'Fee Reminder', 'body' => 'Dear Guardian, BDT {{amount}} fee for {{student}} is due on {{date}}. - {{school}}'],
        ];

        foreach ($templates as $data) {
            NotificationTemplate::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $data['name']],
                [
                    'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
                    'type' => 'sms',
                    'body' => $data['body'],
                    'variables' => $this->extractVariables($data['body']),
                    'is_active' => true,
                ]
            );
        }

        // A few sample sends so the SMS console has history (uses the log driver).
        $sms = app(SmsService::class);
        $recipients = User::where('tenant_id', $tenant->id)->whereNotNull('phone')->take(5)->get();
        foreach ($recipients as $user) {
            $sms->send($tenant, $user->phone, 'Welcome to '.$tenant->name.'. This is a sample notification.', $user);
        }

        $this->command->info('  ✓ SMS: 3 templates + sample message log');
    }

    private function seedAttendance(Tenant $tenant, AcademicYear $year, $students): void
    {
        $teacher = User::where('tenant_id', $tenant->id)
            ->whereHas('roles', fn ($q) => $q->where('name', 'teacher'))->first();

        $count = 0;
        // Last 5 weekdays for the first 10 students.
        foreach ($students->take(10) as $student) {
            for ($d = 1; $d <= 5; $d++) {
                $date = now()->subDays($d);
                if ($date->isWeekend()) {
                    continue;
                }

                $status = match (rand(1, 10)) {
                    1 => 'absent',
                    2 => 'late',
                    default => 'present',
                };

                Attendance::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'student_id' => $student->id, 'date' => $date->format('Y-m-d')],
                    [
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'academic_year_id' => $year->id,
                        'status' => $status,
                        'marked_by_user_id' => $teacher?->id,
                    ]
                );
                $count++;
            }
        }

        $this->command->info('  ✓ Attendance: '.$count.' records');
    }

    private function extractVariables(string $body): array
    {
        preg_match_all('/\{\{\s*(\w+)\s*\}\}/', $body, $matches);

        return array_values(array_unique($matches[1]));
    }
}
