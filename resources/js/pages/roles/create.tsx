import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, Shield, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
    { title: 'Create', href: '/roles/create' },
];

interface Permission {
    name: string;
    action: string;
    label: string;
}

interface Props {
    permissions: Record<string, Permission[]>;
}

export default function RolesCreate({ permissions }: Props) {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['view-dashboard']);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: ['view-dashboard'],
    });

    const togglePermission = (permissionName: string) => {
        const updated = selectedPermissions.includes(permissionName)
            ? selectedPermissions.filter((p) => p !== permissionName)
            : [...selectedPermissions, permissionName];

        setSelectedPermissions(updated);
        setData('permissions', updated);
    };

    const toggleModuleAll = (moduleName: string) => {
        const modulePerms = permissions[moduleName].map((p) => p.name);
        const allSelected = modulePerms.every((p) => selectedPermissions.includes(p));

        let updated: string[];
        if (allSelected) {
            updated = selectedPermissions.filter((p) => !modulePerms.includes(p));
        } else {
            updated = [...new Set([...selectedPermissions, ...modulePerms])];
        }

        setSelectedPermissions(updated);
        setData('permissions', updated);
    };

    const isModuleAllSelected = (moduleName: string) => {
        const modulePerms = permissions[moduleName].map((p) => p.name);
        return modulePerms.every((p) => selectedPermissions.includes(p));
    };

    const isModulePartialSelected = (moduleName: string) => {
        const modulePerms = permissions[moduleName].map((p) => p.name);
        const selected = modulePerms.filter((p) => selectedPermissions.includes(p));
        return selected.length > 0 && selected.length < modulePerms.length;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/roles');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/roles">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
                        <p className="text-muted-foreground">
                            Create a new role with specific permissions.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Role Details */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Role Details</CardTitle>
                                <CardDescription>
                                    Enter the basic information for the new role.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Department Head"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Will be converted to lowercase with hyphens.
                                    </p>
                                </div>

                                <div className="rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Shield className="h-4 w-4" />
                                        Selected Permissions
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {selectedPermissions.length}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Role
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Permissions */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Permissions</CardTitle>
                                <CardDescription>
                                    Select the permissions for this role. Permissions are grouped by module.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[600px] pr-4">
                                    <div className="space-y-6">
                                        {Object.entries(permissions).map(([module, perms]) => (
                                            <div key={module} className="rounded-lg border p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`module-${module}`}
                                                            checked={isModuleAllSelected(module)}
                                                            onCheckedChange={() => toggleModuleAll(module)}
                                                            className={isModulePartialSelected(module) ? 'data-[state=checked]:bg-primary/50' : ''}
                                                        />
                                                        <Label htmlFor={`module-${module}`} className="font-semibold">
                                                            {module}
                                                        </Label>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {perms.filter((p) => selectedPermissions.includes(p.name)).length}/{perms.length}
                                                    </Badge>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {perms.map((perm) => (
                                                        <div
                                                            key={perm.name}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Checkbox
                                                                id={perm.name}
                                                                checked={selectedPermissions.includes(perm.name)}
                                                                onCheckedChange={() => togglePermission(perm.name)}
                                                            />
                                                            <Label htmlFor={perm.name} className="text-sm font-normal">
                                                                {perm.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
