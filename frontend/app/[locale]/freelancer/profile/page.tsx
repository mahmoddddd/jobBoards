'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    User, Briefcase, DollarSign, MapPin, Globe, Code,
    Plus, Trash2, Save, Loader2, ArrowRight, X, Smartphone,
    Palette, PenTool, Megaphone, Database, Video, Music, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface PortfolioItem {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}

interface LangItem {
    language: string;
    level: string;
}

export default function FreelancerProfilePage() {
    const t = useTranslations('FreelancerProfile');
    const tf = useTranslations('Freelancers');
    const tp = useTranslations('Projects');
    const tfd = useTranslations('FreelancerDetail');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const categories = [
        { value: 'WEB_DEVELOPMENT', label: tp('categories.WEB_DEVELOPMENT'), icon: Code },
        { value: 'MOBILE_DEVELOPMENT', label: tp('categories.MOBILE_DEVELOPMENT'), icon: Smartphone },
        { value: 'DESIGN', label: tp('categories.DESIGN'), icon: Palette },
        { value: 'WRITING', label: tp('categories.WRITING'), icon: PenTool },
        { value: 'MARKETING', label: tp('categories.MARKETING'), icon: Megaphone },
        { value: 'DATA_SCIENCE', label: tp('categories.DATA_SCIENCE'), icon: Database },
        { value: 'VIDEO_ANIMATION', label: tp('categories.VIDEO_ANIMATION'), icon: Video },
        { value: 'MUSIC_AUDIO', label: tp('categories.MUSIC_AUDIO'), icon: Music },
        { value: 'BUSINESS', label: tp('categories.BUSINESS'), icon: Briefcase },
        { value: 'OTHER', label: tp('categories.OTHER'), icon: MoreHorizontal },
    ];
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [category, setCategory] = useState('WEB_DEVELOPMENT');
    const [hourlyRate, setHourlyRate] = useState('');
    const [availability, setAvailability] = useState('AVAILABLE');
    const [experienceLevel, setExperienceLevel] = useState('MID');
    const [location, setLocation] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [languages, setLanguages] = useState<LangItem[]>([]);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/freelancers/me');
            const p = res.data.profile;
            setTitle(p.title || '');
            setBio(p.bio || '');
            setCategory(p.category || 'WEB_DEVELOPMENT');
            setHourlyRate(p.hourlyRate?.toString() || '');
            setAvailability(p.availability || 'AVAILABLE');
            setExperienceLevel(p.experienceLevel || 'MID');
            setLocation(p.location || '');
            setSkills(p.skills || []);
            setPortfolio(p.portfolio || []);
            setLanguages(p.languages || []);
            setIsNew(false);
        } catch {
            setIsNew(true);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !skills.includes(s)) {
            setSkills([...skills, s]);
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const addPortfolioItem = () => {
        setPortfolio([...portfolio, { title: '', description: '', imageUrl: '', link: '' }]);
    };

    const updatePortfolio = (index: number, field: keyof PortfolioItem, value: string) => {
        const updated = [...portfolio];
        updated[index] = { ...updated[index], [field]: value };
        setPortfolio(updated);
    };

    const removePortfolioItem = (index: number) => {
        setPortfolio(portfolio.filter((_, i) => i !== index));
    };

    const addLanguage = () => {
        setLanguages([...languages, { language: '', level: 'CONVERSATIONAL' }]);
    };

    const updateLanguage = (index: number, field: keyof LangItem, value: string) => {
        const updated = [...languages];
        updated[index] = { ...updated[index], [field]: value };
        setLanguages(updated);
    };

    const removeLanguage = (index: number) => {
        setLanguages(languages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !bio || !category) {
            toast.error(t('form.error.required'));
            return;
        }
        setSaving(true);
        try {
            const data = {
                title, bio, category, skills, location,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
                availability, experienceLevel,
                portfolio: portfolio.filter(p => p.title),
                languages: languages.filter(l => l.language)
            };

            if (isNew) {
                await api.post('/freelancers/profile', data);
                toast.success(t('form.success.created'));
            } else {
                await api.put('/freelancers/profile', data);
                toast.success(t('form.success.updated'));
            }
            setIsNew(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('form.error.generic'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/freelancers" className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-6">
                    {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('backToFreelancers')}
                </Link>

                <div className="card p-5 md:p-8">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <User className="w-6 md:w-7 h-6 md:h-7 text-primary-600" />
                        {isNew ? t('createTitle') : t('editTitle')}
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">{t('subtitle')}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.title')}</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="input text-sm" placeholder={t('form.titlePlaceholder')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.category')}</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm">
                                    {categories.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.bio')}</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                                className="input min-h-[120px] text-sm" placeholder={t('form.bioPlaceholder')} required />
                            <p className="text-[10px] text-gray-500 mt-1">{bio.length}/2000</p>
                        </div>

                        {/* Rate, Availability, Experience */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <DollarSign className="w-4 h-4 inline mx-1" /> {t('form.hourlyRate')}
                                </label>
                                <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)}
                                    className="input text-sm" placeholder="25" min="1" max="1000" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.availability')}</label>
                                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="input text-sm">
                                    <option value="AVAILABLE">{tf('available')}</option>
                                    <option value="BUSY">{tf('busy')}</option>
                                    <option value="NOT_AVAILABLE">{tf('notAvailable')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.experienceLevel')}</label>
                                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input text-sm">
                                    <option value="ENTRY">{tp('experience.ENTRY')}</option>
                                    <option value="MID">{tp('experience.MID')}</option>
                                    <option value="SENIOR">{tp('experience.SENIOR')}</option>
                                    <option value="EXPERT">{tp('experience.EXPERT')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mx-1" /> {t('form.location')}
                            </label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                className="input text-sm" placeholder={t('form.locationPlaceholder')} />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.skills')}</label>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                    className="input flex-1 text-sm" placeholder={t('form.skillPlaceholder')} />
                                <button type="button" onClick={addSkill} className="btn-secondary px-4">
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {skills.map((skill, i) => (
                                    <span key={i} className="badge-primary flex items-center gap-1.5 py-1 px-3 text-xs md:text-sm">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(i)} className="hover:text-red-500 transition-colors p-0.5">
                                            <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="pt-4 border-t dark:border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Globe className="w-4 h-4 text-primary-600" /> {t('form.languages')}
                                </label>
                                <button type="button" onClick={addLanguage} className="text-primary-600 text-xs md:text-sm flex items-center gap-1 hover:underline font-bold">
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" /> {t('form.addLanguage')}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {languages.map((lang, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl">
                                        <input type="text" value={lang.language} onChange={(e) => updateLanguage(i, 'language', e.target.value)}
                                            className="input text-sm flex-1" placeholder="مثال: العربية" />
                                        <div className="flex gap-2">
                                            <select value={lang.level} onChange={(e) => updateLanguage(i, 'level', e.target.value)} className="input text-sm flex-1 sm:w-40">
                                                <option value="BASIC">{tfd('langLevels.BASIC')}</option>
                                                <option value="CONVERSATIONAL">{tfd('langLevels.CONVERSATIONAL')}</option>
                                                <option value="FLUENT">{tfd('langLevels.FLUENT')}</option>
                                                <option value="NATIVE">{tfd('langLevels.NATIVE')}</option>
                                            </select>
                                            <button type="button" onClick={() => removeLanguage(i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Portfolio */}
                        <div className="pt-4 border-t dark:border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Briefcase className="w-4 h-4 text-primary-600" /> {t('form.portfolio')}
                                </label>
                                <button type="button" onClick={addPortfolioItem} className="text-primary-600 text-xs md:text-sm flex items-center gap-1 hover:underline font-bold">
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" /> {t('form.addPortfolio')}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {portfolio.map((item, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-900/40 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">{t('form.portfolioItem', { n: i + 1 })}</span>
                                            <button type="button" onClick={() => removePortfolioItem(i)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block px-1">{t('form.projectTitle')}</label>
                                                <input type="text" value={item.title} onChange={(update) => updatePortfolio(i, 'title', update.target.value)}
                                                    className="input text-sm" placeholder={t('form.projectTitle')} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block px-1">{t('form.projectLink')}</label>
                                                <input type="url" value={item.link} onChange={(update) => updatePortfolio(i, 'link', update.target.value)}
                                                    className="input text-sm" placeholder={t('form.projectLink')} />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block px-1">{t('form.projectDesc')}</label>
                                            <textarea value={item.description} onChange={(update) => updatePortfolio(i, 'description', update.target.value)}
                                                className="input text-sm" placeholder={t('form.projectDesc')} rows={2} />
                                        </div>
                                        <div className="mt-4">
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block px-1">{t('form.projectImage')}</label>
                                            <input type="url" value={item.imageUrl} onChange={(update) => updatePortfolio(i, 'imageUrl', update.target.value)}
                                                className="input text-sm" placeholder={t('form.projectImage')} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-6 border-t dark:border-gray-700">
                            <button type="submit" disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg shadow-soft hover:shadow-primary-500/20">
                                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                {saving ? t('form.submit.saving') : isNew ? t('form.submit.create') : t('form.submit.update')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
