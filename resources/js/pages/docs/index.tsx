import { Head, Link } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { BookOpen, ChevronRight, Menu, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Props {
    content: string;
    currentSlug: string;
    menu: Array<{ title: string; slug: string }>;
}

export default function DocsIndex({ content, currentSlug, menu }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 border-t-4 border-indigo-600">
            <Head title={`Documentation - ${currentSlug.replace(/_/g, ' ')}`} />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30">S</div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SchoolSync</span>
                        </Link>
                        <span className="hidden h-6 w-px bg-gray-200 dark:bg-gray-800 sm:block" />
                        <span className="hidden text-sm font-semibold text-indigo-600 dark:text-indigo-400 sm:block uppercase tracking-widest">Docs</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to App
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent active:border-gray-200"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8 py-8 lg:py-12">
                    {/* Sidebar Menu */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out lg:static lg:block lg:translate-x-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:bg-gray-950 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                    >
                        <div className="sticky top-28 flex flex-col gap-1">
                            <div className="mb-6 flex items-center gap-2 px-3">
                                <BookOpen className="h-4 w-4 text-indigo-500" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Documentation</h3>
                            </div>

                            <div className="space-y-1">
                                {menu.map(item => (
                                    <Link
                                        key={item.slug}
                                        href={`/docs/${item.slug}`}
                                        className={`flex items-center justify-between group rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${currentSlug.toUpperCase() === item.slug.toUpperCase()
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                                                : 'text-gray-600 hover:bg-white hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400 shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-gray-700'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>{item.title}</span>
                                        {currentSlug.toUpperCase() !== item.slug.toUpperCase() && (
                                            <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                                        )}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg shadow-indigo-500/20">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Need Help?</p>
                                <p className="mt-2 text-sm">Can't find what you're looking for?</p>
                                <a
                                    href="mailto:support@3s-soft.com"
                                    className="mt-4 inline-block rounded-lg bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-colors hover:bg-white/30"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 dark:bg-gray-950 dark:shadow-none dark:border-gray-800">
                            <div className="p-6 md:p-10 lg:p-16">
                                <article className="prose prose-slate prose-indigo max-w-none dark:prose-invert 
                                    prose-headings:font-bold prose-h1:text-4xl prose-h1:tracking-tight 
                                    prose-a:text-indigo-600 dark:prose-a:text-indigo-400 
                                    prose-pre:bg-gray-900 prose-pre:rounded-2xl prose-pre:shadow-2xl">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center justify-between px-6 text-sm text-gray-500 dark:text-gray-400">
                            <p>© 2025 3s-Soft. All rights reserved.</p>
                            <div className="flex gap-4">
                                <Link href="/" className="hover:text-indigo-600">Home</Link>
                                <Link href="/dashboard" className="hover:text-indigo-600">App</Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-md lg:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}
