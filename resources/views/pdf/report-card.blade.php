<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @php($accent = $school->primary_color ?? '#1E40AF')
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 12px; margin: 0; }
        .sheet { border: 2px solid {{ $accent }}; padding: 20px; }
        .head { text-align: center; border-bottom: 2px solid {{ $accent }}; padding-bottom: 10px; margin-bottom: 14px; }
        .head h1 { color: {{ $accent }}; margin: 0 0 2px; font-size: 22px; }
        .head .sub { color: #6b7280; font-size: 11px; }
        .head .title { margin-top: 8px; font-size: 14px; font-weight: bold; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; }
        .info td { padding: 3px 6px; font-size: 12px; }
        .info .label { color: #6b7280; width: 90px; }
        .marks { margin-top: 12px; }
        .marks th, .marks td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
        .marks th { background: {{ $accent }}; color: #fff; font-size: 11px; }
        .marks td.c, .marks th.c { text-align: center; }
        .summary { margin-top: 14px; }
        .summary td { border: 1px solid #d1d5db; padding: 8px; text-align: center; }
        .summary .k { color: #6b7280; font-size: 10px; text-transform: uppercase; }
        .summary .v { font-size: 16px; font-weight: bold; }
        .result { margin-top: 14px; text-align: center; font-size: 14px; font-weight: bold; }
        .pass { color: #166534; }
        .fail { color: #991b1b; }
        .sign { margin-top: 40px; }
        .sign td { width: 33%; text-align: center; font-size: 11px; color: #6b7280; padding-top: 24px; border-top: 1px solid #9ca3af; }
        .foot { margin-top: 16px; text-align: center; color: #9ca3af; font-size: 9px; }
    </style>
</head>
<body>
<div class="sheet">
    <div class="head">
        <h1>{{ $school->name ?? 'School' }}</h1>
        <div class="sub">
            {{ $school->address ?? '' }}@if($school->phone) · {{ $school->phone }}@endif
        </div>
        <div class="title">REPORT CARD — {{ $card->exam->name }}</div>
    </div>

    <table class="info">
        <tr>
            <td class="label">Name</td><td><strong>{{ $card->student->user->name ?? '—' }}</strong></td>
            <td class="label">Class</td><td>{{ $card->student->schoolClass->name ?? '—' }}@if($card->student->section) ({{ $card->student->section->name }})@endif</td>
        </tr>
        <tr>
            <td class="label">Roll</td><td>{{ $card->student->roll_number ?? '—' }}</td>
            <td class="label">Admission No</td><td>{{ $card->student->admission_no ?? '—' }}</td>
        </tr>
    </table>

    <table class="marks">
        <thead>
            <tr>
                <th>Subject</th>
                <th class="c">Marks</th>
                <th class="c">Grade</th>
                <th class="c">Grade Point</th>
            </tr>
        </thead>
        <tbody>
            @forelse($subjects as $s)
                <tr>
                    <td>{{ $s->subject->name ?? '—' }}</td>
                    <td class="c">{{ $s->is_absent ? 'Absent' : ($s->marks_obtained ?? '—') }}</td>
                    <td class="c">{{ $s->grade ?? '—' }}</td>
                    <td class="c">{{ $s->grade_point ?? '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="4" class="c">No subject results recorded.</td></tr>
            @endforelse
        </tbody>
    </table>

    <table class="summary">
        <tr>
            <td><div class="k">Total</div><div class="v">{{ $card->obtained_marks ?? 0 }}/{{ $card->total_marks ?? 0 }}</div></td>
            <td><div class="k">Percentage</div><div class="v">{{ $card->percentage ?? 0 }}%</div></td>
            <td><div class="k">GPA</div><div class="v">{{ $card->gpa ?? '—' }}</div></td>
            <td><div class="k">Grade</div><div class="v">{{ $card->grade ?? '—' }}</div></td>
            <td><div class="k">Rank</div><div class="v">{{ $card->rank ?? '—' }}@if($card->total_students)/{{ $card->total_students }}@endif</div></td>
        </tr>
    </table>

    <div class="result {{ $card->result === 'pass' ? 'pass' : 'fail' }}">
        Result: {{ strtoupper($card->result) }}
    </div>

    <table class="sign">
        <tr>
            <td>Class Teacher</td>
            <td>Guardian</td>
            <td>Principal</td>
        </tr>
    </table>

    <div class="foot">Generated on {{ now()->format('d M Y') }} · This is a computer-generated report card.</div>
</div>
</body>
</html>
