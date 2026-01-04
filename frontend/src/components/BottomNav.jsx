import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, IndianRupee, Menu, Package, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();

    // Determine active index based on path
    const getActiveIndex = (pathname) => {
        if (pathname.startsWith('/bills')) return 1;
        if (pathname.startsWith('/cashbook')) return 2;
        if (pathname.startsWith('/items')) return 3;
        if (pathname.startsWith('/more')) return 4;
        return 0;
    };

    const activeIndex = getActiveIndex(location.pathname);

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/bills', icon: Receipt, label: 'Bills' },
        { path: '/cashbook', icon: IndianRupee, label: 'Hishab' },
        { path: '/items', icon: Package, label: 'Items' },
        { path: '/more', icon: Menu, label: 'More' },
    ];

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-2 pb-0 pt-0 h-16 flex items-center justify-around z-40 border-t border-white/20 dark:border-gray-700/50">
            {navItems.map((item, index) => {
                const isActive = activeIndex === index;
                const Icon = item.icon;

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="relative w-20 h-14 flex flex-col items-center justify-end pb-1 group"
                    >
                        {/* Magic Floating Circle */}
                        {isActive && (
                            <motion.div
                                layoutId="magicBubble"
                                className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-[4px] border-white/20 dark:border-gray-800/20 shadow-xl shadow-blue-600/30 z-10 flex items-center justify-center backdrop-blur-md"
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            >
                                {/* Active Icon Inside Circle with Gradient */}
                                <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-full p-2.5">
                                    <Icon size={20} className="text-white relative z-20" strokeWidth={2.5} />
                                </div>
                            </motion.div>
                        )}

                        {/* Inactive Icon (Only visible when NOT active) */}
                        {!isActive && (
                            <div className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                                <Icon size={20} strokeWidth={2} />
                            </div>
                        )}

                        {/* Label */}
                        <span
                            className={`text-[9px] font-bold transition-all duration-300 ${isActive ? 'translate-y-0 text-blue-600 dark:text-blue-400 opacity-100' : 'translate-y-8 opacity-0 absolute'}`}
                        >
                            {item.label}
                        </span>
                    </NavLink>
                );
            })}
        </div>
    );
};

export default BottomNav;
