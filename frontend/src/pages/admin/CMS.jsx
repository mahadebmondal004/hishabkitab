import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Plus, Trash2, Globe, Eye, Code, Layout } from 'lucide-react';
import api from '../../api/axios';

const AdminCMS = () => {
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        status: 'published'
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await api.get('/admin/cms/pages');
            setPages(res.data);
            if (res.data.length > 0 && !selectedPage) {
                // Auto select first page
                handleSelectPage(res.data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pages:', error);
            setLoading(false);
        }
    };

    const handleSelectPage = (page) => {
        setSelectedPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            meta_title: page.meta_title || '',
            meta_description: page.meta_description || '',
            status: page.status
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (selectedPage.id) {
                await api.put(`/admin/cms/pages/${selectedPage.id}`, formData);
                alert('Page updated successfully!');
            } else {
                // Handle create logic if we add "New Page" button later
                // For now, we are just editing existing seed pages
            }
            fetchPages();
        } catch (error) {
            alert('Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-105 border border-white/5">
                        <ArrowLeft size={20} className="text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            Content Manager
                        </h1>
                        <p className="text-gray-400 text-sm">Edit legal and informational pages</p>
                    </div>
                </div>

                {/* Placeholder for 'New Page' button if needed */}
            </div>

            {/* Main Master-Detail Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

                {/* Sidebar List */}
                <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider flex items-center gap-2">
                            <FileText size={16} className="text-purple-400" />
                            Pages
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => handleSelectPage(page)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${selectedPage?.id === page.id
                                    ? 'bg-purple-600/20 border border-purple-500/30 text-white shadow-lg'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <div className="truncate pr-2">
                                    <div className="font-semibold text-sm truncate">{page.title}</div>
                                    <div className="text-[10px] opacity-60 font-mono truncate">/{page.slug}</div>
                                </div>
                                {selectedPage?.id === page.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                    {selectedPage ? (
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-xs font-mono border border-purple-500/20">
                                        {formData.slug}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider font-bold ${formData.status === 'published' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                        }`}>
                                        {formData.status}
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>

                            {/* Scrollable Form Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Page Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-bold"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Title (SEO)</label>
                                        <input
                                            type="text"
                                            name="meta_title"
                                            className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                            value={formData.meta_title}
                                            onChange={handleChange}
                                            placeholder="Page Title - Hishab Kitab"
                                        />
                                    </div>
                                </div>

                                {/* Conditional Editor: About Us uses granular fields, others use Rich Text/HTML */}
                                {/* Conditional Editor: About Us uses granular fields, others use Rich Text/HTML */}
                                {formData.slug === 'about-us' ? (
                                    <div className="space-y-6">
                                        {(() => {
                                            const getParsedContent = () => {
                                                try {
                                                    return formData.content ? JSON.parse(formData.content) : {};
                                                } catch (e) {
                                                    return { company_description: formData.content };
                                                }
                                            };
                                            const parsedContent = getParsedContent();

                                            return (
                                                <>
                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">App Header</h4>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Slogan / Tagline</label>
                                                                <input
                                                                    type="text"
                                                                    value={parsedContent.slogan || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, slogan: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                                                    placeholder="Simplify your business"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Developer Info</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={parsedContent.company_name || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, company_name: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Developer Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={parsedContent.developer_name || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, developer_name: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                                                <textarea
                                                                    rows="3"
                                                                    value={parsedContent.company_description || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, company_description: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm resize-none"
                                                                ></textarea>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Contact Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                                                                <input
                                                                    type="text"
                                                                    value={parsedContent.phone || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, phone: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                                                <input
                                                                    type="text"
                                                                    value={parsedContent.email || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, email: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                                                                <input
                                                                    type="text"
                                                                    value={parsedContent.website || ''}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, content: JSON.stringify({ ...parsedContent, website: e.target.value }) });
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="h-[400px] flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Content (HTML Supported)</label>
                                            <div className="flex gap-2">
                                                <button type="button" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-not-allowed opacity-50"><Code size={12} /> Editor Mode</button>
                                            </div>
                                        </div>
                                        <div className="relative flex-1 group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                            <textarea
                                                name="content"
                                                className="w-full h-full bg-slate-950/50 border border-white/10 text-gray-300 rounded-xl p-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm leading-relaxed resize-none scrollbar-thin scrollbar-thumb-white/10"
                                                value={formData.content}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                        <p className="text-[10px] text-gray-600 mt-2 text-right">Supports basic HTML tags: &lt;h1&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Description</label>
                                    <textarea
                                        name="meta_description"
                                        rows="2"
                                        className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none text-sm"
                                        value={formData.meta_description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                                <Layout size={40} className="opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">No Page Selected</h3>
                            <p className="text-sm">Select a page from the sidebar to start editing</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default AdminCMS;
