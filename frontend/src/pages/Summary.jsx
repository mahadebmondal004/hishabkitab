import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, Receipt, Package, Users, Calendar, Settings, FileText, PieChart } from 'lucide-react';
import api from '../api/axios';

const Summary = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [cashbook, setCashbook] = useState({ totalBalance: 0, onlineBalance: 0, cashBalance: 0 });
    const [inventoryStats, setInventoryStats] = useState({ totalValue: 0, productCount: 0, lowStock: 0 });
    const [salesStats, setSalesStats] = useState({ totalSales: 0, totalBills: 0, unpaidAmount: 0 });

    useEffect(() => {
        const fetchData = async () => {
            // Parallel fetch
            const [custRes, cashRes, prodRes, billRes] = await Promise.all([
                api.get('/customers'),
                api.get('/cashbook'),
                api.get('/products'),
                api.get('/invoices')
            ]);

            setCustomers(custRes.data);
            setCashbook(cashRes.data.summary);

            // Calculate Inventory Stats
            const products = prodRes.data;
            const invStats = products.reduce((acc, item) => {
                if (item.type === 'PRODUCT') {
                    acc.productCount++;
                    acc.totalValue += (parseFloat(item.purchase_rate || 0) * parseFloat(item.stock || 0));
                    if (item.stock <= item.low_stock_alert) acc.lowStock++;
                }
                return acc;
            }, { totalValue: 0, productCount: 0, lowStock: 0 });
            setInventoryStats(invStats);

            // Calculate Sales Stats
            const bills = billRes.data;
            const slsStats = bills.reduce((acc, bill) => {
                acc.totalBills++;
                acc.totalSales += parseFloat(bill.total_amount || 0);
                // Assuming bills have simple status or payment tracking logic if available, otherwise just total
                return acc;
            }, { totalSales: 0, totalBills: 0, unpaidAmount: 0 });
            setSalesStats(slsStats);

        };
        fetchData().catch(err => console.error(err));
    }, []);

    const totalReceive = customers.reduce((acc, c) => acc + (parseFloat(c.balance) > 0 ? parseFloat(c.balance) : 0), 0);
    const totalPay = customers.reduce((acc, c) => acc + (parseFloat(c.balance) < 0 ? Math.abs(parseFloat(c.balance)) : 0), 0);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden mb-8">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition mb-4">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight">Summary Report</h1>
                    <p className="text-blue-100 text-sm font-light opacity-80">Overview of your business</p>
                </div>
            </div>

            <div className="px-6 space-y-8 -mt-6 relative z-10">
                {/* Customer Ledger Section */}
                <div>
                    <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-widest pl-2">Customer Ledger</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-3d bg-green-50 dark:bg-green-900/10 p-5 !border-green-100 dark:!border-green-900/30">
                                <p className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest">You Get</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1 tracking-tight">₹{totalReceive.toLocaleString()}</p>
                                <p className="text-green-600/70 dark:text-green-400/70 text-xs mt-1 font-medium">{customers.filter(c => parseFloat(c.balance) > 0).length} Customers</p>
                            </div>

                            <div className="card-3d bg-red-50 dark:bg-red-900/10 p-5 !border-red-100 dark:!border-red-900/30">
                                <p className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest">You Give</p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1 tracking-tight">₹{totalPay.toLocaleString()}</p>
                                <p className="text-red-600/70 dark:text-red-400/70 text-xs mt-1 font-medium">{customers.filter(c => parseFloat(c.balance) < 0).length} Customers</p>
                            </div>
                        </div>

                        {/* Net Customer Balance */}
                        <div className="card-3d p-4 flex justify-between items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Net Balance</div>
                            <div className={`font-bold text-lg tracking-tight ${(totalReceive - totalPay) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                                ₹{Math.abs(totalReceive - totalPay).toLocaleString()}
                                <span className="text-[10px] ml-1 font-bold text-gray-400 opacity-70">{(totalReceive - totalPay) >= 0 ? '(Cr)' : '(Dr)'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cashbook Section */}
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-widest pl-2">Hishab / Cashbook</h2>
                    <div className="bg-gradient-to-br from-slate-800 to-black text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Net Cashbook Balance</p>
                        <p className="text-4xl font-bold tracking-tight">₹{cashbook.totalBalance.toLocaleString()}</p>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Cash In Hand</p>
                                <p className="text-xl font-bold mt-1 tracking-tight">₹{cashbook.cashBalance.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Online Bank</p>
                                <p className="text-xl font-bold mt-1 tracking-tight">₹{cashbook.onlineBalance.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Section */}
            <div className="px-6 mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-widest pl-2">Sales Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Total Sales</p>
                        <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-1 tracking-tight">₹{salesStats.totalSales.toLocaleString()}</p>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 text-xs mt-1 font-medium">{salesStats.totalBills} Invoices</p>
                    </div>
                </div>
            </div>

            {/* Inventory Section */}
            <div className="px-6 mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-widest pl-2">Inventory Value</h2>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-widest">Stock Value</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1 tracking-tight">₹{inventoryStats.totalValue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-purple-700 dark:text-purple-300">{inventoryStats.productCount} Items</p>
                            {inventoryStats.lowStock > 0 && (
                                <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 justify-end mt-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    {inventoryStats.lowStock} Low Stock
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );

};

export default Summary;
