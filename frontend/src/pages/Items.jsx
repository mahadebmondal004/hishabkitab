import React, { useState, useEffect } from 'react';

import { Package, Plus, Search, Trash2, Edit2, Archive, Briefcase, Bell, Info, User } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Items = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'services'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    // Edit Mode State
    const [editingItem, setEditingItem] = useState(null);

    // Stats
    const [stats, setStats] = useState({ totalProducts: 0, totalServices: 0, lowStock: 0 });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        purchase_rate: '',
        unit: 'PCS',
        stock: '',
        low_stock_alert: '',
        tax_included: false,
        tax_rate: '',
        hsn_sac: ''
    });

    const API_URL = '/products';

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const type = activeTab === 'products' ? 'PRODUCT' : 'SERVICE';
            const res = await api.get(`${API_URL}?type=${type}`);
            setItems(res.data);

            // Calculate Stats (Basic logic, ideally backend should send this)
            // Ideally we'd fetch ALL items once to get counts, but for now let's just count loaded
            // To do this right, let's fetch counts separately or just show counts of current tab?
            // User asked for "Total Product, Total Service". 
            // Let's do a quick hack: we will just show count of *current* list for now, 
            // or fetch both queries in background if needed. For UI speed, let's stick to current list data or simple mock.
            // Actually, better to fetch both for stats? Let's just count visual items for now.
            // The API supports ?type=... if we remove it, does it return all? 
            // My backend implementation: if type is undefined, sql query: 'SELECT * FROM products WHERE user_id = ?'.  
            // Yes! It returns all if no type param.
            if (activeTab === 'products') { // Only fetch stats once or when needed
                const allRes = await api.get(`${API_URL}`);
                const all = allRes.data;
                setStats({
                    totalProducts: all.filter(i => i.type === 'PRODUCT').length,
                    totalServices: all.filter(i => i.type === 'SERVICE').length,
                    lowStock: all.filter(i => i.type === 'PRODUCT' && i.stock <= i.low_stock_alert).length
                })
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            rate: item.rate,
            purchase_rate: item.purchase_rate || '',
            unit: item.unit || 'PCS',
            stock: item.stock || '',
            low_stock_alert: item.low_stock_alert || '',
            tax_included: item.tax_included ? true : false,
            tax_rate: item.tax_rate || '',
            hsn_sac: item.hsn_sac || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                type: activeTab === 'products' ? 'PRODUCT' : 'SERVICE',
            };

            if (editingItem) {
                // UPDATE
                await api.put(`${API_URL}/${editingItem.id}`, payload);
            } else {
                // CREATE
                await api.post(API_URL, payload);
            }

            setShowModal(false);
            setEditingItem(null);
            resetForm();
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', rate: '', purchase_rate: '', unit: 'PCS',
            stock: '', low_stock_alert: '', tax_included: false,
            tax_rate: '', hsn_sac: ''
        });
        setEditingItem(null);
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent edit modal opening
        if (window.confirm('Delete this item?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchItems();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header Section (Copied from Home.jsx) */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-sm">
                            <Package size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight">Stock & Items</h1>
                            <p className="text-blue-100 text-xs font-light">Manage catalog</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Total Products</p>
                        <p className="text-2xl font-bold tracking-tight text-white">{stats.totalProducts}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Total Services</p>
                        <p className="text-2xl font-bold tracking-tight text-white">{stats.totalServices}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar & Tabs Overlap */}
            <div className="px-6 -mt-7 relative z-20 space-y-4">
                {/* Search */}
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 flex items-center gap-3 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <Search className="text-blue-500 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="flex-1 bg-transparent py-3 pr-4 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-light"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'services' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Services
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="dark:text-gray-500 font-light text-lg">No items found</p>
                    </div>
                ) : (
                    filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/items/${item.id}`)}
                            className="card-3d p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center group cursor-pointer animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {activeTab === 'products' ? <Package size={20} /> : <Briefcase size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 leading-tight">{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">₹{item.rate}</p>
                                        {activeTab === 'products' && (
                                            <p className={`text-[10px] font-bold ${item.stock <= item.low_stock_alert ? 'text-red-500' : 'text-green-600'}`}>
                                                Stock: {item.stock} {item.unit}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 z-10">
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="text-gray-400 p-2 hover:text-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-full"><Edit2 size={16} /></button>
                                <button onClick={(e) => handleDelete(item.id, e)} className="text-gray-400 p-2 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-full"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] pointer-events-none z-30 h-screen">
                <button
                    onClick={() => {
                        setEditingItem(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className={`absolute bottom-24 right-6 pointer-events-auto text-white p-4 rounded-2xl shadow-xl active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${activeTab === 'products' ? 'bg-gradient-to-r from-blue-600 to-red-600 shadow-blue-600/40' : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-600/40'}`}
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
                        >
                            {/* Modal Header */}
                            <div className={`p-4 text-white flex justify-between items-center ${activeTab === 'products' ? 'bg-gradient-to-r from-blue-600 to-red-600' : 'bg-purple-600'}`}>
                                <h2 className="text-lg font-bold">{editingItem ? 'Edit Item' : (activeTab === 'products' ? 'Add Item' : 'Add Services')}</h2>
                                <button onClick={() => setShowModal(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto p-5 space-y-6">
                                <FormInput label={activeTab === 'products' ? "Item name" : "Service name"} required
                                    placeholder={activeTab === 'products' ? "Enter item name here" : "Enter Service name here"}
                                    value={formData.name} onChange={v => setFormData({ ...formData, name: v })}
                                />

                                {activeTab === 'products' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Primary Unit</label>
                                            <select
                                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-2 outline-none font-semibold text-gray-800 dark:text-gray-200"
                                                value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            >
                                                <option value="PCS">PCS</option>
                                                <option value="KG">KG</option>
                                                <option value="LTR">LTR</option>
                                                <option value="MTR">MTR</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label={activeTab === 'products' ? "Sale Price" : "Service price"} type="number"
                                        prefix="₹" placeholder="Enter price"
                                        value={formData.rate} onChange={v => setFormData({ ...formData, rate: v })}
                                    />
                                    {activeTab === 'products' && (
                                        <FormInput label="Purchase Price" type="number"
                                            prefix="₹" placeholder="Enter price" info
                                            value={formData.purchase_rate} onChange={v => setFormData({ ...formData, purchase_rate: v })}
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax included in price</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tax_included: !formData.tax_included })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${formData.tax_included ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0 transition-transform ${formData.tax_included ? 'right-0' : 'left-0'}`}></div>
                                    </button>
                                </div>

                                {activeTab === 'products' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Current Stock" type="number" placeholder="Enter count"
                                            value={formData.stock} onChange={v => setFormData({ ...formData, stock: v })}
                                        />
                                        <FormInput label="Low Stock Alert" type="number" placeholder="Enter count" info
                                            value={formData.low_stock_alert} onChange={v => setFormData({ ...formData, low_stock_alert: v })}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label={activeTab === 'products' ? "HSN" : "SAC code"} placeholder={activeTab === 'products' ? "Enter HSN" : "Enter SAC"}
                                        value={formData.hsn_sac} onChange={v => setFormData({ ...formData, hsn_sac: v })}
                                    />
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">GST %</label>
                                        <select
                                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-2 outline-none font-semibold text-gray-800 dark:text-gray-200"
                                            value={formData.tax_rate} onChange={e => setFormData({ ...formData, tax_rate: e.target.value })}
                                        >
                                            <option value="">Select GST %</option>
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t dark:border-gray-700">
                                <button
                                    onClick={handleSubmit}
                                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg ${activeTab === 'products' ? 'bg-gradient-to-r from-blue-600 to-red-600 shadow-blue-500/30' : 'bg-purple-600 shadow-purple-500/30'}`}
                                >
                                    {editingItem ? 'UPDATE ITEM' : (activeTab === 'products' ? 'SAVE ITEM' : 'ADD SERVICE')}
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

const FormInput = ({ label, type = "text", placeholder, prefix, info, value, onChange, required }) => (
    <div>
        <label className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>} {info && <Info size={12} />}
        </label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            {prefix && <span className="pl-3 text-gray-500 font-bold">{prefix}</span>}
            <input
                type={type}
                className="w-full px-3 py-2.5 outline-none text-sm font-semibold text-gray-800 dark:text-white bg-transparent placeholder-gray-400"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
            />
        </div>
    </div>
);

export default Items;
