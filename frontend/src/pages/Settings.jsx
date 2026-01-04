import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Download, Lock, Palette, X, Moon, Sun, Fingerprint, ChevronRight, User, Shield, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const Settings = () => {
    const navigate = useNavigate();
    const { logout, user, enableBiometric, isBiometricEnabled } = useAuth();
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinData, setPinData] = useState({ oldPin: '', newPin: '', confirmPin: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    useEffect(() => {
        setBiometricEnabled(isBiometricEnabled());
    }, [isBiometricEnabled]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const toggleBiometric = async () => {
        try {
            if (!biometricEnabled) {
                const { isBiometricAvailable, registerBiometric } = await import('../utils/biometric');
                const available = await isBiometricAvailable();
                if (!available) {
                    alert('Biometric authentication is not available on this device.');
                    return;
                }
                const result = await registerBiometric(user.id, user.name || user.mobile);
                if (result.success) {
                    setBiometricEnabled(true);
                    enableBiometric(true);
                    alert('Fingerprint login enabled successfully!');
                } else {
                    alert('Failed to enable fingerprint login.');
                }
            } else {
                const { removeBiometric } = await import('../utils/biometric');
                removeBiometric();
                setBiometricEnabled(false);
                enableBiometric(false);
                alert('Fingerprint login disabled.');
            }
        } catch (error) {
            console.error('Biometric toggle error:', error);
            alert(error.message || 'Failed to toggle fingerprint login.');
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/customers');
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `hishab_kitab_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (e) {
            alert('Export failed');
        }
    };

    const handleChangePin = async (e) => {
        e.preventDefault();
        if (pinData.newPin !== pinData.confirmPin) {
            alert("New PINs do not match");
            return;
        }
        if (pinData.newPin.length < 4) {
            alert("PIN must be at least 4 digits");
            return;
        }

        try {
            await api.post('/auth/change-pin', {
                userId: user.id,
                oldPin: pinData.oldPin,
                newPin: pinData.newPin
            });
            alert('PIN changed successfully');
            setShowPinModal(false);
            setPinData({ oldPin: '', newPin: '', confirmPin: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to change PIN');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            {/* New Header Design */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 p-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                            <p className="text-indigo-100 text-sm font-medium">Preferences & Security</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <SettingsIcon size={20} className="text-white" />
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-6 relative z-20 space-y-4">
                {/* Profile Card */}
                <Link to="/profile" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex items-center gap-4 group active:scale-[0.98] transition-all">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                        {user?.profile_picture ? (
                            <img
                                src={user.profile_picture.startsWith('http') ? user.profile_picture : user.profile_picture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : <User size={24} />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-800 dark:text-white text-lg">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.mobile || 'No Mobile'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-full text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </Link>

                {/* Account Settings Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account & Security</h2>
                    </div>

                    <button
                        onClick={() => setShowPinModal(true)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                            <Lock size={20} />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 flex-1 text-left">Change PIN</span>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>

                    <div className="w-full p-4 flex items-center gap-4 border-t border-gray-50 dark:border-gray-700">
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                            <Fingerprint size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <span className="font-semibold text-gray-700 dark:text-gray-200 block">Biometric Login</span>
                            <span className="text-[10px] text-gray-400">Fingerprint / Face ID</span>
                        </div>
                        <button
                            onClick={toggleBiometric}
                            className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${biometricEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${biometricEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {/* App Preferences Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferences</h2>
                    </div>

                    <div className="w-full p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                            <Palette size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <span className="font-semibold text-gray-700 dark:text-gray-200 block">Dark Mode</span>
                            <span className="text-[10px] text-gray-400">Adjust appearance</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                                {theme === 'dark' ? <Moon size={12} className="text-indigo-600" /> : <Sun size={12} className="text-orange-500" />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data</h2>
                    </div>

                    <button
                        onClick={handleExport}
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                            <Download size={20} />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 flex-1 text-left">Backup / Export Data</span>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>

                <button
                    onClick={logout}
                    className="w-full bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 flex items-center gap-4 active:scale-[0.98] transition mt-6"
                >
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
                        <LogOut size={20} />
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400 flex-1 text-left">Logout</span>
                </button>
            </div>

            {/* Change PIN Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Change PIN</h3>
                            <button onClick={() => setShowPinModal(false)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Current PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center text-2xl font-bold tracking-[0.5em] dark:text-white transition-all"
                                    value={pinData.oldPin}
                                    onChange={(e) => setPinData({ ...pinData, oldPin: e.target.value })}
                                    required
                                    placeholder="••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">New PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center text-2xl font-bold tracking-[0.5em] dark:text-white transition-all"
                                    value={pinData.newPin}
                                    onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
                                    required
                                    placeholder="••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Confirm New PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center text-2xl font-bold tracking-[0.5em] dark:text-white transition-all"
                                    value={pinData.confirmPin}
                                    onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                                    required
                                    placeholder="••••"
                                />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:opacity-90 active:scale-[0.98] transition-all">
                                Update PIN
                            </button>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

// Start of Selection
// Helper to fix the icon import error if SettingsIcon isn't exported from lucide-react directly
// (Actually lucide-react exports 'Settings' not 'SettingsIcon', so let me alias it in import)
const SettingsIcon = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default Settings;
