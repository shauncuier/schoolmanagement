import { type InertiaFormProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface NoticeFormData {
    title: string;
    content: string;
    type: string;
    audience: string;
    class_id: string;
    publish_date: string;
    expiry_date: string;
    is_published: boolean;
    send_notification: boolean;
    [key: string]: string | boolean;
}

interface Props {
    form: InertiaFormProps<NoticeFormData>;
    classes: { id: number; name: string }[];
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
}

const TYPES = ['notice', 'announcement', 'circular', 'event', 'holiday', 'urgent'];
const AUDIENCES = ['all', 'students', 'teachers', 'parents', 'staff', 'specific_class'];

export default function NoticeForm({ form, classes, onSubmit, submitLabel }: Props) {
    const { data, setData, processing, errors } = form;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" rows={5} value={data.content} onChange={(e) => setData('content', e.target.value)} />
                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {TYPES.map((t) => (
                                <SelectItem key={t} value={t} className="capitalize">
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select value={data.audience} onValueChange={(v) => setData('audience', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Audience" />
                        </SelectTrigger>
                        <SelectContent>
                            {AUDIENCES.map((a) => (
                                <SelectItem key={a} value={a} className="capitalize">
                                    {a.replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {data.audience === 'specific_class' && (
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={data.class_id} onValueChange={(v) => setData('class_id', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.class_id && <p className="text-sm text-destructive">{errors.class_id}</p>}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="publish_date">Publish date</Label>
                    <Input id="publish_date" type="date" value={data.publish_date} onChange={(e) => setData('publish_date', e.target.value)} />
                    {errors.publish_date && <p className="text-sm text-destructive">{errors.publish_date}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expiry_date">Expiry date (optional)</Label>
                    <Input id="expiry_date" type="date" value={data.expiry_date} onChange={(e) => setData('expiry_date', e.target.value)} />
                </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="is_published" className="font-normal">Publish now</Label>
                <Switch id="is_published" checked={data.is_published} onCheckedChange={(v) => setData('is_published', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="send_notification" className="font-normal">Send SMS to audience</Label>
                    <p className="text-sm text-muted-foreground">Only sends when the notice is published.</p>
                </div>
                <Switch id="send_notification" checked={data.send_notification} onCheckedChange={(v) => setData('send_notification', v)} />
            </div>

            <Button type="submit" disabled={processing}>{submitLabel}</Button>
        </form>
    );
}
