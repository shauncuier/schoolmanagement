import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, Shield, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Permission {
    name: string;
    action: string;
    label: string;
    assigned: boolean;
}

interface Role {
    id: number;
    name: string;
    is_system: boolean;
}

interface Props {
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function RolesEdit({ role, permissions }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/roles' },
        { title: formatRoleName(role.name), href: `/roles/${role.id}` },
        { title: 'Edit', href: `/roles/${role.id}/edit` },
    ];

    // Get initially assigned permissions
    const getInitialPermissions = () => {
        const assigned: string[] = [];
        Object.values(permissions).forEach((perms) => {
            perms.forEach((p) => {
                if (p.assigned) assigned.push(p.name);
            });
        });
        return assigned;
    };

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(getInitialPermissions());

    const { setData, put, processing, errors } = useForm({
        permissions: getInitialPermissions(),
    });

    useEffect(() => {
        setData('permissions', selectedPermissions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPermissions]);

    function formatRoleName(name: string) {
        return name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const togglePermission = (permissionName: string) => {
        const updated = selectedPermissions.includes(permissionName)
            ? selectedPermissions.filter((p) => p !== permissionName)
            : [...selectedPermissions, permissionName];
        setSelectedPermissions(updated);
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
        put(`/roles/${role.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${formatRoleName(role.name)}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/roles">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit {formatRoleName(role.name)}
                        </h1>
                        <p className="text-muted-foreground">
                            Modify the permissions for this role.
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
                                    {role.is_system ? 'This is a system role.' : 'This is a custom role.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{formatRoleName(role.name)}</span>
                                    </div>
                                    <div className="mt-2">
                                        {role.is_system ? (
                                            <Badge variant="secondary">System Role</Badge>
                                        ) : (
                                            <Badge variant="outline">Custom Role</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-muted p-4">
                                    <div className="text-sm font-medium">Selected Permissions</div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {selectedPermissions.length}
                                    </div>
                                </div>

                                {errors.permissions && (
                                    <p className="text-sm text-destructive">{errors.permissions}</p>
                                )}

                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Permissions */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Permissions</CardTitle>
                                <CardDescription>
                                    Toggle permissions on or off for this role.
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
