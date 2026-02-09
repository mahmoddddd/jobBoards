import Skeleton from '../ui/Skeleton';

export function JobCardSkeleton() {
    return (
        <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Logo Skeleton */}
                <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />

                {/* Info Skeleton */}
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="md:text-left space-y-2">
                    <Skeleton className="h-4 w-24 md:mr-auto" />
                    <Skeleton className="h-5 w-32 md:mr-auto" />
                </div>
            </div>
        </div>
    );
}

export function CompanyCardSkeleton() {
    return (
        <div className="card h-full flex flex-col">
            <div className="p-6 space-y-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="mt-auto border-t p-4 flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
}
