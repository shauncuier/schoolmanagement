import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Percent } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    { title: 'Fees', href: '/fees/payments' },
    { title: 'Discounts', href: '/fees/discounts' },
];

interface DiscountRow {
    id: number;
    name: string;
    type: string;
    display_value: string;
    category: string | null;
    is_active: boolean;
}

interface Props {
    discounts: DiscountRow[];
    categories: { id: number; name: string }[];
}

export default function DiscountsIndex({ discounts, categories }: Props) {
    const form = useForm({ name: '', type: 'percentage', value: '', fee_category_id: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/fees/discounts', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    const remove = (id: number) => {
        if (confirm('Delete this discount?')) {
            router.delete(`/fees/discounts/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Discounts" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fee discounts</h1>
                    <p className="text-muted-foreground">Scholarships, sibling and special discounts applied to fee allocations.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add a discount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={form.data.type} onValueChange={(v) => form.setData('type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed">Fixed (BDT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <Input id="value" type="number" step="0.01" value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} />
                                {form.errors.value && <p className="text-sm text-destructive">{form.errors.value}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Category (optional)</Label>
                                <Select value={form.data.fee_category_id} onValueChange={(v) => form.setData('fee_category_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-4">
                                <Button type="submit" disabled={form.processing}>Add discount</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Discounts</CardTitle>
                        <CardDescription>Apply these to a student's fee allocation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No discounts yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    discounts.map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                                    {d.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{d.display_value}</TableCell>
                                            <TableCell>{d.category ?? 'All'}</TableCell>
                                            <TableCell>
                                                {d.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => remove(d.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
