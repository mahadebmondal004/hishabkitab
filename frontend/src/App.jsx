import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import AddCustomer from './pages/AddCustomer';
import CustomerLedger from './pages/CustomerLedger';
import AddEntry from './pages/AddEntry';
import Summary from './pages/Summary';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import More from './pages/More';
import Items from './pages/Items';
import ItemDetails from './pages/ItemDetails';
import Bills from './pages/Bills';
import Cashbook from './pages/Cashbook';
import AddCashbookEntry from './pages/AddCashbookEntry';
import CategoryLedger from './pages/CategoryLedger';
import BusinessCategory from './pages/BusinessCategory';
import BusinessType from './pages/BusinessType';
import HelpSupport from './pages/HelpSupport';
import AboutUs from './pages/AboutUs';
import Staff from './pages/Staff';
import Collection from './pages/Collection';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import { useAuth } from './context/AuthContext';

import PageTransition from './components/PageTransition';
import BottomNav from './components/BottomNav';

// Admin Imports
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import AdminCMS from './pages/admin/CMS';
import AdminSEO from './pages/admin/SEO';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminLayout from './components/admin/AdminLayout';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return <Navigate to="/admin/login" replace />;
    return children;
};

const UserLayout = ({ children }) => {
    const location = useLocation();
    // Only show BottomNav on main tab pages
    const showNav = ['/', '/bills', '/cashbook', '/items', '/more'].includes(location.pathname);

    return (
        <div className="w-full max-w-[400px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 shadow-2xl relative">
            {children}
            {showNav && <BottomNav />}
        </div>
    );
};

const App = () => {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    React.useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Show nothing while checking authentication
    if (loading) {
        return null;
    }

    // Check if current path is an admin route
    // const isAdminRoute = location.pathname.startsWith('/admin'); // Not strictly needed anymore if splitting routes logic clearly

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Admin Routes - Full Width */}
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/admin/dashboard" element={
                    <AdminRoute>
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </AdminRoute>
                } />

                <Route path="/admin/tickets" element={
                    <AdminRoute>
                        <AdminLayout>
                            <AdminTickets />
                        </AdminLayout>
                    </AdminRoute>
                } />

                <Route path="/admin/cms" element={
                    <AdminRoute>
                        <AdminLayout>
                            <AdminCMS />
                        </AdminLayout>
                    </AdminRoute>
                } />

                <Route path="/admin/seo" element={
                    <AdminRoute>
                        <AdminLayout>
                            <AdminSEO />
                        </AdminLayout>
                    </AdminRoute>
                } />

                <Route path="/admin/announcements" element={
                    <AdminRoute>
                        <AdminLayout>
                            <AdminAnnouncements />
                        </AdminLayout>
                    </AdminRoute>
                } />

                <Route path="/admin/users" element={
                    <AdminRoute>
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </AdminRoute>
                } />

                {/* User Routes - Restricted to 400px */}
                <Route path="*" element={
                    <UserLayout>
                        <Routes>
                            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                            <Route path="/" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/add-customer" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <AddCustomer />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/customer/:id" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <CustomerLedger />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/customer/:id/add-entry" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <AddEntry />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/summary" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Summary />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/cashbook" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Cashbook />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/cashbook/add" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <AddCashbookEntry />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/cashbook/ledger/:categoryName" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <CategoryLedger />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/settings" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/profile" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/profile/category" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <BusinessCategory />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/profile/type" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <BusinessType />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/more" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <More />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/help" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <HelpSupport />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/about" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <AboutUs />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/privacy" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <PrivacyPolicy />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/terms" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <TermsConditions />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/items" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Items />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/items/:id" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <ItemDetails />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/bills" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Bills />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/staff" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Staff />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            <Route path="/collection" element={
                                <PageTransition>
                                    <ProtectedRoute>
                                        <Collection />
                                    </ProtectedRoute>
                                </PageTransition>
                            } />
                            {/* Redirect unknown user routes */}
                            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
                        </Routes>
                    </UserLayout>
                } />
            </Routes>
        </AnimatePresence>
    );
};

export default App;
