'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { skillTestsAPI } from '@/lib/api';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

export default function SkillQuizPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations('SkillTests');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const testId = params.id as string;

    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (testId) fetchTest();
    }, [testId]);

    const fetchTest = async () => {
        try {
            const res = await skillTestsAPI.getOne(testId);
            setTest(res.data.test);
            setAnswers(new Array(res.data.test.questions.length).fill(-1));
        } catch (error) {
            toast.error('Failed to load test');
            router.push('/freelancer/skills');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.some(a => a === -1)) {
            toast.error('Please answer all questions');
            return;
        }

        if (!confirm(t('confirmSubmit'))) return;

        setSubmitting(true);
        try {
            const res = await skillTestsAPI.submit(testId, answers);
            setResult(res.data);
        } catch (error) {
            toast.error('Error submitting test');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (result) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="card p-8 max-w-md w-full text-center">
                    {result.passed ? (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                    )}

                    <h2 className="text-2xl font-bold mb-2">
                        {result.passed ? t('passed') : t('failed')}
                    </h2>

                    <div className="text-4xl font-black text-gray-900 mb-6">
                        {result.score}%
                    </div>

                    <button
                        onClick={() => router.push('/freelancer/skills')}
                        className="btn-primary w-full"
                    >
                        {t('backToSkills')}
                    </button>
                </div>
            </div>
        );
    }

    const question = test.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/freelancer/skills')}
                        className="text-gray-500 hover:text-gray-900"
                    >
                        {isRtl ? <ArrowRight /> : <ArrowLeft />}
                    </button>
                    <div className="flex items-center gap-2 text-primary-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
                        <Timer className="w-4 h-4" />
                        <span>{test.durationMinutes}:00</span>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="mb-6">
                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                            Question {currentQuestion + 1} of {test.questions.length}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 mt-2">{question.question}</h2>
                    </div>

                    <div className="space-y-3 mb-8">
                        {question.options.map((option: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion] === idx
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[currentQuestion] === idx ? 'border-primary-500' : 'border-gray-300'
                                        }`}>
                                        {answers[currentQuestion] === idx && <div className="w-3 h-3 bg-primary-500 rounded-full" />}
                                    </div>
                                    <span>{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                        <button
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(curr => curr - 1)}
                            className="btn-secondary disabled:opacity-50"
                        >
                            {t('prev')}
                        </button>

                        {currentQuestion === test.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn-primary"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submit')}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(curr => curr + 1)}
                                className="btn-primary"
                            >
                                {t('next')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
