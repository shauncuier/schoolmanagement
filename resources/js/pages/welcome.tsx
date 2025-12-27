import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Globe,
    GraduationCap,
    Heart,
    Shield,
    Smartphone,
    Sparkles,
    Star,
    Users,
    Zap,
} from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="SchoolSync - Modern School Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <Link href="/" className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-500/10 dark:bg-slate-800">
                                        <img src="/favicon.png" alt="SchoolSync" className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                            SchoolSync
                                        </span>
                                        <span className="ml-2 hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white sm:inline-block">
                                            v0.0.2
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            {/* Nav Links */}
                            <div className="hidden items-center gap-8 md:flex">
                                <a
                                    href="#features"
                                    className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                >
                                    Features
                                </a>
                                <a
                                    href="#modules"
                                    className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                >
                                    Modules
                                </a>
                                <a
                                    href="#pricing"
                                    className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                >
                                    Pricing
                                </a>
                                <a
                                    href="#testimonials"
                                    className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                >
                                    Testimonials
                                </a>
                            </div>

                            {/* Auth Buttons */}
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40"
                                    >
                                        Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Sign In
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40"
                                            >
                                                Get Started
                                                <Sparkles className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32">
                    {/* Background Effects */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                            <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-3xl" />
                        </div>
                        <div className="absolute top-1/3 right-0">
                            <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl" />
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            {/* Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 dark:border-blue-800 dark:bg-blue-900/30">
                                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Trusted by 1,000+ Schools Worldwide
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                                The Complete
                                <span className="relative mx-2">
                                    <span className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        School Management
                                    </span>
                                    <span className="absolute -inset-1 -z-10 block -skew-y-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30" />
                                </span>
                                Platform
                            </h1>

                            {/* Subheadline */}
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                                Streamline your school operations with our
                                all-in-one platform. From admissions to
                                examinations, attendance to fee management –
                                everything you need in one place.
                            </p>

                            {/* CTA Buttons */}
                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/40"
                                >
                                    Start Free Trial
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <a
                                    href="#demo"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                                    </span>
                                    Watch Demo
                                </a>
                            </div>

                            {/* Social Proof */}
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 dark:border-slate-900"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        10,000+ Users
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                                        4.9/5 Rating
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image/Dashboard Preview */}
                        <div className="relative mt-16">
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-2xl" />
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-2xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/80">
                                <div className="flex items-center gap-2 border-b border-slate-200/60 bg-slate-50/50 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-800/50">
                                    <div className="h-3 w-3 rounded-full bg-red-400" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                    <div className="h-3 w-3 rounded-full bg-green-400" />
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            {
                                                icon: GraduationCap,
                                                label: 'Students',
                                                value: '2,546',
                                                color: 'blue',
                                            },
                                            {
                                                icon: Users,
                                                label: 'Teachers',
                                                value: '186',
                                                color: 'green',
                                            },
                                            {
                                                icon: BookOpen,
                                                label: 'Classes',
                                                value: '64',
                                                color: 'purple',
                                            },
                                            {
                                                icon: BarChart3,
                                                label: 'Attendance',
                                                value: '94.5%',
                                                color: 'orange',
                                            },
                                        ].map((stat, i) => (
                                            <div
                                                key={i}
                                                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50"
                                            >
                                                <div
                                                    className={`mb-2 inline-flex rounded-lg bg-${stat.color}-100 p-2 dark:bg-${stat.color}-900/30`}
                                                >
                                                    <stat.icon
                                                        className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`}
                                                    />
                                                </div>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {stat.value}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        <div className="col-span-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
                                            <p className="text-sm opacity-80">
                                                Today's Schedule
                                            </p>
                                            <p className="mt-1 text-lg font-semibold">
                                                12 Classes Ongoing
                                            </p>
                                            <div className="mt-3 flex gap-2">
                                                <div className="h-2 flex-1 rounded-full bg-white/30">
                                                    <div className="h-full w-3/4 rounded-full bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Fee Collection
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                                $45,230
                                            </p>
                                            <p className="text-xs text-green-600">
                                                +12% from last month
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 lg:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                <Sparkles className="h-4 w-4" />
                                Powerful Features
                            </span>
                            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
                                Everything Your School Needs
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                                From day-to-day operations to strategic
                                planning, we've got you covered with
                                comprehensive tools.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: GraduationCap,
                                    title: 'Student Management',
                                    description:
                                        'Complete student lifecycle management from admission to graduation with document handling.',
                                    color: 'blue',
                                },
                                {
                                    icon: Users,
                                    title: 'Staff & HR',
                                    description:
                                        'Manage teachers, staff attendance, payroll, and performance evaluations seamlessly.',
                                    color: 'green',
                                },
                                {
                                    icon: Calendar,
                                    title: 'Smart Attendance',
                                    description:
                                        'Multiple attendance modes including QR code, biometric integration, and manual marking.',
                                    color: 'purple',
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Examinations',
                                    description:
                                        'Create exams, manage question banks, generate report cards with flexible grading systems.',
                                    color: 'orange',
                                },
                                {
                                    icon: CreditCard,
                                    title: 'Fee Management',
                                    description:
                                        'Flexible fee structures, online payments, installments, and automated receipt generation.',
                                    color: 'pink',
                                },
                                {
                                    icon: Bell,
                                    title: 'Communication',
                                    description:
                                        'Send SMS, email, and push notifications. Share notices and manage events effectively.',
                                    color: 'indigo',
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/60 dark:bg-slate-800"
                                >
                                    <div
                                        className={`mb-4 inline-flex rounded-xl bg-${feature.color}-100 p-3 dark:bg-${feature.color}-900/30`}
                                    >
                                        <feature.icon
                                            className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`}
                                        />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                                        {feature.description}
                                    </p>
                                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modules Section */}
                <section
                    id="modules"
                    className="bg-gradient-to-b from-slate-100 to-white py-20 lg:py-28 dark:from-slate-800/50 dark:to-slate-900"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                    <Globe className="h-4 w-4" />
                                    20+ Modules
                                </span>
                                <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
                                    Complete School ERP Solution
                                </h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                    Our platform covers every aspect of school
                                    management with dedicated modules for each
                                    operation.
                                </p>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    {[
                                        'Admission & Enrollment',
                                        'Timetable Generation',
                                        'Library Management',
                                        'Transport Tracking',
                                        'Hostel Management',
                                        'Inventory & Assets',
                                        'Parent Portal',
                                        'Online Classes',
                                    ].map((module, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {module}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/register"
                                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
                                >
                                    Get Started Now
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl" />
                                <div className="relative grid grid-cols-2 gap-4">
                                    {[
                                        {
                                            icon: Smartphone,
                                            label: 'Mobile App',
                                            desc: 'iOS & Android',
                                        },
                                        {
                                            icon: Shield,
                                            label: 'Secure',
                                            desc: 'Bank-level security',
                                        },
                                        {
                                            icon: Globe,
                                            label: 'Multi-tenant',
                                            desc: 'Multiple schools',
                                        },
                                        {
                                            icon: Clock,
                                            label: 'Real-time',
                                            desc: 'Live updates',
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg dark:border-slate-700/60 dark:bg-slate-800"
                                        >
                                            <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2.5 text-white">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                {item.label}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 shadow-2xl">
                            <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { value: '1,000+', label: 'Schools' },
                                    { value: '500K+', label: 'Students' },
                                    { value: '50K+', label: 'Teachers' },
                                    { value: '99.9%', label: 'Uptime' },
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <p className="text-4xl font-bold text-white lg:text-5xl">
                                            {stat.value}
                                        </p>
                                        <p className="mt-2 text-lg text-blue-100">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="py-20 lg:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                <Heart className="h-4 w-4" />
                                Loved by Schools
                            </span>
                            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
                                What Our Customers Say
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    quote: 'SchoolSync has transformed how we manage our school. The automation features save us hours every day.',
                                    author: 'Dr. Sarah Johnson',
                                    role: 'Principal, Lincoln Academy',
                                },
                                {
                                    quote: "The parent portal has improved our communication dramatically. Parents love being able to track their child's progress in real-time.",
                                    author: 'Michael Chen',
                                    role: 'Director, Sunrise International',
                                },
                                {
                                    quote: "From fee collection to exam management, everything is seamless. Best investment we've made for our school.",
                                    author: 'Priya Sharma',
                                    role: 'Administrator, Delhi Public School',
                                },
                            ].map((testimonial, i) => (
                                <div
                                    key={i}
                                    className="relative rounded-2xl border border-slate-200/60 bg-white p-8 dark:border-slate-700/60 dark:bg-slate-800"
                                >
                                    <div className="mb-4 flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {testimonial.author}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-16 text-center sm:px-16 dark:from-slate-800 dark:to-slate-900">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 -z-10 opacity-30">
                                <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
                            </div>

                            <Award className="mx-auto mb-6 h-16 w-16 text-yellow-400" />
                            <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                Ready to Transform Your School?
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                                Join thousands of schools already using
                                SchoolSync to streamline their operations and
                                improve outcomes.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
                                >
                                    Start Your Free Trial
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <a
                                    href="#contact"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
                                >
                                    Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 md:grid-cols-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                        <GraduationCap className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                        SchoolSync
                                    </span>
                                </div>
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                                    The complete school management platform
                                    trusted by institutions worldwide.
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
                                    Product
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Modules
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Integrations
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
                                    Company
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Careers
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Contact
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">
                                    Legal
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Terms of Service
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-blue-600"
                                        >
                                            Cookie Policy
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                            <p>© 2024 SchoolSync. Developed by <a href="https://3s-soft.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">3s-Soft</a>. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
