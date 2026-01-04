import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, Banknote, X, Receipt, Search } from 'lucide-react';
import api from '../api/axios';

const Collection = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        customer_name: '',
        payment_mode: 'cash',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredCollections(collections);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredCollections(collections.filter(c =>
                String(c.amount).includes(lowerTerm) ||
                (c.customer_name || '').toLowerCase().includes(lowerTerm) ||
                (c.note || '').toLowerCase().includes(lowerTerm)
            ));
        }
    }, [searchTerm, collections]);

    const fetchCollections = async () => {
        try {
            const res = await api.get('/collections');
            setCollections(res.data);
            setFilteredCollections(res.data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/collections', formData);
            fetchCollections();
            setShowModal(false);
            setFormData({
                amount: '',
                customer_name: '',
                payment_mode: 'cash',
                date: new Date().toISOString().split('T')[0],
                note: ''
            });
        } catch (error) {
            alert('Error adding collection');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/collections/${id}`);
            fetchCollections();
        } catch (error) {
            alert('Error deleting collection');
        }
    };

    const totalToday = collections
        .filter(c => new Date(c.date).toDateString() === new Date().toDateString())
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    const totalCollection = collections.reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            {/* Header Section with Teal Gradient (Matching Home Style) */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Daily Collection</h1>
                            <p className="text-teal-100 text-xs text-opacity-80">Track payments & cash</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <p className="text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Total Collection</p>
                        <p className="text-2xl font-bold tracking-tight text-white">₹{totalCollection.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <p className="text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Collected Today</p>
                        <p className="text-2xl font-bold tracking-tight text-emerald-200">₹{totalToday.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-7 relative z-20 space-y-4">
                {/* Search Bar matching Staff.jsx style */}
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 flex items-center gap-3 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <Search className="text-blue-500 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search by amount, name, note..."
                        className="flex-1 bg-transparent py-3 pr-4 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="p-2 mr-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2 mb-2 hidden">Recent Transactions</h2>

                {filteredCollections.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 animate-fade-in-up">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${c.payment_mode === 'cash' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                            {c.payment_mode === 'cash' ? <Banknote size={20} /> : <Receipt size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800 dark:text-white text-lg">₹{Number(c.amount).toLocaleString()}</h3>
                                <span className="text-[10px] text-gray-400 font-mono">{new Date(c.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{c.customer_name || 'Walk-in Customer'}</p>
                            {c.note && <p className="text-xs text-gray-400 mt-0.5 italic">"{c.note}"</p>}
                        </div>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {collections.length > 0 && filteredCollections.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Search size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 dark:text-gray-400">No matching records found.</p>
                        <p className="text-xs text-gray-400">Try adjusting your search terms.</p>
                    </div>
                )}

                {collections.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">No collections recorded.</p>
                        <p className="text-xs text-gray-400">Tap + to add a new transaction.</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] pointer-events-none z-30 h-screen">
                <button
                    onClick={() => setShowModal(true)}
                    className="absolute bottom-6 right-6 pointer-events-auto bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/40 active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Collection</h3>
                            <button onClick={() => setShowModal(false)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-teal-500 dark:text-white text-2xl font-bold text-center"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Customer Name (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-teal-500 dark:text-white"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    placeholder="e.g. Rahul Kumar"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-teal-500 dark:text-white"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Mode</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-teal-500 dark:text-white"
                                        value={formData.payment_mode}
                                        onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online / UPI</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Note</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-teal-500 dark:text-white resize-none"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Add optional note..."
                                    rows="2"
                                />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 active:scale-[0.98] transition-all">
                                Record Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Collection;
