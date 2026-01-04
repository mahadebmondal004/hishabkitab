import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [pageContent, setPageContent] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await api.get('/admin/cms/pages/privacy-policy');
                setPageContent(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPage();
    }, []);

    const content = pageContent?.content || '<p>Loading privacy policy...</p>';
    const lastUpdated = pageContent?.updated_at ? new Date(pageContent.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2025';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 p-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Privacy Policy</h1>
                        <p className="text-blue-100 text-xs">How we handle your data</p>
                    </div>
                </div>
            </div>

            <div className="p-6 -mt-6 relative z-20">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-6">
                    <div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <Shield size={24} />
                        </div>
                        {pageContent ? (
                            <div
                                className="prose dark:prose-invert max-w-none text-sm text-gray-500 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] text-gray-400 text-center">Last updated: {lastUpdated}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
