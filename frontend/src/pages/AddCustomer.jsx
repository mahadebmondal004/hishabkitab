import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, User, Phone, StickyNote, Smartphone, Save } from 'lucide-react';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', mobile: '', note: '' });
    const [loading, setLoading] = useState(false);
    const [isContactSupported, setIsContactSupported] = useState('contacts' in navigator && 'ContactsManager' in window);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/customers', formData);
            navigate(`/customer/${res.data.id}`);
        } catch (error) {
            alert(error.response?.data?.error || 'Error creating customer');
        } finally {
            setLoading(false);
        }
    };

    const handlePickContact = async () => {
        try {
            const props = ['name', 'tel'];
            const opts = { multiple: false };
            const contacts = await navigator.contacts.select(props, opts);

            if (contacts.length > 0) {
                const contact = contacts[0];
                const name = contact.name ? contact.name[0] : '';
                const mobile = contact.tel ? contact.tel[0].replace(/\s/g, '') : ''; // Remove spaces

                setFormData(prev => ({
                    ...prev,
                    name: name || prev.name,
                    mobile: mobile || prev.mobile
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 p-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Add New Customer</h1>
                        <p className="text-blue-100 text-xs text-opacity-80">Create a new ledger account</p>
                    </div>
                </div>
            </div>

            <div className="p-6 -mt-4 relative z-20">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {isContactSupported && (
                            <button
                                type="button"
                                onClick={handlePickContact}
                                className="w-full py-4 border-2 border-dashed border-blue-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition group"
                            >
                                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full group-hover:scale-110 transition-transform">
                                    <Smartphone size={20} />
                                </div>
                                Import from Contacts
                            </button>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Customer Details</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Customer Name"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-semibold transition-all placeholder-gray-400"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Phone size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-semibold transition-all placeholder-gray-400"
                                            value={formData.mobile}
                                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <StickyNote size={20} />
                                        </div>
                                        <textarea
                                            placeholder="Additional Notes (Optional)"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white font-medium transition-all placeholder-gray-400 min-h-[100px] resize-none"
                                            value={formData.note}
                                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:shadow-none"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Customer
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCustomer;
