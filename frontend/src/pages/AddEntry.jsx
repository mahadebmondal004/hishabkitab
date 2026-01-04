import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, IndianRupee, Calendar, Type, CheckCircle, Save } from 'lucide-react';
import clsx from 'clsx';

const AddEntry = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialType = searchParams.get('type') || 'DEBIT';

    const [formData, setFormData] = useState({
        entry_type: initialType,
        amount: '',
        note: '',
        date: new Date().toISOString().slice(0, 16)
    });

    const [loading, setLoading] = useState(false);
    const isCredit = formData.entry_type === 'CREDIT';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/customers/${id}/entries`, formData);
            navigate(`/customer/${id}`);
        } catch (error) {
            alert(error.response?.data?.error || 'Error creating entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={clsx("min-h-screen transition-colors duration-300", isCredit ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20")}>
            {/* Dynamic Header */}
            <div className={clsx("p-6 pt-8 pb-10 rounded-b-[2rem] shadow-xl text-white relative overflow-hidden transition-all duration-300", isCredit ? "bg-gradient-to-br from-green-500 to-emerald-700" : "bg-gradient-to-br from-red-500 to-orange-700")}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-xl tracking-wide">
                            {isCredit ? 'Payment Received' : 'Credit Given'}
                        </h1>
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider opacity-80">
                            {isCredit ? 'Jama (In)' : 'Udhar (Out)'}
                        </p>
                    </div>
                </div>

                {/* Toggle Buttons Floating in Header */}
                <div className="flex bg-black/20 p-1 rounded-2xl mt-8 relative z-10 backdrop-blur-md border border-white/10 mx-auto max-w-sm">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, entry_type: 'DEBIT' })}
                        className={clsx(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                            !isCredit ? "bg-white text-red-600 shadow-lg scale-100" : "text-white/70 hover:bg-white/10 scale-95"
                        )}
                    >
                        Gave (Udhar)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, entry_type: 'CREDIT' })}
                        className={clsx(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                            isCredit ? "bg-white text-green-600 shadow-lg scale-100" : "text-white/70 hover:bg-white/10 scale-95"
                        )}
                    >
                        Got (Jama)
                    </button>
                </div>
            </div>

            <div className="p-6 -mt-2">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">

                    {/* Amount Input */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-700 relative overflow-hidden group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Transaction Amount</label>
                        <div className="flex items-center gap-2 relative z-10">
                            <IndianRupee size={32} strokeWidth={2.5} className={isCredit ? "text-green-500" : "text-red-500"} />
                            <input
                                type="number"
                                placeholder="0"
                                className={clsx(
                                    "w-full text-5xl font-black outline-none bg-transparent transition-colors",
                                    isCredit ? "text-green-600 dark:text-green-400 placeholder-green-100 dark:placeholder-green-900/30" : "text-red-500 dark:text-red-400 placeholder-red-100 dark:placeholder-red-900/30"
                                )}
                                autoFocus
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Note Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-white transition-colors">
                                <Type size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Note (Item name, Bill No...)"
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-medium transition-all shadow-sm"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            />
                        </div>

                        {/* Date Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-white transition-colors">
                                <Calendar size={20} />
                            </div>
                            <input
                                type="datetime-local"
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-medium transition-all shadow-sm text-gray-600"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={clsx(
                            "w-full py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3 text-white disabled:opacity-70 disabled:shadow-none",
                            isCredit ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30" : "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-red-500/30"
                        )}
                    >
                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Save Entry</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEntry;
