'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewsAPI } from '@/lib/api';
import { Star, ThumbsUp, ThumbsDown, Loader2, Send, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Review {
    _id: string;
    userId: { _id: string; name: string; avatar?: string };
    rating: number;
    title: string;
    comment: string;
    pros?: string;
    cons?: string;
    isAnonymous: boolean;
    createdAt: string;
}

interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
}

interface Props {
    companyId: string;
}

function StarRating({ rating, onRate, interactive = false, size = 'md' }: {
    rating: number;
    onRate?: (r: number) => void;
    interactive?: boolean;
    size?: 'sm' | 'md' | 'lg';
}) {
    const [hover, setHover] = useState(0);
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

    return (
        <div className="flex gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    className={interactive ? 'cursor-pointer transition-transform hover:scale-125' : ''}
                >
                    <Star
                        className={`${sizeClass} ${(hover || rating) >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function CompanyReviews({ companyId }: Props) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        rating: 0,
        title: '',
        comment: '',
        pros: '',
        cons: '',
        isAnonymous: false,
    });

    useEffect(() => {
        fetchReviews();
    }, [companyId]);

    const fetchReviews = async () => {
        try {
            const { data } = await reviewsAPI.getCompanyReviews(companyId);
            setReviews(data.reviews);
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.rating === 0) {
            toast.error('يرجى اختيار تقييم');
            return;
        }
        setSubmitting(true);
        try {
            await reviewsAPI.createReview({ companyId, ...form });
            toast.success('تم إضافة التقييم بنجاح!');
            setShowForm(false);
            setForm({ rating: 0, title: '', comment: '', pros: '', cons: '', isAnonymous: false });
            fetchReviews();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="card p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats?.averageRating || 0}
                        </div>
                        <StarRating rating={stats?.averageRating || 0} size="lg" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {stats?.totalReviews || 0} تقييم
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2 w-full">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = stats?.ratingDistribution?.[star] || 0;
                            const total = stats?.totalReviews || 1;
                            const pct = (count / total) * 100;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">{star}</span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-8">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Add Review Button */}
                {user && user.role === 'USER' && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn-primary"
                        >
                            <Star className="w-4 h-4 ml-2" />
                            أضف تقييمك
                        </button>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="card p-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">أضف تقييمك</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التقييم</label>
                            <StarRating rating={form.rating} onRate={r => setForm(p => ({ ...p, rating: r }))} interactive size="lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان التقييم</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input" placeholder="عنوان مختصر لتقييمك" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التعليق</label>
                            <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} className="input min-h-[80px]" placeholder="اكتب تجربتك مع الشركة..." required rows={3} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4" /> المميزات
                                </label>
                                <textarea value={form.pros} onChange={e => setForm(p => ({ ...p, pros: e.target.value }))} className="input min-h-[60px]" placeholder="ما الذي يميز هذه الشركة؟" rows={2} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                                    <ThumbsDown className="w-4 h-4" /> العيوب
                                </label>
                                <textarea value={form.cons} onChange={e => setForm(p => ({ ...p, cons: e.target.value }))} className="input min-h-[60px]" placeholder="ما الذي يمكن تحسينه؟" rows={2} />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                            <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(p => ({ ...p, isAnonymous: e.target.checked }))} className="rounded" />
                            {form.isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            تقييم مجهول
                        </label>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                                إرسال التقييم
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map(review => (
                    <div key={review._id} className="card p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                                    {review.isAnonymous ? <User className="w-5 h-5" /> : review.userId?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {review.isAnonymous ? 'مستخدم مجهول' : review.userId?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ar })}
                                    </p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{review.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{review.comment}</p>

                        {(review.pros || review.cons) && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {review.pros && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" /> المميزات
                                        </p>
                                        <p className="text-sm text-green-800 dark:text-green-300">{review.pros}</p>
                                    </div>
                                )}
                                {review.cons && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                                            <ThumbsDown className="w-3 h-3" /> العيوب
                                        </p>
                                        <p className="text-sm text-red-800 dark:text-red-300">{review.cons}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-12">
                        <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">لا توجد تقييمات بعد</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">كن أول من يقيّم هذه الشركة</p>
                    </div>
                )}
            </div>
        </div>
    );
}
