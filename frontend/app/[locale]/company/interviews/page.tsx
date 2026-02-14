'use client';

import { useState, useEffect } from 'react';
import { interviewsAPI } from '@/lib/api';
import { Loader2, Calendar, Clock, MapPin, Video, User, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';

interface Interview {
    _id: string;
    jobId: { title: string };
    applicantId: { name: string; avatar?: string };
    date: string;
    duration: number;
    type: string;
    location?: string;
    meetingLink?: string;
    status: string;
}

export default function CompanyInterviewsPage() {
    const t = useTranslations('InterviewScheduler');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const res = await interviewsAPI.getAll();
            setInterviews(res.data.interviews);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'text-blue-600 bg-blue-50';
            case 'COMPLETED': return 'text-green-600 bg-green-50';
            case 'CANCELLED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Interviews</h1>
                    <p className="text-gray-500">Upcoming and past interviews with candidates.</p>
                </div>
                <Link
                    href="/company/dashboard"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                    {isRtl ? <ArrowRight /> : <ArrowLeft />}
                    <span>Dashboard</span>
                </Link>
            </div>

            {interviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Scheduled Interviews</h3>
                    <p className="text-gray-500">Scheduled interviews will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {interviews.map((interview) => (
                        <div key={interview._id} className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-primary-50 text-primary-700 rounded-xl font-bold">
                                    <span className="text-2xl">{new Date(interview.date).getDate()}</span>
                                    <span className="text-xs uppercase">{format(new Date(interview.date), 'MMM', { locale: locale === 'ar' ? ar : enUS })}</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-gray-900">{interview.jobId.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(interview.status)}`}>
                                            {interview.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <User className="w-4 h-4" />
                                        <span>Candidate: <span className="font-semibold text-gray-900">{interview.applicantId.name}</span></span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{format(new Date(interview.date), 'h:mm a', { locale: locale === 'ar' ? ar : enUS })} ({interview.duration} min)</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {interview.type === 'VIDEO' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                            <span>
                                                {interview.type === 'VIDEO' ? 'Remote (Video Call)' :
                                                    interview.type === 'PHONE' ? 'Phone Call' : 'In Person'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {interview.meetingLink && (
                                    <a
                                        href={interview.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Video className="w-4 h-4" />
                                        Join Meeting
                                    </a>
                                )}
                                {/* Add reschedule/cancel actions later */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
