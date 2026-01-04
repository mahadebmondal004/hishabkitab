import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Phone, Eye, EyeOff, Sparkles, Fingerprint } from 'lucide-react';

const Login = () => {
    const [pin, setPin] = useState('');
    const [mobile, setMobile] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [quickLoginMode, setQuickLoginMode] = useState(false);
    const { login, quickLogin, biometricLogin, register, hasRememberedSession, isBiometricEnabled } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        // Check if user has a remembered session
        if (hasRememberedSession()) {
            setQuickLoginMode(true);
            const rememberedMobile = localStorage.getItem('rememberedMobile');
            setMobile(rememberedMobile || '');
        }

        // Check if biometric is enabled
        setBiometricAvailable(isBiometricEnabled());
    }, [hasRememberedSession, isBiometricEnabled]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegistering) {
            // Client-side Mobile Validation
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(mobile)) {
                setError('Please enter a valid 10-digit Indian mobile number.');
                return;
            }

            const res = await register(name, mobile, pin);
            if (res.success) {
                const loginRes = await login(mobile, pin);
                if (loginRes.success) navigate('/');
            } else {
                setError(res.message);
            }
        } else {
            let res;
            if (quickLoginMode) {
                res = await quickLogin(pin);
            } else {
                res = await login(mobile, pin);
            }

            if (res.success) {
                navigate('/');
            } else {
                setError(res.message);
            }
        }
    };

    const handleBiometricLogin = async () => {
        setError('');
        const res = await biometricLogin();
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message || 'Biometric authentication failed');
        }
    };

    const switchToFullLogin = () => {
        setQuickLoginMode(false);
        setMobile('');
        setPin('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 dark:from-blue-900 dark:via-purple-900 dark:to-red-900 flex flex-col items-center justify-center p-6 transition-colors duration-200 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Main Card */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center transition-all duration-200 relative z-10 border border-white/20">
                {/* Logo Section */}
                <div className="flex justify-center mb-6 relative">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-white dark:bg-gray-700 p-4 rounded-3xl shadow-lg">
                            <img src="/flash.png" alt="Logo" className="w-20 h-20 object-contain" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                        Hishab Kitab
                    </h1>
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {isRegistering ? (
                            <>
                                <Sparkles size={20} className="text-purple-500" />
                                Create Account
                            </>
                        ) : quickLoginMode ? (
                            <>
                                <Lock size={20} className="text-blue-500" />
                                Welcome Back
                            </>
                        ) : (
                            <>
                                <Lock size={20} className="text-blue-500" />
                                Login
                            </>
                        )}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {isRegistering
                            ? 'Start managing your business ledger'
                            : quickLoginMode
                                ? `Enter PIN for ${mobile}`
                                : 'Enter your credentials to continue'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 transition-all duration-200"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {!quickLoginMode && (
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Phone size={20} />
                            </div>
                            <input
                                type="tel"
                                placeholder="Mobile Number"
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 transition-all duration-200"
                                value={mobile}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) setMobile(val);
                                }}
                                maxLength={10}
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={20} />
                        </div>
                        <input
                            type={showPin ? "text" : "password"}
                            maxLength={4}
                            placeholder="Enter 4-digit PIN"
                            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 text-center text-2xl tracking-widest font-bold transition-all duration-200"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            autoFocus={quickLoginMode}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                        >
                            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isRegistering ? (
                            <>
                                <Sparkles size={20} />
                                Create Account
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                Unlock
                            </>
                        )}
                    </button>
                </form>

                {/* Biometric Login Button */}
                {!isRegistering && biometricAvailable && quickLoginMode && (
                    <button
                        onClick={handleBiometricLogin}
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Fingerprint size={24} />
                        Use Fingerprint
                    </button>
                )}

                {/* Toggle Buttons */}
                {!isRegistering && quickLoginMode && (
                    <button
                        onClick={switchToFullLogin}
                        className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all duration-200"
                    >
                        Use different account →
                    </button>
                )}

                {!isRegistering && !quickLoginMode && (
                    <button
                        onClick={() => setIsRegistering(true)}
                        className="mt-6 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all duration-200"
                    >
                        New User? Setup PIN →
                    </button>
                )}

                {isRegistering && (
                    <button
                        onClick={() => setIsRegistering(false)}
                        className="mt-6 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all duration-200"
                    >
                        ← Already have a PIN? Login
                    </button>
                )}

                {/* Footer */}
                <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
                    Your digital ledger for business management
                </p>
            </div>
        </div>
    );

};

export default Login;
