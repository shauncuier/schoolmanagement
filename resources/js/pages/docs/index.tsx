import { Head, Link } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { BookOpen, ChevronRight, Menu, X, ArrowLeft, Search, Command } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';

interface Props {
    content: string;
    currentSlug: string;
    menu: Array<{ title: string; slug: string }>;
}

export default function DocsIndex({ content, currentSlug, menu }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredMenu = useMemo(() => {
        return menu.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [menu, searchQuery]);

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 border-t-4 border-indigo-600">
            <Head title={`Documentation - ${currentSlug.replace(/_/g, ' ')}`} />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/70">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110">S</div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SchoolSync</span>
                        </Link>
                        <span className="hidden h-6 w-px bg-gray-200 dark:bg-gray-800 sm:block" />
                        <span className="hidden text-[10px] font-black text-indigo-600 dark:text-indigo-400 sm:block uppercase tracking-[0.2em]">Platform Docs</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 lg:px-5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Return to Dashboard
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all border border-gray-100 dark:border-gray-800 active:scale-95"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-10 py-8 lg:py-16">
                    {/* Sidebar Menu */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-[300px] transform bg-white p-6 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static lg:block lg:translate-x-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:bg-gray-950 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                    >
                        <div className="sticky top-32 flex flex-col gap-1">
                            {/* Search Input */}
                            <div className="relative mb-8 group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search guide..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                                />
                                <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800 sm:flex hidden">
                                    <Command className="h-2.5 w-2.5" />
                                    <span>K</span>
                                </div>
                            </div>

                            <div className="mb-4 flex items-center gap-2 px-4 shadow-none">
                                <BookOpen className="h-4 w-4 text-indigo-500" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">Guides Directory</h3>
                            </div>

                            <div className="space-y-1.5">
                                {filteredMenu.length > 0 ? (
                                    filteredMenu.map(item => (
                                        <Link
                                            key={item.slug}
                                            href={`/docs/${item.slug}`}
                                            className={`flex items-center justify-between group rounded-2xl px-5 py-3.5 text-sm font-bold transition-all ${currentSlug.toUpperCase() === item.slug.toUpperCase()
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-2'
                                                : 'text-gray-600 hover:bg-white hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-indigo-400 border border-transparent hover:border-indigo-100 dark:hover:border-gray-800'
                                                }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span>{item.title}</span>
                                            {currentSlug.toUpperCase() === item.slug.toUpperCase() ? (
                                                <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                            )}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-5 py-8 text-center rounded-3xl bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-sm font-medium text-gray-500">No guides match your search</p>
                                    </div>
                                )}
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
                                    prose-pre:bg-gray-950 prose-pre:rounded-2xl prose-pre:shadow-2xl prose-pre:p-0">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            pre: ({ children }) => <pre className="relative group/code">{children}</pre>,
                                            code: ({ node, inline, className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const content = String(children).replace(/\n$/, '');

                                                if (!inline) {
                                                    return (
                                                        <div className="relative group/code">
                                                            <div className="absolute right-4 top-4 z-10 opacity-0 transition-opacity group-hover/code:opacity-100">
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(content);
                                                                        // Optional: Add toast notification here if available
                                                                    }}
                                                                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                                                                >
                                                                    Copy
                                                                </button>
                                                            </div>
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    );
                                                }
                                                return <code className={className} {...props}>{children}</code>;
                                            }
                                        }}
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
