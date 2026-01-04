import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Save, Upload, Image as ImageIcon, Type, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminSEO = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        site_title: '',
        site_description: '',
        site_keywords: '',
        og_image: '',
        twitter_handle: '',
        google_analytics_id: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/cms/seo');
            // If empty object returned, keep defaults
            if (res.data && Object.keys(res.data).length > 0) {
                setFormData(res.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching SEO settings:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/admin/cms/seo', formData);
            setMessage({ type: 'success', text: 'SEO settings updated successfully!' });
            // Refresh local cache or context if needed here
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-105 border border-white/5">
                        <ArrowLeft size={20} className="text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            SEO Configuration
                        </h1>
                        <p className="text-gray-400 text-sm">Manage global site metadata and branding</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Preview Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Globe size={18} className="text-emerald-400" />
                            Search Preview
                        </h3>

                        {/* Google Search Result Preview */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold overflow-hidden">
                                    {formData.og_image ? <img src={formData.og_image} className="w-full h-full object-cover" /> : 'LOGO'}
                                </div>
                                <div className="text-xs text-gray-700">hishabkitab.com</div>
                            </div>
                            <div className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">
                                {formData.site_title || 'Hishab Kitab - Business Accounting'}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {formData.site_description || 'Free business accounting software for small businesses. Manage customers, payments, and track your business growth.'}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">Optimization Tips</h4>
                            <ul className="space-y-2 text-xs text-gray-500">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
                                    Keep titles under 60 characters
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
                                    Descriptions should be 150-160 chars
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
                                    Use relevant keywords naturally
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/10 border-red-500/20 text-red-300'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* General Settings */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/5">General Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">App Name / Site Title</label>
                                        <div className="relative group">
                                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="site_title"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                placeholder="e.g. Hishab Kitab"
                                                value={formData.site_title}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Meta Description</label>
                                        <textarea
                                            name="site_description"
                                            rows="4"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                                            placeholder="Brief description of your application..."
                                            value={formData.site_description}
                                            onChange={handleChange}
                                        ></textarea>
                                        <div className="text-right text-xs text-gray-600 mt-1">
                                            {formData.site_description.length} characters
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Keywords (Comma separated)</label>
                                        <input
                                            type="text"
                                            name="site_keywords"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                                            placeholder="accounting, business, ledger..."
                                            value={formData.site_keywords}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social & Analytics */}
                            <div className="pt-6">
                                <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/5">Social & Analytics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">OG Image URL (Logo)</label>
                                        <div className="relative group">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="og_image"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                placeholder="https://example.com/logo.png"
                                                value={formData.og_image}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Twitter Handle</label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors font-bold">@</span>
                                            <input
                                                type="text"
                                                name="twitter_handle"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                placeholder="hishabkitab"
                                                value={formData.twitter_handle}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Google Analytics ID</label>
                                        <div className="relative group">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="google_analytics_id"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                                                placeholder="G-XXXXXXXXXX"
                                                value={formData.google_analytics_id}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={20} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default AdminSEO;
