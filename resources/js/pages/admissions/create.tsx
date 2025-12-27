import { Head, useForm, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    GraduationCap,
    School,
    User,
    Users,
    ArrowLeft,
    Send,
    FileText,
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface SchoolClass {
    id: number;
    name: string;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface Props {
    classes: SchoolClass[];
    academicYears: AcademicYear[];
}

export default function AdmissionCreate({ classes, academicYears }: Props) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        class_id: '',
        academic_year_id: '',
        guardian_name: '',
        guardian_relation: '',
        guardian_phone: '',
        guardian_email: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admissions/apply');
    };

    if (wasSuccessful) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 dark:bg-slate-950">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Application Submitted!</CardTitle>
                    <CardDescription className="text-base mb-6">
                        Thank you for applying to our school. Your application is being processed, and our admissions team will contact you soon.
                    </CardDescription>
                    <Button asChild className="w-full">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 dark:bg-slate-950">
            <Head title="Online Admission Application" />

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Branding & Back */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to School Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight dark:text-white">SchoolSync</span>
                    </div>
                </div>

                {/* Form Progress */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
                    <div className={`flex items-center gap-2 ${step === 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 1 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>
                            1
                        </div>
                        <span className="text-sm font-semibold hidden sm:inline">Student Info</span>
                    </div>
                    <div className="w-12 h-px bg-slate-200" />
                    <div className={`flex items-center gap-2 ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 2 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>
                            2
                        </div>
                        <span className="text-sm font-semibold hidden sm:inline">Academic Choice</span>
                    </div>
                    <div className="w-12 h-px bg-slate-200" />
                    <div className={`flex items-center gap-2 ${step === 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 3 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>
                            3
                        </div>
                        <span className="text-sm font-semibold hidden sm:inline">Guardian & Contact</span>
                    </div>
                </div>

                <Card className="shadow-xl border-none">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">Admission Form</CardTitle>
                        <CardDescription>
                            Please fill in the details below to start your child's journey with us.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Step 1: Student Info */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-600">
                                        <User className="w-5 h-5" />
                                        Student Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={e => setData('first_name', e.target.value)}
                                                placeholder="Enter first name"
                                            />
                                            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={e => setData('last_name', e.target.value)}
                                                placeholder="Enter last name"
                                            />
                                            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth</Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={e => setData('date_of_birth', e.target.value)}
                                            />
                                            {errors.date_of_birth && <p className="text-xs text-red-500">{errors.date_of_birth}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select value={data.gender} onValueChange={v => setData('gender', v)}>
                                                <SelectTrigger id="gender">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button type="button" onClick={() => setStep(2)}>
                                            Next Step
                                            <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Academic Choice */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-600">
                                        <School className="w-5 h-5" />
                                        Academic Year & Class
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="class">Applying for Class</Label>
                                            <Select value={data.class_id} onValueChange={v => setData('class_id', v)}>
                                                <SelectTrigger id="class">
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(c => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.class_id && <p className="text-xs text-red-500">{errors.class_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="year">Academic Session</Label>
                                            <Select value={data.academic_year_id} onValueChange={v => setData('academic_year_id', v)}>
                                                <SelectTrigger id="year">
                                                    <SelectValue placeholder="Select session" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYears.map(y => (
                                                        <SelectItem key={y.id} value={y.id.toString()}>{y.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.academic_year_id && <p className="text-xs text-red-500">{errors.academic_year_id}</p>}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-between">
                                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                            Previous
                                        </Button>
                                        <Button type="button" onClick={() => setStep(3)}>
                                            Next Step
                                            <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Guardian Info */}
                            {step === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-600">
                                        <Users className="w-5 h-5" />
                                        Guardian Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="guardian_name">Guardian's Full Name</Label>
                                            <Input
                                                id="guardian_name"
                                                value={data.guardian_name}
                                                onChange={e => setData('guardian_name', e.target.value)}
                                                placeholder="Enter full name"
                                            />
                                            {errors.guardian_name && <p className="text-xs text-red-500">{errors.guardian_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="relation">Relationship</Label>
                                            <Select value={data.guardian_relation} onValueChange={v => setData('guardian_relation', v)}>
                                                <SelectTrigger id="relation">
                                                    <SelectValue placeholder="Select relation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Father">Father</SelectItem>
                                                    <SelectItem value="Mother">Mother</SelectItem>
                                                    <SelectItem value="Guardian">Guardian</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.guardian_relation && <p className="text-xs text-red-500">{errors.guardian_relation}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={data.guardian_phone}
                                                onChange={e => setData('guardian_phone', e.target.value)}
                                                placeholder="Enter mobile number"
                                            />
                                            {errors.guardian_phone && <p className="text-xs text-red-500">{errors.guardian_phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.guardian_email}
                                                onChange={e => setData('guardian_email', e.target.value)}
                                                placeholder="Enter email address"
                                            />
                                            {errors.guardian_email && <p className="text-xs text-red-500">{errors.guardian_email}</p>}
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="address">Present Address</Label>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                placeholder="Enter full address"
                                                rows={3}
                                            />
                                            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-between">
                                        <Button type="button" variant="outline" onClick={() => setStep(2)}>
                                            Previous
                                        </Button>
                                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                            {processing ? 'Submitting...' : 'Submit Application'}
                                            {!processing && <Send className="ml-2 w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Info Boxes */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold text-blue-900 dark:text-blue-400">Required Documents</p>
                            <p className="text-blue-700 dark:text-blue-500 text-xs">Please keep Birth Certificate and Previous School Records ready for the interview.</p>
                        </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                        <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold text-amber-900 dark:text-amber-400">Next Steps</p>
                            <p className="text-amber-700 dark:text-amber-500 text-xs">Once submitted, our team will review and schedule an interaction within 3-5 business days.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
