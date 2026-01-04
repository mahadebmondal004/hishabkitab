import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle, AlertTriangle, Info, X, Power } from 'lucide-react';
import api from '../../api/axios';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/admin/announcements');
            setAnnouncements(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await api.post('/admin/announcements', formData);
            setShowModal(false);
            setFormData({ title: '', message: '', type: 'info' });
            fetchAnnouncements();
        } catch (error) {
            alert('Failed to create announcement');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this announcement?')) {
            try {
                await api.delete(`/admin/announcements/${id}`);
                fetchAnnouncements();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.patch(`/admin/announcements/${id}/toggle`);
            fetchAnnouncements(); // Refresh to show new state
        } catch (error) {
            console.error('Toggle failed');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-amber-400" size={20} />;
            case 'success': return <CheckCircle className="text-emerald-400" size={20} />;
            default: return <Info className="text-blue-400" size={20} />;
        }
    };

    if (loading) return <div className="p-10 text-center text-white">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Announcements</h2>
                    <p className="text-slate-400">Broadcast messages to all users</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} /> New Announcement
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {announcements.map((item) => (
                    <div key={item.id} className={`p-6 bg-slate-900/50 backdrop-blur-sm border ${item.is_active ? 'border-indigo-500/30' : 'border-white/5 opacity-70'} rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all hover:bg-slate-900/70`}>
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-xl bg-white/5 ${!item.is_active && 'grayscale'}`}>
                                {getTypeIcon(item.type)}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    {!item.is_active && <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700">Inactive</span>}
                                    <span className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${item.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            item.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>{item.type}</span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.message}</p>
                                <p className="text-xs text-slate-600 mt-2">{new Date(item.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                                onClick={() => handleToggle(item.id)}
                                className={`p-2 rounded-lg transition-colors ${item.is_active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                                title={item.is_active ? "Deactivate" : "Activate"}
                            >
                                <Power size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {announcements.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                        <Megaphone className="mx-auto text-slate-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-500">No Announcements</h3>
                        <p className="text-slate-600">Create one to notify your users.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-scaleIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">New Announcement</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                                <input
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. System Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none h-32"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Write your update here..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
                                <div className="flex gap-2">
                                    {['info', 'warning', 'success'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFormData({ ...formData, type: t })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${formData.type === t
                                                    ? (t === 'warning' ? 'bg-amber-500 text-black' : t === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white')
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4"
                            >
                                Publish Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
