import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Minus, History, Briefcase, Trash2, Edit2 } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: 'IN' }); // 'IN' or 'OUT'
    const [qty, setQty] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setItem(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to load item');
            navigate('/items');
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async () => {
        if (!qty || isNaN(qty) || Number(qty) <= 0) return alert('Enter valid quantity');

        setUpdating(true);
        try {
            const quantity = Number(qty);
            const newStock = modal.type === 'IN'
                ? Number(item.stock) + quantity
                : Number(item.stock) - quantity;

            if (newStock < 0) {
                alert('Stock cannot be negative');
                setUpdating(false);
                return;
            }

            // Update request
            const payload = { ...item, stock: newStock };
            await api.put(`/products/${id}`, payload);

            setItem(payload);
            setModal({ show: false, type: 'IN' });
            setQty('');
            alert(`Stock ${modal.type === 'IN' ? 'Added' : 'Removed'} Successfully!`);
        } catch (error) {
            console.error(error);
            alert('Failed to update stock');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
    if (!item) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className={`pt-6 pb-20 px-6 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden ${item.type === 'PRODUCT' ? 'bg-gradient-to-r from-blue-600 to-red-600' : 'bg-purple-600'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex justify-between items-center relative z-10 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/items')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-bold text-lg">Item Details</h1>
                    </div>
                    <button onClick={() => navigate('/items')} className="text-white/90 text-sm font-bold flex items-center gap-1 hover:text-white transition-opacity">
                        <Edit2 size={16} /> EDIT PRODUCT
                    </button>
                </div>

                <div className="flex items-center gap-4 z-10 relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                        {item.type === 'PRODUCT' ? <Package size={32} /> : <Briefcase size={32} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight">{item.name}</h2>
                        <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase">{item.unit || 'UNIT'}</span>
                            {item.hsn_sac && <span>HSN: {item.hsn_sac}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content info */}
            <div className="px-5 -mt-12 relative z-20 space-y-4 pb-32">

                {/* Details Grid Card */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                    <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                        {/* Row 1 */}
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sale Price</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">₹{item.rate}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700 pl-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Purchase Price</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">₹{item.purchase_rate || '0'}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700 pl-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Stock Quantity</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">{item.stock} <span className="text-xs font-medium text-gray-400">{item.unit}</span></p>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Stock Value</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">₹{(Number(item.stock) * Number(item.rate)).toLocaleString()}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700 pl-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Primary Unit</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">{item.unit}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700 pl-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Low Stock</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">{item.low_stock_alert || '0'} <span className="text-xs font-medium text-gray-400">{item.unit}</span></p>
                        </div>

                        {/* Row 3 */}
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">HSN Code</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">{item.hsn_sac || '-'}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700 pl-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">GST%</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200">{item.tax_rate ? `${item.tax_rate}%` : '-'}</p>
                        </div>
                        <div className="border-l border-gray-100 dark:border-gray-700 pl-3">
                            {/* Empty for layout balance or Secondary Unit if added later */}
                        </div>
                    </div>
                </div>

                {/* Profit Section */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-green-500 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">This Week's Total Profit</h3>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">₹0</p>
                            <p className="text-[10px] text-gray-400 font-medium">Total Profit Amount</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">0</p>
                            <p className="text-[10px] text-gray-400 font-medium">Stocks Sold</p>
                        </div>
                    </div>
                    <button className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-4">
                        VIEW MORE <History size={12} />
                    </button>
                </div>

                {/* Stock History List - Placeholder */}
                <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex justify-between px-2 pt-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stocks</span>
                        <div className="flex gap-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Stock Out</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Stock In</span>
                        </div>
                    </div>

                    {/* Static Opening Balance */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-gray-400 mb-1">{new Date(item.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Opening Balance</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{item.stock}.0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action Buttons */}
            {item.type === 'PRODUCT' && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex gap-4 transition-colors duration-200 z-40 pb-6">
                    <button
                        onClick={() => { setModal({ show: true, type: 'OUT' }); setQty(''); }}
                        className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-500/30 active:scale-95 transition hover:bg-red-600 border border-transparent"
                    >
                        <div className="flex items-center gap-1"><Minus size={18} strokeWidth={3} /> Stock Out</div>
                        <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">Remove Items</span>
                    </button>

                    <button
                        onClick={() => { setModal({ show: true, type: 'IN' }); setQty(''); }}
                        className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-600/30 active:scale-95 transition hover:bg-green-700 border border-transparent"
                    >
                        <div className="flex items-center gap-1"><Plus size={18} strokeWidth={3} /> Stock In</div>
                        <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">Add Items</span>
                    </button>
                </div>
            )}

            {/* Stock Modal */}
            <AnimatePresence>
                {modal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setModal({ ...modal, show: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className={`text-lg font-bold mb-1 ${modal.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                                {modal.type === 'IN' ? 'Add Stock' : 'Remove Stock'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Enter quantity to {modal.type === 'IN' ? 'add to' : 'remove from'} current stock.
                            </p>

                            <input
                                type="number"
                                autoFocus
                                className="w-full text-center text-3xl font-bold py-4 border-b-2 border-gray-200 dark:border-gray-600 outline-none bg-transparent mb-8 focus:border-blue-500 transition-colors dark:text-white"
                                placeholder="0"
                                value={qty}
                                onChange={e => setQty(e.target.value)}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModal({ ...modal, show: false })}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl text-gray-600 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStockUpdate}
                                    disabled={updating}
                                    className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition active:scale-95 ${modal.type === 'IN' ? 'bg-green-600 shadow-green-500/30' : 'bg-red-500 shadow-red-500/30'}`}
                                >
                                    {updating ? 'Updating...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ItemDetails;
