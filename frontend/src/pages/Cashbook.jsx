import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

import { ArrowUpRight, ArrowDownLeft, Wallet, Search, Plus, CreditCard, Banknote } from 'lucide-react';
import clsx from 'clsx';

const Cashbook = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState({ totalBalance: 0, todaysBalance: 0, onlineBalance: 0, cashBalance: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await api.get('/cashbook');
            setCategories(res.data.categories);
            setSummary(res.data.summary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await api.post('/cashbook/categories', {
                name: newCategoryName,
                type: 'BOTH'
            });
            setShowAddCategory(false);
            setNewCategoryName('');
            fetchEntries(); // Refresh list
        } catch (error) {
            alert('Error creating category');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header Section with Blue Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-sm">
                        <Wallet size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Hishab Kitab</h1>
                        <p className="text-blue-100 text-xs font-light">Manage your daily expenses</p>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    {/* Total Balance Layout */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Total Balance</p>
                            <h2 className={`text-xl font-bold tracking-tight mb-3 ${summary.totalBalance >= 0 ? 'text-white' : 'text-red-200'}`}>
                                {summary.totalBalance >= 0 ? '+' : ''}₹{Math.abs(summary.totalBalance).toLocaleString()}
                            </h2>
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs text-blue-50">
                                <span className="flex items-center gap-1 opacity-80"><CreditCard size={10} /> Online</span>
                                <span className="font-semibold">₹{summary.onlineBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-blue-50">
                                <span className="flex items-center gap-1 opacity-80"><Banknote size={10} /> Cash</span>
                                <span className="font-semibold">₹{summary.cashBalance.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Today's Balance Layout */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Today</p>
                            <h2 className={`text-xl font-bold tracking-tight mb-3 ${summary.todaysBalance >= 0 ? 'text-white' : 'text-red-200'}`}>
                                {summary.todaysBalance >= 0 ? '+' : ''}₹{Math.abs(summary.todaysBalance).toLocaleString()}
                            </h2>
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs text-blue-50">
                                <span className="flex items-center gap-1 opacity-80"><CreditCard size={10} /> Online</span>
                                <span className="font-semibold">₹{(summary.todaysOnlineBalance || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-blue-50">
                                <span className="flex items-center gap-1 opacity-80"><Banknote size={10} /> Cash</span>
                                <span className="font-semibold">₹{(summary.todaysCashBalance || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 -mt-7 relative z-20">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 flex items-center gap-3 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <Search className="text-blue-500 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search Expenses / Income..."
                        className="flex-1 bg-transparent py-3 pr-4 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-6 mt-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="dark:text-gray-500 font-light text-lg">No records found. Add a category to start.</p>
                    </div>
                ) : (
                    filteredCategories.map((cat, index) => {
                        const isPositive = cat.balance >= 0;
                        return (
                            <div
                                key={index}
                                className="card-3d p-5 flex justify-between items-center group cursor-pointer hover:border-blue-500/30 transition-colors animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => navigate(`/cashbook/ledger/${cat.name}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm transition-transform group-hover:scale-110 ${index % 3 === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                        index % 3 === 1 ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' :
                                            'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                                        }`}>
                                        {cat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg leading-tight">{cat.name}</h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-1">
                                            {new Date(cat.last_entry_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {cat.entries_count} Entries
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={clsx("font-bold text-lg tracking-tight", isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                                        ₹{Math.abs(cat.balance).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-wider">
                                        {isPositive ? 'Net Income' : 'Net Expense'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Add Category Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] pointer-events-none z-30 h-screen">
                <button
                    onClick={() => setShowAddCategory(true)}
                    className="absolute bottom-24 right-6 pointer-events-auto bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/40 active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in-up border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-6 dark:text-white tracking-tight">Create New Head</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Category Name (e.g. Salary, Rent)"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 mb-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white font-light transition-all"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowAddCategory(false)}
                                className="flex-1 py-3.5 text-gray-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Cashbook;
