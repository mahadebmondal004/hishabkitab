import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

import { Plus, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import AnnouncementBanner from '../components/AnnouncementBanner';

const Home = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);

    // SEO Optimization
    useSEO({
        title: 'Home - Customer Management',
        description: 'Manage your customers, track payments, create invoices and bills. Free business accounting software for small businesses in India.',
        keywords: 'customer management, khata book, udhar book, customer ledger, payment tracking'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            // Check if user needs verification
            // Condition: user exists, and is_email_verified is falsy
            // Note: If user has no email, maybe we shouldn't pester them? Or we should pester them to ADD email?
            // "Verify karne ke liye" implies they have one. 
            // If they have email but not verified:
            if (user.email && (!user.is_email_verified || user.is_email_verified === 0)) {
                const timer = setTimeout(() => {
                    setShowVerifyPopup(true);
                    // Auto hide after 8 seconds
                    setTimeout(() => setShowVerifyPopup(false), 8000);
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalReceive = customers.reduce((acc, c) => acc + (parseFloat(c.balance) > 0 ? parseFloat(c.balance) : 0), 0);
    const totalPay = customers.reduce((acc, c) => acc + (parseFloat(c.balance) < 0 ? Math.abs(parseFloat(c.balance)) : 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            {/* Header Section with Blue Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-sm">
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight">Hishab Kitab</h1>
                            <p className="text-blue-100 text-xs font-light">Manage your business</p>
                        </div>
                    </div>
                    <Link to="/profile" className={`bg-white/20 backdrop-blur-sm rounded-2xl cursor-pointer hover:bg-white/30 transition-all duration-300 w-12 h-12 flex items-center justify-center border border-white/10 ${user?.profile_picture ? 'p-0.5' : ''}`}>
                        {user?.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <User size={22} className="text-white/80" />
                        )}
                    </Link>
                </div>

                {/* Email Verification Popup (Absolute) */}
                {showVerifyPopup && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] z-50 animate-bounce-in">
                        <div className="bg-orange-500/90 backdrop-blur-md text-white p-3 rounded-xl shadow-lg border border-orange-400/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Action Required</h4>
                                    <p className="text-[10px] text-orange-100 leading-tight">Please verify your email address.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to="/profile" className="bg-white text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50">
                                    Verify
                                </Link>
                                <button onClick={() => setShowVerifyPopup(false)} className="p-1 hover:bg-white/20 rounded-full">
                                    <span className="sr-only">Close</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Announcements */}
                <div className="relative z-10 mt-4">
                    <AnnouncementBanner />
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">You Will Give</p>
                        <p className="text-2xl font-bold tracking-tight text-red-300">₹{totalPay.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">You Will Get</p>
                        <p className="text-2xl font-bold tracking-tight text-green-300">₹{totalReceive.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 -mt-7 relative z-20">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 flex items-center gap-3 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <Search className="text-blue-500 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search Customer..."
                        className="flex-1 bg-transparent py-3 pr-4 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-light"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Customer List */}
            <div className="px-6 mt-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="dark:text-gray-500 font-light text-lg">No customers found</p>
                        <button className="mt-4 text-blue-500 text-sm font-medium">Add a new customer</button>
                    </div>
                ) : (
                    filteredCustomers.map((customer, index) => (
                        <Link
                            to={`/customer/${customer.id}`}
                            key={customer.id}
                            className="block animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="card-3d p-5 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm transition-transform group-hover:scale-110 ${index % 3 === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                        index % 3 === 1 ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                            'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                        }`}>
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg leading-tight">{customer.name}</h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-1">
                                            {customer.last_entry_date ? new Date(customer.last_entry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No entries'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg tracking-tight ${parseFloat(customer.balance) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                        ₹{Math.abs(customer.balance).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-wider">
                                        {parseFloat(customer.balance) >= 0 ? 'You Get' : 'You Give'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] pointer-events-none z-30 h-screen">
                <Link to="/add-customer" className="absolute bottom-24 right-6 pointer-events-auto bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/40 active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <Plus size={28} />
                </Link>
            </div>


        </div>
    );
};

export default Home;
