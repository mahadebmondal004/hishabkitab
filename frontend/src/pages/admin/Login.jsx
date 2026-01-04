import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log('Sending OTP to:', email);
            const res = await api.post('/admin/send-otp', { email });
            console.log('OTP Response:', res.data);

            // Check for success in response
            if (res.data && res.data.success) {
                setStep(2);
                setMessage('OTP sent to your email!');
                console.log('✅ OTP sent successfully');
            } else {
                // If response doesn't have success flag but no error was thrown
                console.warn('Unexpected response format:', res.data);
                setError(res.data?.message || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('OTP Send Error:', error);
            console.error('Error Response:', error.response?.data);

            // More detailed error handling
            if (error.response) {
                // Server responded with error
                setError(error.response.data?.message || 'Failed to send OTP. Check email.');
            } else if (error.request) {
                // Request made but no response
                setError('No response from server. Check your connection.');
            } else {
                // Something else happened
                setError(error.message || 'Failed to send OTP');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/admin/verify-otp', { email, otp });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
                navigate('/admin/dashboard');
            } else {
                setError('Invalid OTP');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* 3D Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm group perspective-1000">
                {/* 3D Glass Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl transform transition-all duration-500 hover:rotate-x-2">
                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-t-3xl opacity-80"></div>

                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                        <div className="relative p-5 bg-slate-800/80 rounded-2xl border border-white/10 shadow-inner">
                            <Shield size={40} className="text-indigo-400" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Access</h2>
                        <p className="text-indigo-300/60 text-sm font-medium">Secure Gateway Login</p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Admin Email</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition duration-300"></div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-indigo-400 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium placeholder-gray-600"
                                            placeholder="admin@hishabkitab.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2 animate-shake">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Verify Email <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-6 bg-white/5 py-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 text-xs uppercase tracking-wide">Code sent to</span>
                                <div className="text-white font-bold flex items-center justify-center gap-2 mt-1">
                                    {email}
                                    <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium">Edit</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">One-Time Password</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition duration-300"></div>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-indigo-400 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono text-xl tracking-[0.5em] text-center placeholder-gray-700 font-bold"
                                            placeholder="••••••"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            autoFocus
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-2 rounded-xl text-xs text-center flex items-center justify-center gap-2 font-medium">
                                    <CheckCircle size={14} /> {message}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    'Secure Login'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-gray-500 text-xs mt-6 opacity-60">
                    &copy; 2024 Hishab Kitab Admin Panel
                </p>
            </div>
        </div>
    );
};

export default Login;
