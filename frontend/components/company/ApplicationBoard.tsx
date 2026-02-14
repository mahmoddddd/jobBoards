'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { applicationsAPI, interviewsAPI } from '@/lib/api';
import { Loader2, Calendar, MessageSquare, FileText, X, Clock, MapPin, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

// Types
type Application = {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        headline?: string;
    };
    status: string;
    createdAt: string;
    matchScore?: number;
};

type BoardState = {
    [key: string]: Application[];
};

const COLUMNS = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'REJECTED'];

// --- Components ---

function ScheduleModal({ isOpen, onClose, application, onSuccess, locale }: any) {
    const t = useTranslations('InterviewScheduler');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        interviewDate: '',
        interviewTime: '',
        duration: 30,
        type: 'VIDEO',
        location: '',
        meetingLink: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Combine date and time
            const date = new Date(`${formData.interviewDate}T${formData.interviewTime}`);

            await interviewsAPI.schedule({
                applicationId: application._id,
                interviewDate: date.toISOString(),
                duration: formData.duration,
                type: formData.type,
                location: formData.location,
                meetingLink: formData.meetingLink,
                notes: formData.notes
            });

            toast.success(t('successMessage'));
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(t('errorMessage'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">{t('title')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl mb-4">
                        <p className="text-sm text-blue-800">
                            {t('schedulingFor')} <span className="font-bold">{application.userId.name}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
                            <input
                                type="date"
                                required
                                className="input-field w-full"
                                value={formData.interviewDate}
                                onChange={e => setFormData({ ...formData, interviewDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
                            <input
                                type="time"
                                required
                                className="input-field w-full"
                                value={formData.interviewTime}
                                onChange={e => setFormData({ ...formData, interviewTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                            <select
                                className="input-field w-full"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="VIDEO">{t('types.video')}</option>
                                <option value="PHONE">{t('types.phone')}</option>
                                <option value="IN_PERSON">{t('types.inPerson')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('duration')}</label>
                            <select
                                className="input-field w-full"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                            >
                                <option value={15}>15 {t('min')}</option>
                                <option value={30}>30 {t('min')}</option>
                                <option value={45}>45 {t('min')}</option>
                                <option value={60}>60 {t('min')}</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'VIDEO' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('meetingLink')}</label>
                            <div className="relative">
                                <Video className="absolute left-3 top-3 w-4 h-4 text-gray-400 rtl:right-3 rtl:left-auto" />
                                <input
                                    type="url"
                                    className="input-field w-full pl-10 rtl:pr-10 rtl:pl-4"
                                    placeholder="https://zoom.us/..."
                                    value={formData.meetingLink}
                                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === 'IN_PERSON' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 rtl:right-3 rtl:left-auto" />
                                <input
                                    type="text"
                                    className="input-field w-full pl-10 rtl:pr-10 rtl:pl-4"
                                    placeholder={t('locationPlaceholder')}
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
                        <textarea
                            className="input-field w-full h-24 resize-none"
                            placeholder={t('notesPlaceholder')}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {t('confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SortableItem({ application, locale, onSchedule }: { application: Application, locale: string, onSchedule: (app: Application) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: application._id, data: { ...application } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase">
                        {application.userId.name.substring(0, 2)}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{application.userId.name}</h4>
                        <p className="text-xs text-gray-500">{format(new Date(application.createdAt), 'MMM d, yyyy', { locale: locale === 'ar' ? ar : enUS })}</p>
                    </div>
                </div>
            </div>

            {application.userId.headline && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{application.userId.headline}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-primary-600 transition-colors" title="View Profile">
                        <FileText className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Message">
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                        onPointerDown={(e) => {
                            // Prevent drag on button click
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSchedule(application);
                        }}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title="Schedule Interview"
                    >
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
                {application.matchScore && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${application.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                        application.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {application.matchScore}%
                    </span>
                )}
            </div>
        </div>
    );
}

export default function ApplicationBoard({ jobId }: { jobId: string }) {
    const t = useTranslations('ApplicationBoard');
    const locale = useLocale();
    const [items, setItems] = useState<BoardState>({
        PENDING: [],
        REVIEWING: [],
        INTERVIEW: [],
        OFFERED: [],
        ACCEPTED: [],
        REJECTED: []
    });
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await applicationsAPI.getJobApplications(jobId, { limit: 200 });
            const apps: Application[] = response.data.applications;

            const newItems: BoardState = {
                PENDING: [],
                REVIEWING: [],
                INTERVIEW: [],
                OFFERED: [],
                ACCEPTED: [],
                REJECTED: []
            };

            apps.forEach(app => {
                if (newItems[app.status]) {
                    newItems[app.status].push(app);
                } else {
                    if (!newItems['PENDING']) newItems['PENDING'] = [];
                    newItems['PENDING'].push(app);
                }
            });

            setItems(newItems);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId as string);
        const overContainer = findContainer(overId as string) || (COLUMNS.includes(overId as string) ? overId : null);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer as string];
            const activeIndex = activeItems.findIndex((item) => item._id === activeId);
            const overIndex = overItems.findIndex((item) => item._id === overId);

            let newIndex;
            if (COLUMNS.includes(overId as string)) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item._id !== activeId),
                ],
                [overContainer as string]: [
                    ...prev[overContainer as string].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer as string].slice(newIndex, prev[overContainer as string].length),
                ],
            };
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(activeId as string);
        const overContainer = findContainer(overId as string) || (COLUMNS.includes(overId as string) ? overId : null);

        if (activeContainer && overContainer) {
            if (activeContainer === overContainer) {
                const activeIndex = items[activeContainer].findIndex((item) => item._id === activeId);
                const overIndex = items[overContainer].findIndex((item) => item._id === overId);

                if (activeIndex !== overIndex) {
                    setItems((items) => ({
                        ...items,
                        [activeContainer]: arrayMove(items[activeContainer], activeIndex, overIndex),
                    }));
                }
            }

            const newStatus = Object.keys(items).find(key => items[key].find(i => i._id === activeId));

            if (newStatus && newStatus !== active.data.current?.status) {
                try {
                    await applicationsAPI.updateStatus(activeId as string, newStatus);
                    toast.success(`Application moved to ${t(newStatus.toLowerCase())}`);

                    setItems(prev => {
                        const newItems = { ...prev };
                        const appFunc = (app: Application) => {
                            if (app._id === activeId) return { ...app, status: newStatus };
                            return app;
                        };
                        Object.keys(newItems).forEach(key => {
                            newItems[key] = newItems[key].map(appFunc);
                        });
                        return newItems;
                    });

                    // Logic to open modal if moved to INTERVIEW?
                    // Optional: if (newStatus === 'INTERVIEW') setSchedulingApp(currentApp);

                } catch (error) {
                    toast.error('Failed to update status');
                    fetchApplications();
                }
            }
        }

        setActiveId(null);
    };

    function findContainer(id: string) {
        if (activeId && activeId === id) {
            return Object.keys(items).find((key) => items[key].find((item) => item._id === id));
        }
        if (id in items) {
            return id;
        }
        return Object.keys(items).find((key) => items[key].find((item) => item._id === id));
    }

    const getColColor = (col: string) => {
        switch (col) {
            case 'PENDING': return 'bg-gray-100 border-gray-200';
            case 'REVIEWING': return 'bg-blue-50 border-blue-200';
            case 'INTERVIEW': return 'bg-purple-50 border-purple-200';
            case 'OFFERED': return 'bg-orange-50 border-orange-200';
            case 'ACCEPTED': return 'bg-green-50 border-green-200';
            case 'REJECTED': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50';
        }
    };

    const getColTitle = (col: string) => {
        return t(col.toLowerCase());
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

    return (
        <div className="h-[calc(100vh-200px)] overflow-x-auto pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 min-w-max h-full">
                    {COLUMNS.map((col) => (
                        <div key={col} className={`w-80 rounded-xl p-4 flex flex-col h-full ${getColColor(col)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-700">{getColTitle(col)}</h3>
                                <span className="bg-white/50 px-2 py-1 rounded-md text-sm font-semibold text-gray-600">
                                    {items[col].length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-[100px] pr-2 custom-scrollbar">
                                <SortableContext
                                    id={col}
                                    items={items[col].map(i => i._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {items[col].map((app) => (
                                        <SortableItem
                                            key={app._id}
                                            application={app}
                                            locale={locale}
                                            onSchedule={(app) => setSchedulingApp(app)}
                                        />
                                    ))}
                                </SortableContext>
                            </div>
                        </div>
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white p-4 rounded-xl shadow-xl border border-primary-200 rotate-2 cursor-grabbing w-80">
                            <div className="w-8 h-8 rounded-full bg-primary-100 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Scheduling Modal */}
            <ScheduleModal
                isOpen={!!schedulingApp}
                onClose={() => setSchedulingApp(null)}
                application={schedulingApp}
                onSuccess={() => {
                    fetchApplications(); // Refresh to potentially show new status if we allowed status update in modal
                }}
                locale={locale}
            />
        </div>
    );
}
