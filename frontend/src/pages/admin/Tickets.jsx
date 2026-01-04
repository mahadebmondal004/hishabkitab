import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, Eye, X, MessageCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        let filtered = tickets;
        if (filterStatus !== 'all') {
            filtered = filtered.filter(t => (t.status || '').toLowerCase() === filterStatus);
        }
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredTickets(filtered);
    }, [tickets, searchTerm, filterStatus]);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/admin/support/tickets');
            setTickets(res.data);
            setFilteredTickets(res.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setResponse(ticket.admin_response || '');
        setStatus(ticket.status);
        setShowModal(true);
    };

    const handleUpdateTicket = async () => {
        try {
            await api.put(`/admin/support/tickets/${selectedTicket.id}`, {
                status,
                admin_response: response
            });
            setShowModal(false);
            fetchTickets();
        } catch (error) {
            alert('Error updating ticket');
        }
    };

    const handleDeleteTicket = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await api.delete(`/admin/support/tickets/${id}`);
            fetchTickets();
        } catch (error) {
            alert('Error deleting ticket');
        }
    };

    const getStatusStyle = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="relative z-10 w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto animate-fadeIn">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-105 border border-white/5">
                            <ArrowLeft size={20} className="text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Support Center</h1>
                            <p className="text-gray-400 text-sm">Ticket Management System</p>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-80 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200"></div>
                        <div className="relative flex items-center bg-slate-900 rounded-xl">
                            <Search className="absolute left-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="w-full bg-transparent text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${filterStatus === f
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-4 relative">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${getStatusStyle(ticket.status)}`}>
                                    {(ticket.status || '').replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                                {ticket.subject}
                            </h3>

                            <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                                {ticket.message || ticket.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 relative">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        {ticket.user_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-xs text-gray-300 max-w-[100px] truncate">{ticket.user_name}</div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewTicket(ticket)}
                                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTicket(ticket.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                            <AlertCircle size={48} className="mb-4 opacity-20" />
                            <p>No tickets found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {
                showModal && selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                        <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 backdrop-blur-xl z-10">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MessageCircle className="text-indigo-400" />
                                    Ticket Details
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Subject</label>
                                    <p className="text-white font-medium text-lg">{selectedTicket.subject}</p>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Message</label>
                                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.message || selectedTicket.description}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">User</label>
                                        <p className="text-white">{selectedTicket.user_name}</p>
                                        <p className="text-xs text-gray-400">{selectedTicket.user_mobile}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Created</label>
                                        <p className="text-white">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6">
                                    <h4 className="text-lg font-bold text-white mb-4">Admin Action</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Update Status</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setStatus(s)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition py-2 border ${status === s
                                                            ? getStatusStyle(s).replace('bg-opacity-20', 'bg-opacity-80')
                                                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {s.replace('_', ' ').toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Response</label>
                                            <textarea
                                                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-600 transition"
                                                rows="4"
                                                placeholder="Write your reply here..."
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <button
                                            onClick={handleUpdateTicket}
                                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                        >
                                            Update Ticket
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default AdminTickets;
