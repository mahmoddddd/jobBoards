'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    FolderPlus, ArrowRight, ArrowLeft, Loader2, Code, Smartphone,
    Palette, PenTool, Megaphone, Database, Video, Music, Briefcase,
    MoreHorizontal, DollarSign, Clock, Plus, X, CheckCircle
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';



export default function NewProjectPage() {
    const t = useTranslations('NewProject');
    const tp = useTranslations('Projects'); // For experience, duration enums if needed or use NewProject
    const tc = useTranslations('Common');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [budgetType, setBudgetType] = useState('FIXED');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [duration, setDuration] = useState('LESS_THAN_1_MONTH');
    const [experienceLevel, setExperienceLevel] = useState('MID');

    const categories = [
        { value: 'WEB_DEVELOPMENT', label: t('categories.WEB_DEVELOPMENT'), icon: Code, desc: t('categoryDescs.WEB_DEVELOPMENT') },
        { value: 'MOBILE_DEVELOPMENT', label: t('categories.MOBILE_DEVELOPMENT'), icon: Smartphone, desc: t('categoryDescs.MOBILE_DEVELOPMENT') },
        { value: 'DESIGN', label: t('categories.DESIGN'), icon: Palette, desc: t('categoryDescs.DESIGN') },
        { value: 'WRITING', label: t('categories.WRITING'), icon: PenTool, desc: t('categoryDescs.WRITING') },
        { value: 'MARKETING', label: t('categories.MARKETING'), icon: Megaphone, desc: t('categoryDescs.MARKETING') },
        { value: 'DATA_SCIENCE', label: t('categories.DATA_SCIENCE'), icon: Database, desc: t('categoryDescs.DATA_SCIENCE') },
        { value: 'VIDEO_ANIMATION', label: t('categories.VIDEO_ANIMATION'), icon: Video, desc: t('categoryDescs.VIDEO_ANIMATION') },
        { value: 'MUSIC_AUDIO', label: t('categories.MUSIC_AUDIO'), icon: Music, desc: t('categoryDescs.MUSIC_AUDIO') },
        { value: 'BUSINESS', label: t('categories.BUSINESS'), icon: Briefcase, desc: t('categoryDescs.BUSINESS') },
        { value: 'OTHER', label: t('categories.OTHER'), icon: MoreHorizontal, desc: t('categoryDescs.OTHER') },
    ];

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
    };

    const canNext = () => {
        if (step === 1) return title.length >= 5 && description.length >= 20;
        if (step === 2) return category !== '';
        if (step === 3) return budgetMax !== '';
        return true;
    };

    const handleSubmit = async () => {
        if (!user) { toast.error(t('loginRequired')); return; }
        setSubmitting(true);
        try {
            const res = await api.post('/projects', {
                title, description, category, skills, budgetType,
                budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
                budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
                duration, experienceLevel
            });
            toast.success(t('success'));
            router.push(`/projects/${res.data.project._id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || tc('error'));
        } finally { setSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/projects" className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-6">
                    {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t('back')}
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3 mb-2">
                        <FolderPlus className="w-8 h-8 text-primary-600" /> {t('title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[t('steps.description'), t('steps.categorySkills'), t('steps.budget'), t('steps.review')].map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                                {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
                            </div>
                            <span className={`text-sm hidden md:inline ${step === i + 1 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{label}</span>
                            {i < 3 && <div className={`w-8 h-0.5 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Title & Description */}
                {step === 1 && (
                    <div className="card p-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('descriptionTitle')}</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('projectTitle')}</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="input" placeholder={t('projectTitlePlaceholder')} maxLength={150} />
                                <p className="text-xs text-gray-500 mt-1">{title.length}/150</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('detailedDescription')}</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="input min-h-[180px]" placeholder={t('detailedDescriptionPlaceholder')} maxLength={5000} />
                                <p className="text-xs text-gray-500 mt-1">{description.length}/5000</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Category & Skills */}
                {step === 2 && (
                    <div className="card p-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('categoryTitle')}</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('chooseCategory')}</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((c) => {
                                        const Icon = c.icon;
                                        return (
                                            <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                                                className={`p-4 rounded-xl border-2 ${isRtl ? 'text-right' : 'text-left'} transition-all ${category === c.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                                    }`}>
                                                <Icon className={`w-6 h-6 mb-2 ${category === c.value ? 'text-primary-600' : 'text-gray-400'}`} />
                                                <div className="font-medium text-sm text-gray-900 dark:text-white">{c.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('skills')}</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                        className="input flex-1" placeholder={t('skillsPlaceholder')} />
                                    <button type="button" onClick={addSkill} className="btn-secondary px-4"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((s, i) => (
                                        <span key={i} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 flex items-center gap-1">
                                            {s} <button type="button" onClick={() => setSkills(skills.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('experienceLevel')}</label>
                                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input">
                                    <option value="ENTRY">{tp('experience.ENTRY')}</option>
                                    <option value="MID">{tp('experience.MID')}</option>
                                    <option value="SENIOR">{tp('experience.SENIOR')}</option>
                                    <option value="EXPERT">{tp('experience.EXPERT')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Budget & Duration */}
                {step === 3 && (
                    <div className="card p-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('budgetTitle')}</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('budgetType')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { v: 'FIXED', label: t('fixed'), desc: t('fixedDesc'), icon: DollarSign },
                                        { v: 'HOURLY', label: t('hourly'), desc: t('hourlyDesc'), icon: Clock },
                                    ].map(({ v, label, desc, icon: Icon }) => (
                                        <button key={v} type="button" onClick={() => setBudgetType(v)}
                                            className={`p-5 rounded-xl border-2 ${isRtl ? 'text-right' : 'text-left'} transition-all ${budgetType === v ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                                                }`}>
                                            <Icon className={`w-6 h-6 mb-2 ${budgetType === v ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('minBudget')}</label>
                                    <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="input" placeholder="100" min="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('maxBudget')}</label>
                                    <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="input" placeholder="500" min="0" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('duration')}</label>
                                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input">
                                    <option value="LESS_THAN_1_WEEK">{tp('durations.LESS_THAN_1_WEEK')}</option>
                                    <option value="LESS_THAN_1_MONTH">{tp('durations.LESS_THAN_1_MONTH')}</option>
                                    <option value="1_TO_3_MONTHS">{tp('durations.1_TO_3_MONTHS')}</option>
                                    <option value="3_TO_6_MONTHS">{tp('durations.3_TO_6_MONTHS')}</option>
                                    <option value="MORE_THAN_6_MONTHS">{tp('durations.MORE_THAN_6_MONTHS')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="card p-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('reviewTitle')}</h2>
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{description}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                    <div className="text-sm text-gray-500 mb-1">{t('categoryLabel')}</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{categories.find(c => c.value === category)?.label}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                    <div className="text-sm text-gray-500 mb-1">{t('budgetLabel')}</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        ${budgetMin || '0'} - ${budgetMax} ({budgetType === 'FIXED' ? t('fixed') : t('hourly')})
                                    </div>
                                </div>
                            </div>
                            {skills.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                    <div className="text-sm text-gray-500 mb-2">{t('skillsLabel')}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg text-sm">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t('back')}
                        </button>
                    ) : <div />}
                    {step < 4 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canNext()}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50">
                            {t('next')} {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={submitting}
                            className="btn-primary flex items-center gap-2">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            {submitting ? t('publishing') : t('publish')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
