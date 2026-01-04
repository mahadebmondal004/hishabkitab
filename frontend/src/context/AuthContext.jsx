import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedMobile = localStorage.getItem('rememberedMobile');
        const sessionData = sessionStorage.getItem('activeSession');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (sessionData) {
            setIsAuthenticated(true);
            setSessionActive(true);
        }

        setLoading(false);
    }, []);

    const login = async (mobile, pin) => {
        try {
            const response = await api.post('/auth/login', { mobile, pin });
            const userData = response.data.user;
            setUser(userData);
            setIsAuthenticated(true);
            setSessionActive(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('rememberedMobile', mobile);
            sessionStorage.setItem('activeSession', 'true');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const quickLogin = async (pin) => {
        try {
            const rememberedMobile = localStorage.getItem('rememberedMobile');
            if (!rememberedMobile) {
                return { success: false, message: 'No saved session found' };
            }
            return await login(rememberedMobile, pin);
        } catch (error) {
            return { success: false, message: 'Quick login failed' };
        }
    };

    const biometricLogin = async () => {
        try {
            const { authenticateBiometric } = await import('../utils/biometric');
            const biometricEnabled = localStorage.getItem('biometricEnabled');
            const rememberedMobile = localStorage.getItem('rememberedMobile');

            if (biometricEnabled !== 'true' || !rememberedMobile) {
                return { success: false, message: 'Biometric not enabled' };
            }

            // Authenticate using real biometric (fingerprint/face ID)
            const result = await authenticateBiometric();

            if (result.success) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                    setSessionActive(true);
                    sessionStorage.setItem('activeSession', 'true');
                    return { success: true };
                }
            }

            return { success: false, message: 'Biometric authentication failed' };
        } catch (error) {
            console.error('Biometric login error:', error);
            return { success: false, message: error.message || 'Biometric authentication failed' };
        }
    };

    const register = async (name, mobile, pin) => {
        try {
            await api.post('/auth/register', { name, mobile, pin });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    }

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const enableBiometric = (enabled) => {
        localStorage.setItem('biometricEnabled', enabled ? 'true' : 'false');
    };

    const isBiometricEnabled = () => {
        return localStorage.getItem('biometricEnabled') === 'true';
    };

    const hasRememberedSession = () => {
        return localStorage.getItem('rememberedMobile') !== null;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setSessionActive(false);
        sessionStorage.removeItem('activeSession');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberedMobile');
        localStorage.removeItem('biometricEnabled');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            sessionActive,
            loading,
            login,
            quickLogin,
            biometricLogin,
            register,
            logout,
            updateUser,
            enableBiometric,
            isBiometricEnabled,
            hasRememberedSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};
