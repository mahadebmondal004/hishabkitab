import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    LayoutGrid, Receipt, Package, Users, Calendar, Settings,
    HelpCircle, Info, Share2, ChevronRight, User, Camera, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const More = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
        }
    }, [user?.id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/auth/profile/${user.id}`);
            const data = res.data;
            setProfileData(data);
            calculateStrength(data);
        } catch (error) {
            console.error(error);
        }
    };

    const calculateStrength = (data) => {
        const fields = ['name', 'mobile', 'business_name', 'email', 'business_address', 'business_category', 'business_type', 'gstin', 'bank_account_number'];
        let filled = 0;
        fields.forEach(f => {
            if (data[f]) filled++;
        });
        setStrength(Math.round((filled / fields.length) * 100));
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    const quickActions = [
        { icon: LayoutGrid, label: "Summary", path: "/summary", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Receipt, label: "Bills", path: "/bills", color: "text-red-500", bg: "bg-red-50" },
        { icon: Package, label: "Items", path: "/items", color: "text-purple-500", bg: "bg-purple-50" },
        { icon: Users, label: "Staff", path: "/staff", color: "text-yellow-600", bg: "bg-yellow-50" },
        { icon: Calendar, label: "Collection", path: "/collection", color: "text-orange-500", bg: "bg-orange-50" },
        { icon: Settings, label: "Setting", path: "/settings", color: "text-pink-500", bg: "bg-pink-50" },
    ];

    const strengthLabel = strength < 40 ? 'Weak' : strength < 80 ? 'Good' : 'Excellent';
    const strengthColor = strength < 40 ? 'text-red-200' : strength < 80 ? 'text-yellow-200' : 'text-green-200';
    const strengthBarColor = strength < 40 ? 'bg-red-400' : strength < 80 ? 'bg-yellow-400' : 'bg-green-400';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            {/* Header Section with Blue Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="px-6 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/profile" className="flex items-center gap-4 flex-1 group">
                            <div className="relative">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    {profileData?.profile_picture ? (
                                        <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-white font-bold text-xl">
                                            {profileData?.name ? profileData.name.charAt(0).toUpperCase() : <User size={28} />}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-white text-blue-600 p-1.5 rounded-full shadow-md">
                                    <Camera size={12} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">{profileData?.business_name || "My Business"}</h2>
                                <p className="text-blue-100 text-sm font-medium">{profileData?.name || "Owner Name"}</p>
                            </div>
                        </Link>
                        <Link to="/profile" className="px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold transition-all">
                            Edit
                        </Link>
                    </div>

                    {/* Profile Strength */}
                    <Link to="/profile" className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl block hover:bg-white/10 transition-colors">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-white/90">Profile strength: <span className={strengthColor}>{strengthLabel}</span></span>
                            <span className={strengthColor}>{strength}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div className={`h-full ${strengthBarColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${strength}%` }}></div>
                        </div>
                        <div className="mt-2 text-[10px] text-white/80 text-center font-medium">
                            Complete your profile to unlock all features
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="p-4 mt-2 relative z-20">
                <div className="grid grid-cols-3 gap-3">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.path}
                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:border-blue-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 ${action.bg} rounded-full flex items-center justify-center shadow-inner`}>
                                <action.icon size={22} className={action.color} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* List Menu Items */}
            <div className="px-5 space-y-4 mt-2">
                <Link to="/help" className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <HelpCircle size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Help & Support</h4>
                            <p className="text-[10px] text-gray-400">Get help with your queries</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </Link>

                <Link to="/about" className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                            <Info size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">About Us</h4>
                            <p className="text-[10px] text-gray-400">Version 8.40.1</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </Link>

                <button onClick={handleLogout} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                            <LogOut size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Logout</h4>
                            <p className="text-[10px] text-gray-400">Sign out of your account</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </button>
            </div>

            {/* Invite Banner */}
            <div className="p-5">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm">
                        <Share2 size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Grow your network</p>
                        <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            Invite Friends to Hishab Kitab <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default More;
