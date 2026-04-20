import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!token) {
            setError('Invalid or missing token');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setMessage('Password reset successfully. You can now login.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Token may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark p-6">
                <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/5 shadow-2xl text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Invalid Access</h2>
                    <p className="text-slate-400 mb-6">No reset token was found in the URL.</p>
                    <button onClick={() => navigate('/login')} className="btn-primary w-full h-12">Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark p-6">
            <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/5 shadow-2xl animate-in zoom-in-95 duration-300">
                <header className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-100 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic">
                        New Password
                    </h2>
                    <p className="text-slate-400 mt-2">Create a secure new password for your account.</p>
                </header>

                {error && (
                    <div className="flex items-center gap-3 p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="flex items-center gap-3 p-4 mb-6 rounded-2xl bg-green-500/10 border border-green-500/10 text-green-400 animate-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="password"
                                className="input-field w-full pl-12 h-14 bg-white/5 border-white/5 hover:border-white/10"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="password"
                                className="input-field w-full pl-12 h-14 bg-white/5 border-white/5 hover:border-white/10"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-primary h-14 font-bold flex items-center justify-center group"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Update Password
                                <Save className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
