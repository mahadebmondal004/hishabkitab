import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Filter, Download, ArrowUpRight, ArrowDownLeft, Image, Trash2, Calendar, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryLedger = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCategoryEntries();
    }, [categoryName]);

    const fetchCategoryEntries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cashbook');
            const allEntries = res.data.entries;
            const catEntries = allEntries.filter(e => e.category === categoryName);
            setEntries(catEntries);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Derived stats from filtered entries
    const filteredEntries = React.useMemo(() => {
        return entries.filter(entry => {
            if (!startDate && !endDate) return true;
            const entryDate = new Date(entry.entry_date).toISOString().split('T')[0];
            if (startDate && entryDate < startDate) return false;
            if (endDate && entryDate > endDate) return false;
            return true;
        });
    }, [endDate, entries, startDate]);

    const stats = React.useMemo(() => {
        let totalIn = 0;
        let totalOut = 0;
        let online = 0;
        let cash = 0;

        filteredEntries.forEach(entry => {
            const amount = parseFloat(entry.amount);
            if (entry.entry_type === 'IN') {
                totalIn += amount;
            } else {
                totalOut += amount;
            }

            if (entry.payment_mode === 'ONLINE') {
                online += (entry.entry_type === 'IN' ? amount : -amount);
            } else {
                cash += (entry.entry_type === 'IN' ? amount : -amount);
            }
        });

        return {
            totalIn,
            totalOut,
            balance: totalIn - totalOut,
            online,
            cash
        };
    }, [filteredEntries]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(categoryName, 14, 20);
        doc.setFontSize(12);
        doc.text(`Ledger Report`, 14, 28);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

        const tableColumn = ["Date", "Description", "Mode", "Amount (Rs)"];
        const tableRows = [];

        filteredEntries.forEach(entry => {
            const date = new Date(entry.entry_date).toLocaleDateString();
            const desc = entry.category || '-';
            const mode = entry.payment_mode || 'CASH';
            const amount = entry.entry_type === 'IN' ? `+ ${entry.amount}` : `- ${entry.amount}`;
            tableRows.push([date, desc, mode, amount]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
        });

        doc.save(`${categoryName}_Ledger.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 pb-20 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden z-10 transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="px-4 py-4 pt-6 flex items-center justify-between sticky top-0 z-50">
                    <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition shadow-sm border border-white/10">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-full backdrop-blur-md transition shadow-md border ${showFilters ? 'bg-white text-indigo-600 border-white' : 'bg-white/10 text-white hover:bg-white/20 border-white/10'}`}>
                            <Filter size={20} />
                        </button>
                        <button onClick={handleDownloadPDF} className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition shadow-md border border-white/10">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                <div className="px-6 mt-2 mb-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{categoryName}</h1>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                        <Wallet size={14} className="text-indigo-200" />
                        <span className="text-sm font-medium text-indigo-50">Ledger History</span>
                    </div>
                </div>
            </div>

            {/* Main Content Overlap */}
            <div className="px-5 -mt-16 relative z-20 space-y-5">

                {/* Balance Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 text-center animate-fade-in-up">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Net Balance</p>
                    <h2 className={clsx("text-4xl font-black tracking-tight mb-1", stats.balance >= 0 ? "text-green-500" : "text-red-500")}>
                        {stats.balance >= 0 ? '+' : ''}₹{Math.abs(stats.balance).toLocaleString()}
                    </h2>
                    <div className="flex justify-center gap-4 mt-2">
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md font-bold">
                            Cash: {stats.cash >= 0 ? '+' : ''}{stats.cash}
                        </span>
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold">
                            Online: {stats.online >= 0 ? '+' : ''}{stats.online}
                        </span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Income</p>
                            <p className="text-xl font-bold text-green-500">+₹{stats.totalIn.toLocaleString()}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Expense</p>
                            <p className="text-xl font-bold text-red-500">-₹{stats.totalOut.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex gap-3">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block"><Calendar size={10} className="inline mr-1" /> Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 block"><Calendar size={10} className="inline mr-1" /> End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entries List */}
                <div>
                    <div className="flex justify-between items-center mb-3 px-2">
                        <h3 className="font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest">Transaction History</h3>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : filteredEntries.length === 0 ? (
                            <div className="text-center py-12 opacity-50 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No transactions found</p>
                            </div>
                        ) : (
                            filteredEntries.map((entry, index) => (
                                <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center animate-fade-in-up group active:scale-[0.99] transition-transform" style={{ animationDelay: `${index * 30}ms` }}>

                                    <div className="flex gap-4 items-center">
                                        <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0",
                                            entry.entry_type === 'IN' ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                        )}>
                                            {entry.entry_type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide", entry.payment_mode === 'ONLINE' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300")}>
                                                    {entry.payment_mode}
                                                </span>
                                                {entry.attachment_url && <Image size={12} className="text-gray-400" />}
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(entry.entry_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 dark:text-white font-bold text-sm line-clamp-1">{entry.entry_type === 'IN' ? 'Income' : 'Expense'}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={clsx("text-lg font-black tracking-tight", entry.entry_type === 'IN' ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                                            {entry.entry_type === 'IN' ? '+' : '-'}₹{parseFloat(entry.amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex gap-4 transition-colors duration-200 z-40 pb-6">
                <Link
                    to={`/cashbook/add?type=OUT&cat=${encodeURIComponent(categoryName)}`}
                    className="flex-1 bg-gradient-to-br from-red-500 to-orange-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-500/30 active:scale-95 transition hover:shadow-xl hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-1"><ArrowUpRight size={18} /> Expense</div>
                    <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">Add Spending</span>
                </Link>
                <Link
                    to={`/cashbook/add?type=IN&cat=${encodeURIComponent(categoryName)}`}
                    className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-600/30 active:scale-95 transition hover:shadow-xl hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-1"><ArrowDownLeft size={18} /> Income</div>
                    <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">Add Money</span>
                </Link>
            </div>
        </div>
    );
};

export default CategoryLedger;
