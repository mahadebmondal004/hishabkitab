import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Phone, Briefcase, Mail, MapPin, Store, Tag, CreditCard, Landmark, Users, ChevronRight, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({});

    // Modal State
    const [editModal, setEditModal] = useState({ show: false, field: null, value: '', label: '' });
    const [otpModal, setOtpModal] = useState({ show: false, otp: '', loading: false });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        try {
            if (!user?.id) return;
            const res = await api.get(`/auth/profile/${user.id}`);
            setProfile(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Calculate Profile Strength
    const calculateStrength = () => {
        const fields = ['name', 'mobile', 'business_name', 'email', 'business_address', 'business_category', 'business_type', 'gstin', 'bank_account_number'];
        let filled = 0;
        fields.forEach(f => {
            if (profile[f]) filled++;
        });
        return Math.round((filled / fields.length) * 100);
    };

    const strength = calculateStrength();
    const strengthLabel = strength < 40 ? 'Weak' : strength < 80 ? 'Good' : 'Excellent';
    const strengthColor = strength < 40 ? 'text-red-200' : strength < 80 ? 'text-yellow-200' : 'text-green-200';
    const strengthBarColor = strength < 40 ? 'bg-red-400' : strength < 80 ? 'bg-yellow-400' : 'bg-green-400';

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            console.log('Uploading file:', file.name, file.size, file.type);
            // Don't set Content-Type manually for FormData, let browser set boundary
            const res = await api.put(`/auth/profile/${user.id}`, formData);

            console.log('Upload success:', res.data);
            setProfile({ ...profile, profile_picture: res.data.user.profile_picture });
            updateUser(res.data.user);
            alert('Profile picture updated successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to update picture';
            alert('Upload Error: ' + msg);
        }
    };

    const handleEdit = (field, label, currentValue) => {
        if (field === 'business_category') {
            navigate('/profile/category');
        } else if (field === 'business_type') {
            navigate('/profile/type');
        } else if (field === 'details') {
            navigate('/staff');
        } else {
            setEditModal({ show: true, field, label, value: currentValue || '' });
        }
    };

    const handleVerifyEmail = async () => {
        if (!profile.email) {
            alert('Please add email address first');
            return;
        }

        setOtpModal(prev => ({ ...prev, loading: true }));
        try {
            await api.post(`/auth/verify-email/send/${profile.id}`);
            setOtpModal({ show: true, otp: '', loading: false });
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to send OTP');
            setOtpModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleVerifyOtp = async () => {
        if (otpModal.otp.length !== 6) return alert('Enter valid 6-digit OTP');

        setOtpModal(prev => ({ ...prev, loading: true }));
        try {
            const res = await api.post(`/auth/verify-email/verify/${profile.id}`, { otp: otpModal.otp });
            setProfile(res.data.user);
            updateUser(res.data.user);
            setOtpModal({ show: false, otp: '', loading: false });
            alert('Email Verified Successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Verification Failed');
            setOtpModal(prev => ({ ...prev, loading: false }));
        }
    };

    const saveField = async () => {
        setUpdating(true);
        try {
            const payload = { [editModal.field]: editModal.value };
            const res = await api.put(`/auth/profile/${user.id}`, payload);
            setProfile({ ...profile, ...payload });
            updateUser(res.data.user);
            setEditModal({ ...editModal, show: false });
        } catch (error) {
            alert('Failed to update');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const ListItem = ({ icon: Icon, label, value, field }) => (
        <div
            onClick={() => handleEdit(field, label, value)}
            className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50 transition px-2"
        >
            <div className="text-gray-500 dark:text-gray-400">
                <Icon size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center pr-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                    {field === 'email' && value && (
                        profile.is_email_verified ? (
                            <span className="text-green-600 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} strokeWidth={3} /> Verified
                            </span>
                        ) : (
                            <span className="text-orange-600 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertCircle size={10} strokeWidth={3} /> Unverified
                            </span>
                        )
                    )}
                </div>
                {value ? (
                    <p className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base line-clamp-1">{value}</p>
                ) : (
                    <button className="text-blue-600 text-xs font-bold border border-blue-600 rounded-full px-3 py-1 mt-1 hover:bg-blue-50">
                        Add Details
                    </button>
                )}
                {field === 'email' && value && !profile.is_email_verified && (
                    <div onClick={(e) => e.stopPropagation()} className="mt-2">
                        <button
                            onClick={handleVerifyEmail}
                            disabled={otpModal.loading}
                            className="bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-md active:scale-95 transition disabled:opacity-50"
                        >
                            {otpModal.loading ? 'Sending...' : 'Verify Now'}
                        </button>
                    </div>
                )}
            </div>
            <ChevronRight size={18} className="text-gray-300" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header / Profile Picture */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 pt-6 pb-8 px-4 flex flex-col items-center rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden z-10">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="w-full flex items-center justify-between mb-2 relative z-10 px-2">
                    <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">My Profile</h1>
                    <div className="w-9"></div> {/* Spacer for alignment */}
                </div>

                <div className="relative mb-3 mt-2">
                    <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-2xl">
                        {profile.profile_picture ? (
                            <img
                                src={profile.profile_picture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                            />
                        ) : (
                            <User size={56} className="text-white/80" />
                        )}
                    </div>
                    <label className="absolute bottom-1 right-1 bg-white text-blue-600 p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>

                {/* Strength Meter */}
                <div className="w-full max-w-xs mt-2 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5 px-1">
                        <span className="text-blue-100">Profile Strength: <span className={strengthColor}>{strengthLabel}</span></span>
                        <span className={strengthColor}>{strength}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${strengthBarColor} transition-all duration-1000 ease-out`}
                            style={{ width: `${strength}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4 space-y-6 relative z-0">
                {/* Personal Info */}
                <section>
                    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <User size={12} /> Personal Info
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <ListItem icon={User} label="Name" value={profile.name} field="name" />
                        <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-100 dark:border-gray-700 opacity-80 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="text-gray-400 dark:text-gray-500">
                                <Phone size={22} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Registered number</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{profile.mobile}</p>
                            </div>
                        </div>
                        <ListItem icon={Mail} label="Email Address" value={profile.email} field="email" />
                    </div>
                </section>

                {/* Business Info */}
                <section>
                    <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <Briefcase size={12} /> Business Info
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <ListItem icon={Store} label="Business name" value={profile.business_name} field="business_name" />
                        <ListItem icon={MapPin} label="Business address" value={profile.business_address} field="address" />
                        <ListItem icon={Briefcase} label="Business Category" value={profile.business_category} field="business_category" />
                        <ListItem icon={Tag} label="Business Type" value={profile.business_type} field="business_type" />
                    </div>
                </section>

                {/* Financial Info */}
                <section>
                    <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <Landmark size={12} /> Financial Info
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <ListItem icon={CreditCard} label="GSTIN" value={profile.gstin} field="gstin" />
                        <ListItem icon={Landmark} label="Bank account" value={profile.bank_account_number} field="bank_account_number" />
                        {profile.bank_account_number && (
                            <ListItem icon={Landmark} label="IFSC Code" value={profile.ifsc_code} field="ifsc_code" />
                        )}
                    </div>
                </section>

                {/* Staff Info */}
                <section>
                    <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <Users size={12} /> Staff Info
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <ListItem icon={Users} label="Details" value="" field="details" />
                    </div>
                </section>
            </div>



            {/* Edit Modal */}
            {/* OTP Verification Modal */}
            <AnimatePresence>
                {otpModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Verify Email</h2>
                            <p className="text-sm text-gray-500 mb-6">Enter the 6-digit OTP sent to {profile.email}</p>

                            <input
                                type="text"
                                maxLength="6"
                                className="w-full text-center text-2xl tracking-widest font-bold py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl mb-6 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                value={otpModal.otp}
                                onChange={(e) => setOtpModal({ ...otpModal, otp: e.target.value.replace(/\D/g, '') })}
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setOtpModal({ show: false, otp: '', loading: false })}
                                    className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={otpModal.loading || otpModal.otp.length !== 6}
                                    className="flex-1 py-3 text-white font-bold bg-gradient-to-r from-blue-600 to-red-600 rounded-xl shadow-lg shadow-blue-500/30 hover:opacity-90 transition disabled:opacity-50 disabled:shadow-none"
                                >
                                    {otpModal.loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Update {editModal.label}</h3>
                                <button onClick={() => setEditModal({ ...editModal, show: false })}><X className="text-gray-500" /></button>
                            </div>

                            {editModal.label.includes('address') ? (
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-800 dark:text-white outline-none min-h-[100px]"
                                    value={editModal.value}
                                    onChange={e => setEditModal({ ...editModal, value: e.target.value })}
                                    placeholder={`Enter ${editModal.label}`}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-800 dark:text-white outline-none"
                                    value={editModal.value}
                                    onChange={e => setEditModal({ ...editModal, value: e.target.value })}
                                    placeholder={`Enter ${editModal.label}`}
                                    autoFocus
                                />
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditModal({ ...editModal, show: false })}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveField}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex justify-center"
                                >
                                    {updating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
