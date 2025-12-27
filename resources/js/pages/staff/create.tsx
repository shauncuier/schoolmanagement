import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Key, Save, Shield } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Staff', href: '/staff' },
    { title: 'Create', href: '/staff/create' },
];

interface Props {
    roles?: string[];
}

const roleLabels: Record<string, string> = {
    'admin': 'Admin',
    'school-owner': 'School Owner',
    'principal': 'Principal',
    'vice-principal': 'Vice Principal',
    'academic-coordinator': 'Academic Coordinator',
    'admin-officer': 'Admin Officer',
    'accountant': 'Accountant',
    'librarian': 'Librarian',
    'transport-manager': 'Transport Manager',
    'hostel-manager': 'Hostel Manager',
    'inventory-manager': 'Inventory Manager',
    'it-support': 'IT Support',
    'hr-manager': 'HR Manager',
};

export default function CreateStaff({ roles = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin-officer',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/staff');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Staff Member" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/staff">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Add Staff Member
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add a new administrative staff member
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Login Credentials */}
                    <Card className="border-amber-200 dark:border-amber-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                <Key className="h-5 w-5" />
                                Login Credentials
                            </CardTitle>
                            <CardDescription>
                                Staff login details for system access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Default: password123"
                                />
                                <p className="text-xs text-gray-500">Min 8 characters</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Role Assignment
                            </CardTitle>
                            <CardDescription>
                                Assign a role to define permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-w-md">
                                <Label>Role <span className="text-destructive">*</span></Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {roleLabels[role] ?? role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/staff">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Staff'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
