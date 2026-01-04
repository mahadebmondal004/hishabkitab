import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, X, Phone, User as UserIcon, Search } from 'lucide-react';
import api from '../api/axios';

const Staff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', mobile: '', salary: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredStaff(staff);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredStaff(staff.filter(s =>
                s.name.toLowerCase().includes(lowerTerm) ||
                s.role.toLowerCase().includes(lowerTerm) ||
                s.mobile.includes(lowerTerm)
            ));
        }
    }, [searchTerm, staff]);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            setStaff(res.data);
            setFilteredStaff(res.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/staff/${editingId}`, formData);
            } else {
                await api.post('/staff', formData);
            }
            fetchStaff();
            setShowModal(false);
            setFormData({ name: '', role: '', mobile: '', salary: '' });
            setEditingId(null);
        } catch (error) {
            alert('Error saving staff');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/staff/${id}`);
            fetchStaff();
        } catch (error) {
            alert('Error deleting staff');
        }
    };

    const handleEdit = (s) => {
        setFormData(s);
        setEditingId(s.id);
        setShowModal(true);
    };

    const totalSalary = staff.reduce((sum, s) => sum + parseFloat(s.salary || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Staff Directory</h1>
                            <p className="text-orange-100 text-xs text-opacity-80">Manage your employees</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Total Staff</p>
                        <p className="text-2xl font-bold tracking-tight text-white">{staff.length}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Monthly Salary</p>
                        <p className="text-2xl font-bold tracking-tight text-orange-200">₹{totalSalary.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar Overlap matching Bills.jsx style */}
            <div className="px-6 -mt-7 relative z-20 space-y-4">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 flex items-center gap-3 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <Search className="text-blue-500 ml-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search staff by name, role..."
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

                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2 mb-2 hidden">Employee List</h2>

                {filteredStaff.map(s => (
                    <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 animate-fade-in-up">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                            {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 dark:text-white">{s.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.role} • {s.mobile}</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">₹{Number(s.salary).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(s)} className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {staff.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <UserIcon size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">No staff members found.</p>
                        <p className="text-xs text-gray-400">Add your first employee to get started.</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] pointer-events-none z-30 h-screen">
                <button
                    onClick={() => {
                        setFormData({ name: '', role: '', mobile: '', salary: '' });
                        setEditingId(null);
                        setShowModal(true);
                    }}
                    className="absolute bottom-6 right-6 pointer-events-auto bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/40 active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                    <UserPlus size={28} />
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingId ? 'Edit Staff' : 'Add New Staff'}</h3>
                            <button onClick={() => setShowModal(false)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-orange-500 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Employee Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Role</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-orange-500 dark:text-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="e.g. Manager, Sales"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Mobile</label>
                                <input
                                    type="tel"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-orange-500 dark:text-white"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    required
                                    placeholder="10 digit mobile"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Salary</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-orange-500 dark:text-white"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 active:scale-[0.98] transition-all">
                                {editingId ? 'Update Staff Member' : 'Add Staff Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
