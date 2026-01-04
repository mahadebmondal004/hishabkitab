import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    LayoutDashboard, Users, TrendingUp, Database, Settings as SettingsIcon,
    Activity, DollarSign, UserCheck, BarChart3, Shield, LogOut,
    Eye, Trash2, Search, Ticket, FileText, ArrowRight, Zap, Globe, Server, X
} from 'lucide-react';
import api from '../../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCustomers: 0,
        totalBalance: 0,
        activeUsers: 0,
        openTickets: 0,
        totalPages: 0
    });
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    useEffect(() => {
        // Determine active tab based on URL
        if (location.pathname === '/admin/users') {
            setActiveTab('users');
        } else if (searchParams.get('tab') === 'customers') {
            setActiveTab('customers');
        } else {
            setActiveTab('overview');
        }
    }, [location, searchParams]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [usersRes, customersRes, ticketStats] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/customers'),
                api.get('/admin/support/tickets/stats').catch(() => ({ data: { open: 0 } }))
            ]);

            setUsers(usersRes.data || []);
            setCustomers(customersRes.data || []);

            const totalBalance = customersRes.data.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);

            setStats({
                totalUsers: usersRes.data?.length || 0,
                totalCustomers: customersRes.data?.length || 0,
                totalBalance: totalBalance,
                activeUsers: usersRes.data?.filter(u => u.last_login)?.length || 0,
                openTickets: ticketStats.data?.open || 0,
                totalPages: 3
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Delete user? This action is irreversible.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                fetchAdminData();
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Delete customer?')) {
            try {
                await api.delete(`/admin/customers/${customerId}`);
                fetchAdminData();
            } catch (error) {
                alert('Failed to delete customer');
            }
        }
    };

    const handleViewCustomers = (user) => {
        setSelectedUser(user);
        setShowCustomerModal(true);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm)
    );

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const userCustomers = selectedUser ? customers.filter(c => c.user_id === selectedUser.id) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">

            {/* Overview Section */}
            {activeTab === 'overview' && (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                            <p className="text-slate-400">Welcome back, Administrator</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            icon={Users}
                            label="Total Users"
                            value={stats.totalUsers}
                            sub="Registered Accounts"
                            color="from-blue-500 to-indigo-600"
                        />
                        <StatsCard
                            icon={UserCheck}
                            label="Active Users"
                            value={stats.activeUsers}
                            sub="Currently Online"
                            color="from-emerald-400 to-cyan-500"
                        />
                        <StatsCard
                            icon={Database}
                            label="Total Customers"
                            value={stats.totalCustomers}
                            sub="Client Records"
                            color="from-purple-500 to-pink-500"
                        />
                        <StatsCard
                            icon={DollarSign}
                            label="Total Balance"
                            value={`₹${stats.totalBalance.toLocaleString()}`}
                            sub="Outstanding Amount"
                            color="from-orange-400 to-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BarChart3 size={100} />
                            </div>
                            <h3 className="text-xl font-bold text-indigo-300 mb-2">Transaction Velocity</h3>
                            <p className="text-gray-400 text-sm mb-4">Real-time data flow</p>
                            <div className="h-32 flex items-end gap-2 mt-4">
                                {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-indigo-500/40 rounded-t-sm hover:bg-indigo-400 transition-colors"></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Server size={100} />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-300 mb-2">System Health</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                <span className="text-emerald-400 font-medium">All Systems Operational</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-400"><span>CPU Usage</span><span>12%</span></div>
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="w-[12%] h-full bg-emerald-500"></div></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-400"><span>Memory</span><span>45%</span></div>
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="w-[45%] h-full bg-blue-500"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Users or Customers Table */}
            {(activeTab === 'users' || activeTab === 'customers') && (
                <div className="animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{activeTab === 'users' ? 'User Directory' : 'Customer Database'}</h2>
                            <p className="text-sm text-slate-400">Manage {activeTab} information</p>
                        </div>

                        <div className="relative w-full sm:w-auto group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200"></div>
                            <div className="relative flex items-center bg-slate-900 rounded-xl">
                                <Search className="absolute left-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    className="w-full sm:w-72 bg-transparent text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none placeholder-gray-500 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 uppercase text-xs tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">{activeTab === 'users' ? 'User Info' : 'Customer Info'}</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">{activeTab === 'users' ? 'Stats' : 'Financials'}</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(activeTab === 'users' ? filteredUsers : filteredCustomers).length > 0 ? (
                                        (activeTab === 'users' ? filteredUsers : filteredCustomers).map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-lg group-hover:scale-110 transition-transform">
                                                            {item.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white">{item.name || 'Unknown'}</div>
                                                            {activeTab === 'customers' && <div className="text-xs text-gray-500">User: {item.user_name}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 font-mono text-sm">{item.mobile}</td>
                                                <td className="px-6 py-4">
                                                    {activeTab === 'users' ? (
                                                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                                                            {customers.filter(c => c.user_id === item.id).length} Customers
                                                        </span>
                                                    ) : (
                                                        <span className={`font-mono font-semibold ${parseFloat(item.balance) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            ₹{Math.abs(item.balance).toLocaleString()} {parseFloat(item.balance) >= 0 ? '(Cr)' : '(Dr)'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {activeTab === 'users' && (
                                                            <button onClick={() => handleViewCustomers(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors" title="View Customers">
                                                                <Eye size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => activeTab === 'users' ? handleDeleteUser(item.id) : handleDeleteCustomer(item.id)}
                                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">No records found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Modal */}
            {showCustomerModal && selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCustomerModal(false)}></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-scaleIn">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="text-indigo-400" />
                                    {selectedUser.name}'s Customers
                                </h3>
                                <p className="text-sm text-gray-400">Mobile: {selectedUser.mobile}</p>
                            </div>
                            <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userCustomers.map(c => (
                                    <div key={c.id} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                                {c.name[0]}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-md ${parseFloat(c.balance) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {parseFloat(c.balance) >= 0 ? 'Receivable' : 'Payable'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-white truncate">{c.name}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{c.mobile}</p>
                                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Balance</span>
                                            <span className="font-bold text-white">₹{Math.abs(c.balance)}</span>
                                        </div>
                                    </div>
                                ))}
                                {userCustomers.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No records found</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components for cleanliness
const StatsCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="relative group perspective-500 hover:-translate-y-1 transition-transform duration-300">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500`}></div>
        <div className="relative bg-slate-900 border border-white/10 p-6 rounded-2xl h-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}>
                    <Icon className="text-white" size={24} />
                </div>
                <Zap size={16} className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{label}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono opacity-60">{sub}</p>
        </div>
    </div>
);

export default Dashboard;
