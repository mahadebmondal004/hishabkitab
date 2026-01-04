import React, { useState, useEffect } from 'react';
import { Megaphone, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/announcements');
                // Filter out dismissed
                const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
                const active = res.data.filter(a => !dismissed.includes(a.id));
                setAnnouncements(active);
            } catch (e) {
                console.error("Failed to fetch announcements", e);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % announcements.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [announcements]);

    if (announcements.length === 0) return null;

    const current = announcements[currentIndex];

    const handleDismiss = () => {
        const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
        if (current && current.id) {
            dismissed.push(current.id);
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed));

            // Remove from local state
            const remaining = announcements.filter(a => a.id !== current.id);
            setAnnouncements(remaining);
            if (currentIndex >= remaining.length) setCurrentIndex(0);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
            default: return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} />;
            case 'success': return <CheckCircle size={20} />;
            default: return <Megaphone size={20} />;
        }
    };

    return (
        <div className="mb-6 animate-fadeIn">
            {current && (
                <div
                    className={`relative p-4 rounded-xl border flex items-start gap-4 backdrop-blur-sm shadow-sm ${getTypeStyles(current.type)}`}
                >
                    <div className="mt-0.5 shrink-0 animate-pulse">
                        {getTypeIcon(current.type)}
                    </div>
                    <div className="flex-1 mr-8">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm uppercase tracking-wide opacity-90">
                                {current.title}
                            </h4>
                            {announcements.length > 1 && (
                                <span className="text-[10px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full font-mono">
                                    {currentIndex + 1}/{announcements.length}
                                </span>
                            )}
                        </div>
                        <p className="text-sm opacity-90 leading-relaxed font-medium">
                            {current.message}
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
                        title="Dismiss"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AnnouncementBanner;
