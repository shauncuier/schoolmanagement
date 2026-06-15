import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, Check, X, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    users_count: number;
    created_at: string;
}

interface Props {
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function RolesShow({ role, permissions }: Props) {
    const formatRoleName = (name: string) => {
        return name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/roles' },
        { title: formatRoleName(role.name), href: `/roles/${role.id}` },
    ];

    const totalPermissions = Object.values(permissions).flat().length;
    const assignedPermissions = Object.values(permissions)
        .flat()
        .filter((p) => p.assigned).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={formatRoleName(role.name)} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/roles">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {formatRoleName(role.name)}
                                </h1>
                                {role.is_system ? (
                                    <Badge variant="secondary">System</Badge>
                                ) : (
                                    <Badge variant="outline">Custom</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                {role.users_count} user{role.users_count !== 1 ? 's' : ''} with this role
                            </p>
                        </div>
                    </div>
                    {role.name !== 'super-admin' && (
                        <Button asChild>
                            <Link href={`/roles/${role.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Permissions
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPermissions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                            <Check className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{assignedPermissions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Not Assigned</CardTitle>
                            <X className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-muted-foreground">
                                {totalPermissions - assignedPermissions}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Permissions by Module */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                            All permissions assigned to this role, grouped by module.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-6">
                                {Object.entries(permissions).map(([module, perms]) => {
                                    const assignedCount = perms.filter((p) => p.assigned).length;
                                    return (
                                        <div key={module} className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold">{module}</h3>
                                                <Badge variant={assignedCount === perms.length ? 'default' : 'outline'}>
                                                    {assignedCount}/{perms.length}
                                                </Badge>
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                {perms.map((perm) => (
                                                    <div
                                                        key={perm.name}
                                                        className={`flex items-center gap-2 rounded-md px-2 py-1 ${perm.assigned
                                                                ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                                : 'bg-muted text-muted-foreground'
                                                            }`}
                                                    >
                                                        {perm.assigned ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        <span className="text-sm">{perm.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
