import React from 'react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-white">
                <img src="/favicon.png" alt="SchoolSync Logo" className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-blue-600 dark:text-blue-400">
                    SchoolSync
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                    3s-Soft Solution
                </span>
            </div>
        </>
    );
}
