import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, ShoppingCart, Truck, Package, Wrench, Factory, Store } from 'lucide-react';

const types = [
    { name: 'Retailer / Shop', icon: ShoppingCart, color: 'bg-orange-500' },
    { name: 'Wholesaler', icon: Package, color: 'bg-emerald-500' },
    { name: 'Distributor', icon: Truck, color: 'bg-blue-500' },
    { name: 'Services', icon: Wrench, color: 'bg-pink-600' },
    { name: 'Manufacturer', icon: Factory, color: 'bg-black' },
    { name: 'Other', icon: Store, color: 'bg-blue-700' },
];

const BusinessType = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [selected, setSelected] = useState(user?.business_type || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put(`/auth/profile/${user.id}`, { business_type: selected });
            updateUser(res.data.user);
            navigate(-1);
        } catch (error) {
            console.error(error);
            alert('Failed to save business type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header Section (Matching Home/Profile Style) */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight">What do you work as?</h1>
                            <p className="text-blue-100 text-xs font-light">Select business type</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 -mt-8 relative z-20 grid grid-cols-2 gap-4 pb-24">
                {types.map((type) => {
                    const Icon = type.icon;
                    return (
                        <div
                            key={type.name}
                            onClick={() => setSelected(type.name)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 h-32 text-center ${selected === type.name
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-white dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'
                                }`}
                        >
                            <div className={`p-3 rounded-full text-white ${type.color}`}>
                                <Icon size={24} />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{type.name}</span>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 mt-4 pb-8 flex justify-center">
                <button
                    onClick={handleSave}
                    disabled={loading || !selected}
                    className="w-full max-w-md bg-gradient-to-r from-blue-600 to-red-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 hover:opacity-90 transition shadow-lg text-lg tracking-wide transform active:scale-95"
                >
                    SAVE
                </button>
            </div>
        </div>
    );
};

export default BusinessType;
