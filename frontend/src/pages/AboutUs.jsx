import React, { useState } from 'react';
import { ArrowLeft, Globe, Mail, Phone, MapPin, Shield, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const AboutUs = () => {
    const navigate = useNavigate();
    const [pageContent, setPageContent] = useState(null);
    const [siteSettings, setSiteSettings] = useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [pageRes, settingsRes] = await Promise.all([
                    api.get('/admin/cms/pages/about-us').catch(() => ({ data: { content: 'About us content not found.' } })),
                    api.get('/admin/cms/seo').catch(() => ({ data: {} }))
                ]);
                setPageContent(pageRes.data);
                setSiteSettings(settingsRes.data);
            } catch (error) {
                console.error('Failed to fetch about us data', error);
            }
        };
        fetchData();
    }, []);

    const appName = siteSettings?.site_title || 'Hishab Kitab';
    const logoUrl = siteSettings?.og_image;

    // Parse dynamic content (JSON from AdminCMS)
    let aboutData = {};
    try {
        aboutData = pageContent?.content ? JSON.parse(pageContent.content) : {};
        // If it was just a string (legacy/initial), JSON.parse might work if it was "string" or fail if it was proper HTML text not quoted.
        // Actually, initial seed data was HTML. JSON.parse('<p>...') throws.
    } catch (e) {
        // Fallback: If content is simple string/HTML (legacy)
        aboutData = { company_description: pageContent?.content };
    }

    const slogan = aboutData.slogan || 'Simplify your business';
    const companyName = aboutData.company_name || 'Hival IT Solutions';
    const developerName = aboutData.developer_name || 'Mahadev';
    const description = aboutData.company_description || 'Hishab Kitab is designed to make daily business accounting simple and efficient.';
    const PhoneVal = aboutData.phone || '9999999999';
    const EmailVal = aboutData.email || 'support@hishabkitab.com';
    const WebsiteVal = aboutData.website || 'www.hivalitsolutions.com';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 p-6 pt-5 pb-20 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10 mb-6">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">About Us</h1>
                        <p className="text-cyan-100 text-xs">Who we are</p>
                    </div>
                </div>

                <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 shadow-lg overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <img src="/flash.png" alt="Logo" className="w-full h-full object-contain p-2" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{appName}</h2>
                    <p className="text-cyan-100 font-medium">{slogan}</p>
                    <p className="text-[10px] text-white/60 mt-2 font-mono">v8.40.1</p>
                </div>
            </div>

            <div className="p-6 -mt-10 relative z-20 space-y-6">

                {/* Company Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Developed By</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <img src="/profile.jpg" alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-lg">{companyName}</h4>
                            <p className="text-xs text-blue-500 font-bold">{developerName}</p>
                        </div>
                    </div>
                    {/* Render HTML description safely */}
                    <div
                        className="prose dark:prose-invert max-w-none text-sm text-gray-500 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Contact</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{PhoneVal}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{EmailVal}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Website</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{WebsiteVal}</p>
                        </div>
                    </div>
                </div>

                {/* Legal Links */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Legal</h3>
                    <Link to="/privacy" className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition">
                        <Shield size={20} className="text-gray-400" />
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Privacy Policy</span>
                    </Link>
                    <Link to="/terms" className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition">
                        <FileText size={20} className="text-gray-400" />
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Terms & Conditions</span>
                    </Link>
                </div>

                <div className="text-center text-[10px] text-gray-400 pt-6 pb-2">
                    © 2024 Hival IT Solutions. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
