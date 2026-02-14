'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    Briefcase, Loader2, Plus, ArrowRight,
    Clock, CheckCircle, XCircle, Users, Edit, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
    _id: string;
    title: string;
    status: string;
    proposalCount: number;
    budgetMin: number;
    budgetMax: number;
    createdAt: string;
    category: string;
}

export default function MyProjectsPage() {
    const t = useTranslations('MyProjects');
    const tp = useTranslations('Projects');
    const tpd = useTranslations('ProjectDetail');
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyProjects();
    }, [user]);

    const fetchMyProjects = async () => {
        try {
            const res = await api.get('/projects/my-projects');
            setProjects(res.data.projects);
        } catch (error) {
            console.error(error);
            toast.error(t('loadError'));
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
            toast.success(t('deleteSuccess'));
        } catch (error) {
            toast.error(t('deleteError'));
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-primary-600" /> {t('title')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
                    </div>
                    <Link href="/projects/new" className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" /> {t('newProject')}
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noProjects')}</h3>
                        <p className="text-gray-500 mb-6">{t('startPosting')}</p>
                        <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" /> {t('postProject')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => (
                            <div key={project._id} className="card p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 group hover:border-primary-200 dark:hover:border-primary-900 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link href={`/projects/${project._id}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">
                                            {project.title}
                                        </Link>
                                        <span className={`badge text-xs ${project.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {tpd(`status.${project.status}`) || project.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" /> {tp('proposals', { n: project.proposalCount })}
                                        </span>
                                        <span>{tp(`categories.${project.category}`) || project.category}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/projects/${project._id}`} className="btn-secondary text-sm">
                                        {t('viewDetails')}
                                    </Link>
                                    <button onClick={() => deleteProject(project._id)} className="p-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg transition hover:bg-red-100 dark:hover:bg-red-900/40">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
