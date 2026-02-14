'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    FileText, Plus, Trash2, Download, User, Briefcase, GraduationCap,
    Code, Mail, Phone, MapPin, Globe, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Education {
    id: string;
    school: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
}

interface Experience {
    id: string;
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
    current: boolean;
}

interface ResumeData {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    skills: string[];
    education: Education[];
    experience: Experience[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ResumeBuilderPage() {
    const t = useTranslations('ResumeBuilder');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const router = useRouter();
    const resumeRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const [data, setData] = useState<ResumeData>({
        name: user?.name || '',
        title: '',
        email: user?.email || '',
        phone: '',
        location: '',
        website: '',
        summary: '',
        skills: [],
        education: [],
        experience: [],
    });

    const addSkill = () => {
        if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
            setData((prev: ResumeData) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setData((prev: ResumeData) => ({ ...prev, skills: prev.skills.filter((s: string) => s !== skill) }));
    };

    const addEducation = () => {
        setData((prev: ResumeData) => ({
            ...prev,
            education: [...prev.education, { id: generateId(), school: '', degree: '', field: '', startYear: '', endYear: '' }]
        }));
    };

    const updateEducation = (id: string, field: string, value: string) => {
        setData((prev: ResumeData) => ({
            ...prev,
            education: prev.education.map((e: Education) => e.id === id ? { ...e, [field]: value } : e)
        }));
    };

    const removeEducation = (id: string) => {
        setData((prev: ResumeData) => ({ ...prev, education: prev.education.filter((e: Education) => e.id !== id) }));
    };

    const addExperience = () => {
        setData((prev: ResumeData) => ({
            ...prev,
            experience: [...prev.experience, { id: generateId(), company: '', position: '', description: '', startDate: '', endDate: '', current: false }]
        }));
    };

    const updateExperience = (id: string, field: string, value: string | boolean) => {
        setData((prev: ResumeData) => ({
            ...prev,
            experience: prev.experience.map((e: Experience) => e.id === id ? { ...e, [field]: value } : e)
        }));
    };

    const removeExperience = (id: string) => {
        setData((prev: ResumeData) => ({ ...prev, experience: prev.experience.filter((e: Experience) => e.id !== id) }));
    };

    const generatePDF = async () => {
        if (!resumeRef.current) return;
        setGenerating(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(resumeRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${data.name || 'resume'}_CV.pdf`);
            toast.success(t('successToast'));
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error(t('errorToast'));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        <FileText className={`inline-block w-8 h-8 ${isRtl ? 'ml-2' : 'mr-2'} text-primary-600`} />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Form Side */}
                    <div className="space-y-6">
                        {/* Personal Info */}
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-600" />
                                {t('personalInfo')}
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                                    <input value={data.name} onChange={e => setData((prev: ResumeData) => ({ ...prev, name: e.target.value }))} className="input" placeholder={t('namePlaceholder')} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('jobTitle')}</label>
                                    <input value={data.title} onChange={e => setData((prev: ResumeData) => ({ ...prev, title: e.target.value }))} className="input" placeholder={t('jobTitlePlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                                    <input type="email" value={data.email} onChange={e => setData((prev: ResumeData) => ({ ...prev, email: e.target.value }))} className="input" placeholder={t('emailPlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                                    <input value={data.phone} onChange={e => setData((prev: ResumeData) => ({ ...prev, phone: e.target.value }))} className="input" placeholder={t('phonePlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('location')}</label>
                                    <input value={data.location} onChange={e => setData((prev: ResumeData) => ({ ...prev, location: e.target.value }))} className="input" placeholder={t('locationPlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('website')}</label>
                                    <input value={data.website} onChange={e => setData((prev: ResumeData) => ({ ...prev, website: e.target.value }))} className="input" placeholder={t('websitePlaceholder')} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('summary')}</label>
                                    <textarea value={data.summary} onChange={e => setData((prev: ResumeData) => ({ ...prev, summary: e.target.value }))} className="input min-h-[80px]" placeholder={t('summaryPlaceholder')} rows={3} />
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Code className="w-5 h-5 text-primary-600" />
                                {t('skills')}
                            </h2>
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={newSkill}
                                    onChange={e => setNewSkill(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    className="input flex-1"
                                    placeholder={t('addSkillPlaceholder')}
                                />
                                <button onClick={addSkill} className="btn-primary-sm">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map(skill => (
                                    <span key={skill} className="badge-primary flex items-center gap-1">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary-600" />
                                    {t('experience')}
                                </h2>
                                <button onClick={addExperience} className="btn-primary-sm flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    {t('add')}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {data.experience.map(exp => (
                                    <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 relative">
                                        <button onClick={() => removeExperience(exp.id)} className="absolute top-3 left-3 text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="input" placeholder={t('company')} />
                                            <input value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} className="input" placeholder={t('jobTitle')} />
                                            <input type="month" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="input" />
                                            <input type="month" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="input" disabled={exp.current} placeholder={exp.current ? t('present') : ''} />
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded" />
                                            {t('currentWork')}
                                        </label>
                                        <textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="input min-h-[60px]" placeholder={t('tasksDescription')} rows={2} />
                                    </div>
                                ))}
                                {data.experience.length === 0 && (
                                    <p className="text-center text-gray-400 dark:text-gray-500 py-4">{t('noExperience')}</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-primary-600" />
                                    {t('education')}
                                </h2>
                                <button onClick={addEducation} className="btn-primary-sm flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    {t('add')}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {data.education.map(edu => (
                                    <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 relative">
                                        <button onClick={() => removeEducation(edu.id)} className="absolute top-3 left-3 text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} className="input col-span-2" placeholder={t('school')} />
                                            <input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="input" placeholder={t('degree')} />
                                            <input value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} className="input" placeholder={t('field')} />
                                            <input value={edu.startYear} onChange={e => updateEducation(edu.id, 'startYear', e.target.value)} className="input" placeholder={t('startYear')} />
                                            <input value={edu.endYear} onChange={e => updateEducation(edu.id, 'endYear', e.target.value)} className="input" placeholder={t('endYear')} />
                                        </div>
                                    </div>
                                ))}
                                {data.education.length === 0 && (
                                    <p className="text-center text-gray-400 dark:text-gray-500 py-4">{t('noEducation')}</p>
                                )}
                            </div>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={generatePDF}
                            disabled={generating || !data.name}
                            className="btn-primary w-full text-lg py-4"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} />
                                    {t('generatingPdf')}
                                </>
                            ) : (
                                <>
                                    <Download className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                    {t('downloadPdf')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Side */}
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('previewTitle')}</h3>
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                            <div ref={resumeRef} className="p-8" style={{ fontFamily: "'Cairo', 'Inter', sans-serif", direction: isRtl ? 'rtl' : 'ltr', minHeight: '800px', background: 'white', color: '#1a1a1a' }}>
                                {/* Resume Header */}
                                <div style={{ borderBottom: '3px solid #4f46e5', paddingBottom: '20px', marginBottom: '24px' }}>
                                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{data.name || (isRtl ? 'اسمك هنا' : 'Your Name Here')}</h1>
                                    {data.title && <p style={{ fontSize: '16px', color: '#4f46e5', fontWeight: '600', marginTop: '4px' }}>{data.title}</p>}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#666' }}>
                                        {data.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📧 {data.email}</span>}
                                        {data.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📱 {data.phone}</span>}
                                        {data.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {data.location}</span>}
                                        {data.website && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🌐 {data.website}</span>}
                                    </div>
                                </div>

                                {/* Summary */}
                                {data.summary && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>{t('summary')}</h2>
                                        <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#444' }}>{data.summary}</p>
                                    </div>
                                )}

                                {/* Experience */}
                                {data.experience.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>{t('experience')}</h2>
                                        {data.experience.map(exp => (
                                            <div key={exp.id} style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{exp.position || t('jobTitle')}</h3>
                                                        <p style={{ fontSize: '13px', color: '#4f46e5', margin: '2px 0' }}>{exp.company || t('company')}</p>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: '#888' }}>
                                                        {exp.startDate} - {exp.current ? t('present') : exp.endDate}
                                                    </span>
                                                </div>
                                                {exp.description && <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.7', marginTop: '6px' }}>{exp.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Education */}
                                {data.education.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>{t('education')}</h2>
                                        {data.education.map(edu => (
                                            <div key={edu.id} style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{edu.school || t('school')}</h3>
                                                        <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>{edu.degree} {edu.field && `- ${edu.field}`}</p>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: '#888' }}>{edu.startYear} - {edu.endYear}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Skills */}
                                {data.skills.length > 0 && (
                                    <div>
                                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>{t('skills')}</h2>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {data.skills.map(skill => (
                                                <span key={skill} style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
