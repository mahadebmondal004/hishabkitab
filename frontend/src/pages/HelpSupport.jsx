import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const HelpSupport = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General',
        description: ''
    });

    useEffect(() => {
        if (activeTab === 'my_tickets') {
            fetchTickets();
        }
    }, [activeTab]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tickets', formData);
            setFormData({ subject: '', category: 'General', description: '' });
            alert('Ticket created successfully!');
            setActiveTab('my_tickets');
        } catch (error) {
            console.error(error);
            alert('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 p-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Help & Support</h1>
                        <p className="text-blue-100 text-xs">We are here to help you</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/20 p-1 rounded-xl mt-6 relative z-10">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:bg-white/10'}`}
                    >
                        Raise Ticket
                    </button>
                    <button
                        onClick={() => setActiveTab('my_tickets')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'my_tickets' ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:bg-white/10'}`}
                    >
                        My Tickets
                    </button>
                </div>
            </div>

            <div className="p-6">
                {activeTab === 'create' ? (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">New Support Ticket</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Category</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-semibold outline-none dark:text-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>General Inquiry</option>
                                        <option>Bug Report</option>
                                        <option>Feature Request</option>
                                        <option>Billing Issue</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Brief summary of the issue"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-semibold outline-none dark:text-white"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                                    <textarea
                                        required
                                        placeholder="Describe your issue in detail..."
                                        rows="5"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium outline-none dark:text-white resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? 'Submitting...' : <><Send size={18} /> Submit Ticket</>}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-12 opacity-50 space-y-2">
                                <AlertCircle size={48} className="mx-auto text-gray-300" />
                                <p className="text-gray-500">No tickets found</p>
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <div key={ticket.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ticket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' :
                                            ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{ticket.subject}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2">{ticket.description}</p>
                                    <div className="mt-3 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded w-fit">
                                        {ticket.category}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpSupport;
