import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { MessageSquare, Send, AlertTriangle, Coins, Settings2, FlaskConical } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SMS', href: '/communication/sms' },
];

interface SmsLog {
    id: number;
    recipient: string;
    body: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    segments: number | null;
    cost: string | null;
    provider: string | null;
    error_message: string | null;
    sent_at: string | null;
    created_at: string;
}

interface Template {
    id: number;
    name: string;
    body: string;
    variables: string[] | null;
}

interface Props {
    logs: SmsLog[];
    templates: Template[];
    stats: { sent_this_month: number; cost_this_month: number; failed_this_month: number };
    settings: {
        provider: string;
        sender_id: string | null;
        has_credentials: boolean;
        available_providers: string[];
    };
}

function countSegments(body: string): { encoding: 'gsm' | 'unicode'; segments: number; length: number } {
    const length = [...body].length;
    const unicode = [...body].some((ch) => ch.charCodeAt(0) > 127);
    const sizes = unicode ? { single: 70, multi: 67 } : { single: 160, multi: 153 };
    const segments = length === 0 ? 0 : length <= sizes.single ? 1 : Math.ceil(length / sizes.multi);
    return { encoding: unicode ? 'unicode' : 'gsm', segments, length };
}

function statusBadge(status: SmsLog['status']) {
    const map: Record<SmsLog['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
        sent: 'default',
        delivered: 'default',
        pending: 'secondary',
        failed: 'destructive',
    };
    return <Badge variant={map[status]}>{status}</Badge>;
}

export default function SmsConsole({ logs, templates, stats, settings }: Props) {
    const sendForm = useForm({ recipients: '', body: '' });
    const settingsForm = useForm({
        provider: settings.provider,
        sender_id: settings.sender_id ?? '',
        api_key: '',
    });
    const testForm = useForm({ phone: '' });

    const recipientCount = useMemo(
        () => sendForm.data.recipients.split(/[\s,;]+/).map((n) => n.trim()).filter(Boolean).length,
        [sendForm.data.recipients],
    );
    const seg = useMemo(() => countSegments(sendForm.data.body), [sendForm.data.body]);

    const submitSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendForm.post('/communication/sms/send', {
            preserveScroll: true,
            onSuccess: () => sendForm.reset('recipients', 'body'),
        });
    };

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.put('/communication/sms/settings', {
            preserveScroll: true,
            onSuccess: () => settingsForm.reset('api_key'),
        });
    };

    const submitTest = (e: React.FormEvent) => {
        e.preventDefault();
        testForm.post('/communication/sms/test', { preserveScroll: true });
    };

    const applyTemplate = (id: string) => {
        const t = templates.find((tpl) => String(tpl.id) === id);
        if (t) sendForm.setData('body', t.body);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SMS" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SMS</h1>
                    <p className="text-muted-foreground">
                        Send masking SMS to parents and staff, and review delivery history.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Sent this month</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sent_this_month}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Failed this month</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.failed_this_month}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Est. cost this month</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{stats.cost_this_month.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="compose">
                    <TabsList>
                        <TabsTrigger value="compose">Compose</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="compose">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compose message</CardTitle>
                                <CardDescription>
                                    Provider: <span className="font-medium">{settings.provider}</span>
                                    {settings.sender_id ? ` · Sender: ${settings.sender_id}` : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitSend} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="recipients">Recipients</Label>
                                        <Textarea
                                            id="recipients"
                                            placeholder="01712345678, 01812345678"
                                            value={sendForm.data.recipients}
                                            onChange={(e) => sendForm.setData('recipients', e.target.value)}
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {recipientCount} recipient(s). Separate numbers with commas, spaces, or new lines.
                                        </p>
                                        {sendForm.errors.recipients && (
                                            <p className="text-sm text-destructive">{sendForm.errors.recipients}</p>
                                        )}
                                    </div>

                                    {templates.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Use a template (optional)</Label>
                                            <Select onValueChange={applyTemplate}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a template" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates.map((t) => (
                                                        <SelectItem key={t.id} value={String(t.id)}>
                                                            {t.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="body">Message</Label>
                                        <Textarea
                                            id="body"
                                            value={sendForm.data.body}
                                            onChange={(e) => sendForm.setData('body', e.target.value)}
                                            rows={5}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {seg.length} chars · {seg.encoding === 'unicode' ? 'Unicode (Bangla)' : 'GSM'} ·{' '}
                                            {seg.segments} segment(s)
                                            {recipientCount > 0 && ` · ${seg.segments * recipientCount} total`}
                                        </p>
                                        {sendForm.errors.body && (
                                            <p className="text-sm text-destructive">{sendForm.errors.body}</p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={sendForm.processing}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery history</CardTitle>
                                <CardDescription>Last 50 messages.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Recipient</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead className="text-center">Seg.</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>When</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    No messages yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.recipient}</TableCell>
                                                    <TableCell className="max-w-[240px] truncate" title={log.body}>
                                                        {log.body}
                                                    </TableCell>
                                                    <TableCell className="text-center">{log.segments ?? '—'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {log.cost ? `৳${Number(log.cost).toFixed(2)}` : '—'}
                                                    </TableCell>
                                                    <TableCell>{statusBadge(log.status)}</TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings2 className="h-4 w-4" /> Provider
                                    </CardTitle>
                                    <CardDescription>
                                        Configure your masking SMS provider. Secrets are stored encrypted.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submitSettings} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Provider</Label>
                                            <Select
                                                value={settingsForm.data.provider}
                                                onValueChange={(v) => settingsForm.setData('provider', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {settings.available_providers.map((p) => (
                                                        <SelectItem key={p} value={p}>
                                                            {p}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sender_id">Sender ID</Label>
                                            <Input
                                                id="sender_id"
                                                value={settingsForm.data.sender_id}
                                                onChange={(e) => settingsForm.setData('sender_id', e.target.value)}
                                                placeholder="SCHOOL"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="api_key">API key</Label>
                                            <Input
                                                id="api_key"
                                                type="password"
                                                value={settingsForm.data.api_key}
                                                onChange={(e) => settingsForm.setData('api_key', e.target.value)}
                                                placeholder={settings.has_credentials ? 'configured' : 'Enter API key'}
                                            />
                                        </div>
                                        <Button type="submit" disabled={settingsForm.processing}>
                                            Save settings
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FlaskConical className="h-4 w-4" /> Test send
                                    </CardTitle>
                                    <CardDescription>Send one message to verify configuration.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submitTest} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone number</Label>
                                            <Input
                                                id="phone"
                                                value={testForm.data.phone}
                                                onChange={(e) => testForm.setData('phone', e.target.value)}
                                                placeholder="01712345678"
                                            />
                                            {testForm.errors.phone && (
                                                <p className="text-sm text-destructive">{testForm.errors.phone}</p>
                                            )}
                                        </div>
                                        <Button type="submit" variant="outline" disabled={testForm.processing}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send test
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
