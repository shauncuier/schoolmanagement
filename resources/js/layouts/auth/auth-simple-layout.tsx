import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { BookOpen, GraduationCap, Users, Calendar, Award, Shield } from 'lucide-react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

const features = [
    { icon: GraduationCap, text: 'Student Management' },
    { icon: Users, text: 'Staff & Teachers' },
    { icon: BookOpen, text: 'Academic Records' },
    { icon: Calendar, text: 'Attendance Tracking' },
    { icon: Award, text: 'Fee Management' },
    { icon: Shield, text: 'Secure & Reliable' },
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                {/* Animated Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse delay-500" />
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    {/* Logo & App Name */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">SchoolSync</h2>
                            <p className="text-sm text-white/70">School Management System</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                                Manage Your School
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                                    Effortlessly
                                </span>
                            </h1>
                            <p className="text-lg text-white/80 max-w-md">
                                A complete solution for managing students, teachers, attendance, fees, and everything in between.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-white/60">
                        <p>© {new Date().getFullYear()} SchoolSync. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background p-6 md:p-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="flex flex-col items-center gap-4 mb-8 lg:hidden">
                        <Link
                            href={home()}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                                <GraduationCap className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold">SchoolSync</span>
                        </Link>
                    </div>

                    {/* Desktop - Back to home */}
                    <div className="hidden lg:block mb-8">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <AppLogoIcon className="size-6 fill-current" />
                            <span>Back to home</span>
                        </Link>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2 mb-8">
                        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
                        <p className="text-muted-foreground">{description}</p>
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
