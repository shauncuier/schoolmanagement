<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Timetable;
use App\Models\TimetableSlot;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    /**
     * Display timetable view with section selection.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $classQuery = SchoolClass::query();
        $sectionQuery = Section::query();

        if ($tenantId) {
            $classQuery->forTenant($tenantId);
            $sectionQuery->forTenant($tenantId);
        }

        $classes = $classQuery
            ->active()
            ->ordered()
            ->with(['sections' => fn($q) => $q->where('is_active', true)])
            ->get();

        $selectedSectionId = $request->input('section_id');
        $timetableData = [];
        $selectedSection = null;

        if ($selectedSectionId) {
            $selectedSection = Section::with(['schoolClass'])->find($selectedSectionId);
            
            // Get timetable for the section
            $slotQuery = TimetableSlot::query()->active()->ordered();
            if ($tenantId) {
                $slotQuery->forTenant($tenantId);
            }
            $slots = $slotQuery->get();

            $timetableQuery = Timetable::query()
                ->where('section_id', $selectedSectionId)
                ->with(['slot', 'subject', 'teacher']);
            
            if ($tenantId) {
                $timetableQuery->forTenant($tenantId);
            }
            
            $entries = $timetableQuery->get();

            // Organize by day and slot
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            foreach ($days as $day) {
                $timetableData[$day] = [];
                foreach ($slots as $slot) {
                    $entry = $entries->first(fn($e) => $e->day === $day && $e->timetable_slot_id === $slot->id);
                    $timetableData[$day][$slot->id] = $entry;
                }
            }
        }

        return Inertia::render('timetable/index', [
            'classes' => $classes,
            'selectedSection' => $selectedSection,
            'timetableData' => $timetableData,
            'slots' => TimetableSlot::query()
                ->when($tenantId, fn($q) => $q->forTenant($tenantId))
                ->active()
                ->ordered()
                ->get(),
        ]);
    }

    /**
     * Show the form for editing timetable.
     */
    public function edit(Request $request): Response
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;
        $sectionId = $request->input('section_id');

        $section = Section::with(['schoolClass'])->findOrFail($sectionId);

        // Get slots
        $slotQuery = TimetableSlot::query()->active()->ordered();
        if ($tenantId) {
            $slotQuery->forTenant($tenantId);
        }
        $slots = $slotQuery->get();

        // Get subjects
        $subjectQuery = Subject::query()->where('is_active', true);
        if ($tenantId) {
            $subjectQuery->forTenant($tenantId);
        }
        $subjects = $subjectQuery->get();

        // Get teachers
        $teacherQuery = User::query()
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['teacher', 'class-teacher']));
        if ($tenantId) {
            $teacherQuery->where('tenant_id', $tenantId);
        }
        $teachers = $teacherQuery->get(['id', 'name']);

        // Get existing timetable
        $timetableQuery = Timetable::query()
            ->where('section_id', $sectionId)
            ->with(['slot', 'subject', 'teacher']);
        if ($tenantId) {
            $timetableQuery->forTenant($tenantId);
        }
        $entries = $timetableQuery->get();

        // Organize by day and slot
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $timetableData = [];
        foreach ($days as $day) {
            $timetableData[$day] = [];
            foreach ($slots as $slot) {
                $entry = $entries->first(fn($e) => $e->day === $day && $e->timetable_slot_id === $slot->id);
                $timetableData[$day][$slot->id] = [
                    'id' => $entry?->id,
                    'subject_id' => $entry?->subject_id ?? '',
                    'teacher_id' => $entry?->teacher_id ?? '',
                    'room' => $entry?->room ?? '',
                ];
            }
        }

        return Inertia::render('timetable/edit', [
            'section' => $section,
            'slots' => $slots,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'timetableData' => $timetableData,
            'days' => $days,
        ]);
    }

    /**
     * Store/update timetable entries.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'entries' => 'required|array',
            'entries.*.day' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'entries.*.slot_id' => 'required|exists:timetable_slots,id',
            'entries.*.subject_id' => 'nullable|exists:subjects,id',
            'entries.*.teacher_id' => 'nullable|exists:users,id',
            'entries.*.room' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $section = Section::findOrFail($validated['section_id']);

        // Get current academic year
        $academicYearQuery = AcademicYear::query()->current();
        if ($user->tenant_id) {
            $academicYearQuery->forTenant($user->tenant_id);
        }
        $academicYear = $academicYearQuery->first();

        foreach ($validated['entries'] as $entry) {
            // Skip if no subject assigned
            if (empty($entry['subject_id'])) {
                // Delete existing entry if any
                Timetable::where([
                    'section_id' => $validated['section_id'],
                    'timetable_slot_id' => $entry['slot_id'],
                    'day' => $entry['day'],
                ])->delete();
                continue;
            }

            Timetable::updateOrCreate(
                [
                    'section_id' => $validated['section_id'],
                    'timetable_slot_id' => $entry['slot_id'],
                    'day' => $entry['day'],
                ],
                [
                    'tenant_id' => $section->tenant_id,
                    'class_id' => $section->class_id,
                    'academic_year_id' => $academicYear?->id,
                    'subject_id' => $entry['subject_id'],
                    'teacher_id' => $entry['teacher_id'] ?: null,
                    'room' => $entry['room'] ?: null,
                    'is_active' => true,
                ]
            );
        }

        return redirect()->route('timetable.index', ['section_id' => $validated['section_id']])
            ->with('success', 'Timetable saved successfully.');
    }

    /**
     * Manage timetable slots.
     */
    public function slots(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $slotQuery = TimetableSlot::query()->ordered();
        if ($tenantId) {
            $slotQuery->forTenant($tenantId);
        }
        $slots = $slotQuery->get();

        return Inertia::render('timetable/slots', [
            'slots' => $slots,
        ]);
    }

    /**
     * Store a new slot.
     */
    public function storeSlot(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'type' => 'required|in:class,break,lunch,assembly,other',
            'order' => 'nullable|integer|min:0',
        ]);

        $user = $request->user();

        TimetableSlot::create([
            'tenant_id' => $user->tenant_id,
            'name' => $validated['name'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'type' => $validated['type'],
            'order' => $validated['order'] ?? 0,
            'is_active' => true,
        ]);

        return redirect()->route('timetable.slots')
            ->with('success', 'Slot created successfully.');
    }

    /**
     * Delete a slot.
     */
    public function destroySlot(TimetableSlot $slot): RedirectResponse
    {
        $user = request()->user();
        
        if ($user->tenant_id && $slot->tenant_id !== $user->tenant_id) {
            abort(403);
        }

        $slot->delete();

        return redirect()->route('timetable.slots')
            ->with('success', 'Slot deleted successfully.');
    }
}
