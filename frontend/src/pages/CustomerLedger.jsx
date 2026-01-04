import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Phone, Share2, ArrowDownLeft, ArrowUpRight, Calendar, Filter, Download } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const CustomerLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [cusRes, entRes] = await Promise.all([
                api.get(`/customers/${id}`),
                api.get(`/customers/${id}/entries`)
            ]);
            setCustomer(cusRes.data);
            setEntries(entRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const shareReport = () => {
        if (!customer) return;
        const text = `Hishab Kitab Report for ${customer.name}:%0ACurrent Balance: ₹${customer.balance}`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const formattedBalance = customer ? Math.abs(parseFloat(customer.balance)) : 0;
    const isPositive = customer ? parseFloat(customer.balance) >= 0 : true;

    // Date Filter Logic
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filteredEntries = entries.filter(entry => {
        if (!startDate && !endDate) return true;
        const entryDate = new Date(entry.entry_date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        return entryDate >= start && entryDate <= end;
    });

    const totalDebit = filteredEntries
        .filter(e => e.entry_type === 'DEBIT')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalCredit = filteredEntries
        .filter(e => e.entry_type === 'CREDIT')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header / Top Section */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 pb-20 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Navbar */}
                <div className="px-4 py-4 pt-6 flex items-center justify-between sticky top-0 z-50">
                    <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition shadow-sm">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-full backdrop-blur-md transition shadow-sm ${showFilters ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                            <Calendar size={20} />
                        </button>
                        <button onClick={shareReport} className="bg-green-500/80 backdrop-blur-md p-2 rounded-full text-white hover:bg-green-500 transition shadow-sm border border-green-400/30">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Customer Details Header */}
                <div className="px-6 mt-2 mb-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-1">{customer?.name || 'Loading...'}</h1>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                        <Phone size={14} className="text-blue-200" />
                        <span className="text-sm font-medium text-blue-50">{customer?.mobile || 'No Mobile'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Areas - Overlapping Header */}
            <div className="px-5 -mt-16 relative z-20 space-y-5">

                {/* Balance Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 text-center animate-fade-in-up">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Net Balance</p>
                    <h2 className={clsx("text-4xl font-black tracking-tight mb-2", isPositive ? "text-green-500" : "text-red-500")}>
                        ₹{formattedBalance.toLocaleString()}
                    </h2>
                    <p className={clsx("text-sm font-bold inline-block px-3 py-1 rounded-full", isPositive ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
                        {isPositive ? "You will Get" : "You will Give"}
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Debit</p>
                            <p className="text-xl font-bold text-red-500">₹{totalDebit.toLocaleString()}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Credit</p>
                            <p className="text-xl font-bold text-green-500">₹{totalCredit.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Entries List */}
                <div>
                    <div className="flex justify-between items-center mb-3 px-2">
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest">Transactions</h3>
                        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">{filteredEntries.length} Records</span>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : filteredEntries.length === 0 ? (
                            <div className="text-center py-10 opacity-50 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions found</p>
                            </div>
                        ) : (
                            filteredEntries.map((entry, index) => (
                                <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-400 mb-0.5 flex items-center gap-2">
                                            {new Date(entry.entry_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            {new Date(entry.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-gray-800 dark:text-white font-medium line-clamp-1">{entry.note || 'No description'}</p>
                                    </div>
                                    <div className="text-right pl-4">
                                        <p className={clsx("text-lg font-bold", entry.entry_type === 'CREDIT' ? "text-green-600" : "text-red-500")}>
                                            {entry.entry_type === 'CREDIT' ? '+' : '-'}₹{Math.abs(entry.amount).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            {entry.entry_type === 'CREDIT' ? 'You Got' : 'You Que'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Floating Actions */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex gap-4 transition-colors duration-200 z-40 pb-6">
                <Link
                    to={`/customer/${id}/add-entry?type=DEBIT`}
                    className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-500/30 active:scale-95 transition hover:bg-red-600 border border-transparent"
                >
                    <div className="flex items-center gap-1"><ArrowUpRight size={18} /> Gave</div>
                    <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">Udhar Diya</span>
                </Link>
                <Link
                    to={`/customer/${id}/add-entry?type=CREDIT`}
                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-600/30 active:scale-95 transition hover:bg-green-700 border border-transparent"
                >
                    <div className="flex items-center gap-1"><ArrowDownLeft size={18} /> Got</div>
                    <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">Jama Hua</span>
                </Link>
            </div>
        </div>
    );
};

export default CustomerLedger;
