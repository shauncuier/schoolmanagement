import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NoticeForm, { type NoticeFormData } from './notice-form';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notices', href: '/notices' },
    { title: 'New', href: '/notices/create' },
];

export default function NoticeCreate({ classes }: { classes: { id: number; name: string }[] }) {
    const form = useForm<NoticeFormData>({
        title: '',
        content: '',
        type: 'notice',
        audience: 'all',
        class_id: '',
        publish_date: new Date().toISOString().slice(0, 10),
        expiry_date: '',
        is_published: false,
        send_notification: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/notices');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New notice" />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">New notice</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Notice details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NoticeForm form={form} classes={classes} onSubmit={submit} submitLabel="Create notice" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
