import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NoticeForm, { type NoticeFormData } from './notice-form';

interface NoticeData {
    id: number;
    title: string;
    content: string;
    type: string;
    audience: string;
    class_id: number | null;
    publish_date: string | null;
    expiry_date: string | null;
    is_published: boolean;
    send_notification: boolean;
}

interface Props {
    notice: NoticeData;
    classes: { id: number; name: string }[];
}

export default function NoticeEdit({ notice, classes }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Notices', href: '/notices' },
        { title: 'Edit', href: `/notices/${notice.id}/edit` },
    ];

    const form = useForm<NoticeFormData>({
        title: notice.title,
        content: notice.content,
        type: notice.type,
        audience: notice.audience,
        class_id: notice.class_id ? String(notice.class_id) : '',
        publish_date: notice.publish_date ?? '',
        expiry_date: notice.expiry_date ?? '',
        is_published: notice.is_published,
        send_notification: notice.send_notification,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/notices/${notice.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit notice" />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit notice</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Notice details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NoticeForm form={form} classes={classes} onSubmit={submit} submitLabel="Save changes" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
