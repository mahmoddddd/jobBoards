import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                    ? 'bg-primary-600 text-white'
                                    : 'hover:bg-gray-50 border'
                                }`}
                        >
                            {page}
                        </button>
                    );
                } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                ) {
                    return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
            })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
        </div>
    );
}
