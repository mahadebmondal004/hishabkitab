import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Database, Ticket, FileText, Globe,
    LogOut, Menu, X, ChevronRight, Shield, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => {
    return (
        <Link
            to={path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-3 font-medium">
                <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                {label}
            </span>
            {active && <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 relative z-10" />}
        </Link>
    );
};

const AdminLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Database, label: 'Customers', path: '/admin/dashboard?tab=customers' }, // Using query param for tab switching capability if needed, or just link to dashboard
        { icon: Ticket, label: 'Support Tickets', path: '/admin/tickets' },
        { icon: FileText, label: 'CMS Content', path: '/admin/cms' },
        { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
        { icon: Globe, label: 'SEO Settings', path: '/admin/seo' },
    ];

    // Helper to determine active state
    const isActive = (path) => {
        if (path.includes('?')) {
            // Specialized check for query params if ever needed, simplified here
            return location.pathname + location.search === path;
        }
        return location.pathname === path;
    };

    // Simplified active check for style (ignoring query for main dashboard link)
    const isTabActive = (itemPath) => {
        if (itemPath === '/admin/dashboard' && location.pathname === '/admin/dashboard' && !location.search.includes('tab=')) return true;
        if (itemPath === '/admin/users' && location.pathname === '/admin/users') return true;
        if (itemPath.includes('tab=customers') && location.search.includes('tab=customers')) return true;
        if (itemPath === '/admin/tickets' && location.pathname.startsWith('/admin/tickets')) return true;
        if (itemPath === '/admin/cms' && location.pathname.startsWith('/admin/cms')) return true;
        if (itemPath === '/admin/announcements' && location.pathname.startsWith('/admin/announcements')) return true;
        if (itemPath === '/admin/seo' && location.pathname.startsWith('/admin/seo')) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Brand */}
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Shield size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
                        <p className="text-xs text-slate-400 font-medium">Hishab Kitab v2.0</p>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden ml-auto text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Menu</p>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={isTabActive(item.path)}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Logout</span>
                    </button>
                    <div className="text-center mt-4 mb-2">
                        <span className="text-[10px] text-slate-600">© 2026 Codteg</span>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                            <Shield size={16} fill="currentColor" />
                        </div>
                        <span className="font-bold">Admin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white bg-white/5 rounded-lg">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
