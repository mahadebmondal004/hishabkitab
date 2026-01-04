import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

const Splash = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            setTimeout(() => {
                if (isAuthenticated) {
                    navigate('/');
                } else {
                    navigate('/login');
                }
            }, 2000);
        }
    }, [loading, isAuthenticated, navigate]);

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-red-600 dark:bg-blue-900 flex flex-col items-center justify-center text-white transition-colors duration-200">
            <img src="/flash.png" alt="Hishab Kitab" className="w-32 h-32 mb-4 object-contain" />
            <h1 className="text-3xl font-bold dark:text-green-50">Hishab Kitab</h1>
            <p className="mt-2 text-green-100 dark:text-green-200">Your Digital Ledger</p>
        </div>
    );
};

export default Splash;
