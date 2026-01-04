import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, IndianRupee, Calendar, Type, Paperclip, X, Plus, Banknote, CreditCard, History, Save, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const AddCashbookEntry = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') || 'OUT';

    const [formData, setFormData] = useState({
        amount: '',
        entry_type: initialType,
        category: searchParams.get('cat') || '',
        entry_date: new Date().toISOString().slice(0, 16),
        payment_mode: 'CASH'
    });
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    // Category management
    const [categories, setCategories] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/cashbook/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await api.post('/cashbook/categories', {
                name: newCategoryName,
                type: 'BOTH'
            });
            setCategories([...categories, res.data]);
            setFormData({ ...formData, category: res.data.name });
            setShowAddCategory(false);
            setNewCategoryName('');
        } catch (error) {
            alert('Error creating category');
        }
    };
    const isIncome = formData.entry_type === 'IN';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('amount', formData.amount);
        data.append('entry_type', formData.entry_type);
        data.append('category', formData.category);
        data.append('entry_date', formData.entry_date);
        data.append('payment_mode', formData.payment_mode);
        if (attachment) {
            data.append('attachment', attachment);
        }

        try {
            await api.post('/cashbook', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/cashbook');
        } catch (error) {
            alert('Failed to add entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={clsx("min-h-screen transition-colors duration-300 relative", isIncome ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20")}>

            {/* Category Modal (Improved) */}
            <AnimatePresence>
                {showAddCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-6 dark:text-white">Add New Category</h3>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Category Name (e.g. Salary, Rent)"
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 mb-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all font-medium"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowAddCategory(false)}
                                    className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCategory}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dynamic Header */}
            <div className={clsx("p-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden transition-all duration-500", isIncome ? "bg-gradient-to-br from-green-500 to-emerald-700" : "bg-gradient-to-br from-red-500 to-orange-700")}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10 mb-8">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition shadow-sm backdrop-blur-md">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-bold text-xl tracking-tight">
                            {isIncome ? 'Cash In (Income)' : 'Cash Out (Expense)'}
                        </h1>
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider opacity-80">
                            {isIncome ? 'Add Money' : 'Spend Money'}
                        </p>
                    </div>
                    {formData.category && (
                        <button
                            onClick={() => navigate(`/cashbook/ledger/${encodeURIComponent(formData.category)}`)}
                            className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition text-xs font-bold backdrop-blur-md border border-white/10"
                        >
                            <History size={14} />
                            History
                        </button>
                    )}
                </div>

                {/* Floating Type Toggle */}
                <div className="flex bg-black/20 p-1.5 rounded-2xl relative z-10 backdrop-blur-md border border-white/10 mx-auto max-w-sm">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, entry_type: 'OUT' })}
                        className={clsx(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                            !isIncome ? "bg-white text-red-600 shadow-lg scale-100" : "text-white/70 hover:bg-white/10 scale-95"
                        )}
                    >
                        OUT (Expense)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, entry_type: 'IN' })}
                        className={clsx(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                            isIncome ? "bg-white text-green-600 shadow-lg scale-100" : "text-white/70 hover:bg-white/10 scale-95"
                        )}
                    >
                        IN (Income)
                    </button>
                </div>
            </div>

            <div className="p-6 -mt-4 relative z-20 max-w-sm mx-auto">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Amount Input */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-white dark:border-gray-700 relative overflow-hidden">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Amount</label>
                        <div className="flex items-center gap-2 relative z-10">
                            <IndianRupee size={32} strokeWidth={2.5} className={isIncome ? "text-green-500" : "text-red-500"} />
                            <input
                                type="number"
                                placeholder="0"
                                className={clsx(
                                    "w-full text-5xl font-black outline-none bg-transparent transition-colors",
                                    isIncome ? "text-green-600 dark:text-green-400 placeholder-green-100 dark:placeholder-green-900/30" : "text-red-500 dark:text-red-400 placeholder-red-100 dark:placeholder-red-900/30"
                                )}
                                autoFocus
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className={clsx("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200", formData.payment_mode === 'CASH' ? "bg-white dark:bg-gray-800 border-gray-800 dark:border-white shadow-md scale-[1.02]" : "bg-white dark:bg-gray-800 border-transparent shadow-sm grayscale opacity-70")}>
                            <input
                                type="radio"
                                name="mode"
                                className="hidden"
                                checked={formData.payment_mode === 'CASH'}
                                onChange={() => setFormData({ ...formData, payment_mode: 'CASH' })}
                            />
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <Banknote size={20} className="text-gray-800 dark:text-white" />
                            </div>
                            <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Cash</span>
                        </label>
                        <label className={clsx("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200", formData.payment_mode === 'ONLINE' ? "bg-white dark:bg-gray-800 border-blue-600 shadow-md scale-[1.02]" : "bg-white dark:bg-gray-800 border-transparent shadow-sm grayscale opacity-70")}>
                            <input
                                type="radio"
                                name="mode"
                                className="hidden"
                                checked={formData.payment_mode === 'ONLINE'}
                                onChange={() => setFormData({ ...formData, payment_mode: 'ONLINE' })}
                            />
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Online</span>
                        </label>
                    </div>

                    {/* Details Inputs */}
                    <div className="space-y-4">
                        {/* Category */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-white transition-colors">
                                <Type size={20} />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Category (e.g. Rent, Salary)"
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-medium transition-all shadow-sm"
                                    value={formData.category}
                                    disabled={!!searchParams.get('cat')}
                                    onChange={(e) => {
                                        setFormData({ ...formData, category: e.target.value });
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => !searchParams.get('cat') && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && !searchParams.get('cat') && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-40 animate-in fade-in zoom-in-95 duration-200">
                                        {categories
                                            .filter(c => c.name.toLowerCase().includes(formData.category.toLowerCase()))
                                            .map(cat => (
                                                <div
                                                    key={cat.id}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                                    onClick={() => setFormData({ ...formData, category: cat.name })}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))
                                        }
                                        <div
                                            className="p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-bold text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 flex items-center gap-2 sticky bottom-0"
                                            onClick={() => setShowAddCategory(true)}
                                        >
                                            <Plus size={16} /> Add New Category
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-white transition-colors">
                                <Calendar size={20} />
                            </div>
                            <input
                                type="datetime-local"
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-medium transition-all shadow-sm text-gray-600"
                                value={formData.entry_date}
                                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                            />
                        </div>


                        {/* File Upload */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group cursor-pointer shadow-sm">
                            {!previewUrl ? (
                                <label className="flex flex-col items-center justify-center gap-2 w-full cursor-pointer py-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                        <Paperclip size={24} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Attach Receipt</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            ) : (
                                <div className="relative group/image">
                                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl shadow-sm" />
                                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <label className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 cursor-pointer transition">
                                            <Paperclip size={20} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setAttachment(null); setPreviewUrl(null); }}
                                            className="p-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "w-full py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3 text-white disabled:opacity-70 disabled:shadow-none",
                            isIncome ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30" : "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-red-500/30"
                        )}
                    >
                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Save Transaction</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCashbookEntry;
