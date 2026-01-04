import React, { useState, useEffect } from 'react';

import { Receipt, Plus, Search, Trash2, Printer, Share2, X, Download, FileText } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    // View Modal State
    const [viewInvoice, setViewInvoice] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Form State
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [billData, setBillData] = useState({
        customer_id: '',
        customer_name: '',
        invoice_date: new Date().toISOString().split('T')[0],
        items: []
    });

    // Stats
    const [stats, setStats] = useState({ totalSales: 0, totalBills: 0 });

    const API_URL = '';

    useEffect(() => {
        fetchBills();
        fetchDependencies();
    }, []);

    useEffect(() => {
        // Filter and Stats
        const filtered = bills.filter(b =>
            (b.customer_name || 'Walking Customer').toLowerCase().includes(search.toLowerCase()) ||
            String(b.id).includes(search)
        );
        setFilteredBills(filtered);

        const total = bills.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
        setStats({ totalSales: total, totalBills: bills.length });
    }, [bills, search]);

    const fetchBills = async () => {
        try {
            const res = await api.get(`${API_URL}/invoices`);
            setBills(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchDependencies = async () => {
        try {
            const [custRes, prodRes, servRes] = await Promise.all([
                api.get(`${API_URL}/customers`),
                api.get(`${API_URL}/products?type=PRODUCT`),
                api.get(`${API_URL}/products?type=SERVICE`)
            ]);
            // Merge products and services for selection list
            setProducts([...prodRes.data, ...servRes.data]);
            setCustomers(custRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const openInvoiceDetails = async (id) => {
        setViewLoading(true);
        setViewInvoice(null);
        try {
            const res = await api.get(`${API_URL}/invoices/${id}`);
            setViewInvoice(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setViewLoading(false);
        }
    };

    const handleShare = () => {
        if (!viewInvoice) return;
        const text = `Invoice #${viewInvoice.id} from Hishab Kitab %0A` +
            `Date: ${new Date(viewInvoice.invoice_date).toLocaleDateString()} %0A` +
            `Amount: ₹${viewInvoice.total_amount} %0A` +
            `Link: https://hishabkitab.com/invoice/${viewInvoice.id}`; // Placeholder link
        const url = `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    const addItemToBill = () => {
        setBillData({
            ...billData,
            items: [...billData.items, { product_id: '', product_name: '', rate: 0, quantity: 1, amount: 0 }]
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...billData.items];
        const item = { ...newItems[index] };

        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                item.product_id = product.id;
                item.product_name = product.name;
                item.rate = product.rate;
                item.amount = product.rate * item.quantity;
            }
        } else if (field === 'product_name') {
            item.product_name = value;
        } else if (field === 'quantity' || field === 'rate') {
            item[field] = parseFloat(value) || 0;
            item.amount = item.quantity * item.rate;
        }

        newItems[index] = item;
        setBillData({ ...billData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = billData.items.filter((_, i) => i !== index);
        setBillData({ ...billData, items: newItems });
    };

    const calculateTotal = () => {
        return billData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const total_amount = calculateTotal();
        const payload = { ...billData, total_amount, type: 'SALE' };

        try {
            await api.post(`${API_URL}/invoices`, payload);
            setShowModal(false);
            setBillData({ customer_id: '', customer_name: '', invoice_date: new Date().toISOString().split('T')[0], items: [] });
            fetchBills();
        } catch (error) {
            console.error("Error creating bill", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header Section (Matching Home.jsx Style) */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden print:hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-sm">
                            <Receipt size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight">Bills & Sales</h1>
                            <p className="text-blue-100 text-xs font-light">Manage invoices</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Total Revenue</p>
                        <p className="text-2xl font-bold tracking-tight text-white">₹{stats.totalSales.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Total Bills</p>
                        <p className="text-2xl font-bold tracking-tight text-white">{stats.totalBills}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar Overlap */}
            <div className="px-6 -mt-7 relative z-20 space-y-4 print:hidden">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 flex items-center gap-3 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <Search className="text-blue-500 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search bills by name or ID..."
                        className="flex-1 bg-transparent py-3 pr-4 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-light"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="p-6 space-y-4 print:hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredBills.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="dark:text-gray-500 font-light text-lg">No bills found</p>
                    </div>
                ) : (
                    filteredBills.map((bill, index) => (
                        <div
                            key={bill.id}
                            onClick={() => openInvoiceDetails(bill.id)}
                            className="card-3d p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer animate-fade-in-up hover:border-blue-500/30 transition-all"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 leading-tight">{bill.customer_name || 'Walking Customer'}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Inv #{bill.id} • {new Date(bill.invoice_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-lg text-blue-600 dark:text-blue-400">₹{bill.total_amount}</span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">PAID</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] pointer-events-none z-30 h-screen print:hidden">
                <button
                    onClick={() => { setShowModal(true); addItemToBill(); }}
                    className="absolute bottom-24 right-6 pointer-events-auto bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/40 active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* New Bill Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 print:hidden"
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
                        >
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-red-600 text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold">Create New Bill</h2>
                                <button onClick={() => setShowModal(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Customer</label>
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                                        <select
                                            className="w-full bg-white dark:bg-gray-700 px-4 py-3 outline-none font-semibold text-gray-800 dark:text-white"
                                            value={billData.customer_id}
                                            onChange={e => {
                                                const cust = customers.find(c => c.id === parseInt(e.target.value));
                                                setBillData({ ...billData, customer_id: e.target.value, customer_name: cust ? cust.name : '' });
                                            }}
                                        >
                                            <option value="">Walking Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {billData.customer_id === '' && (
                                        <input
                                            type="text"
                                            className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 outline-none dark:text-white"
                                            placeholder="Enter Customer Name (Optional)"
                                            value={billData.customer_name}
                                            onChange={e => setBillData({ ...billData, customer_name: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-500">Items</label>
                                    {billData.items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-100 dark:border-gray-600">
                                            <div className="flex-1 space-y-2">
                                                <select
                                                    className="w-full p-2 rounded-lg text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 dark:text-white outline-none"
                                                    value={item.product_id}
                                                    onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                >
                                                    <option value="">Select Item</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="Qty" className="w-20 p-2 rounded-lg text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 dark:text-white outline-none" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                                                    <input type="number" placeholder="Rate" className="w-24 p-2 rounded-lg text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 dark:text-white outline-none" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="font-bold text-sm dark:text-white">₹{item.amount}</span>
                                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addItemToBill} className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                                        <Plus size={14} /> Add Another Item
                                    </button>
                                </div>
                            </form>

                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg dark:text-white">Total Amount</span>
                                    <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">₹{calculateTotal()}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-gray-600">Cancel</button>
                                    <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">Create Bill</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Invoice Modal (Printable) */}
            <AnimatePresence>
                {viewInvoice && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto print:bg-white print:static print:block print:p-0">
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="bg-white w-full max-w-xl min-h-[50vh] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:rounded-none"
                        >
                            {/* Actions Header (Hidden on Print) */}
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center print:hidden">
                                <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                                <div className="flex gap-3">
                                    <button onClick={handleShare} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-green-500/30">
                                        <Share2 size={16} /> WhatsApp
                                    </button>
                                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30">
                                        <Printer size={16} /> Print
                                    </button>
                                </div>
                            </div>

                            {/* Printable Content */}
                            <div className="p-8 print:p-0">
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Invoice</h1>
                                    <p className="text-gray-500 font-medium">#{viewInvoice.id}</p>
                                </div>

                                <div className="flex justify-between mb-8">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Billed To</p>
                                        <p className="font-bold text-lg text-gray-800">{viewInvoice.customer_name || 'Walking Customer'}</p>
                                        {viewInvoice.customer_mobile && <p className="text-sm text-gray-600">{viewInvoice.customer_mobile}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                                        <p className="font-bold text-lg text-gray-800">{new Date(viewInvoice.invoice_date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="text-left py-2 font-bold text-gray-600">Item</th>
                                            <th className="text-right py-2 font-bold text-gray-600">Qty</th>
                                            <th className="text-right py-2 font-bold text-gray-600">Rate</th>
                                            <th className="text-right py-2 font-bold text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewInvoice.items && viewInvoice.items.map((item, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-3 text-gray-800 font-medium">{item.product_name}</td>
                                                <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                                <td className="py-3 text-right text-gray-600">₹{item.rate}</td>
                                                <td className="py-3 text-right text-gray-800 font-bold">₹{item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end">
                                    <div className="w-1/2 space-y-2">
                                        <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-4">
                                            <span>Total</span>
                                            <span>₹{viewInvoice.total_amount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 text-center text-gray-400 text-sm print:mt-20">
                                    <p>Thank you for your business!</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default Bills;
