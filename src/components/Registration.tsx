
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type FormState = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function Registration(): React.ReactElement {
    const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validate = (values: FormState) => {
        const e: Partial<FormState> = {};
        if (!values.name.trim()) e.name = 'Name is required';
        else if (values.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!values.email.trim()) e.email = 'Email is required';
        else if (!emailRe.test(values.email)) e.email = 'Enter a valid email';

        if (!values.password) e.password = 'Password is required';
        else if (values.password.length < 10) e.password = 'Password must be at least 10 characters';
        else if (!/[A-Z]/.test(values.password)) e.password = 'Password must include at least one uppercase letter';
        else if (!/[!@#$%^&*(),.?"{}|<>\[\]\\/\\;':_`~\-+=]/.test(values.password)) e.password = 'Password must include at least one special character';

        if (!values.confirmPassword) e.confirmPassword = 'Please confirm your password';
        else if (values.confirmPassword !== values.password) e.confirmPassword = 'Passwords do not match';

        return e;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        const validation = validate(form);
        setErrors(validation);
        if (Object.keys(validation).length) return;

        setSubmitting(true);
        try {
            await new Promise((res) => setTimeout(res, 900));
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({ ...form, id: Date.now() });
            localStorage.setItem('users', JSON.stringify(users));

            setSuccess('Registration successful!');
            setForm({ name: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setSuccess('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-10 w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50">
                        <i className="ri-file-list-line text-white text-3xl"></i>
                    </div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-2">
                        Create Account
                    </h1>
                    <p className="text-white/80 text-sm font-medium">Register to access your dashboard and upload PDFs.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white/90 uppercase tracking-wide">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="ri-user-line text-white/50 text-lg"></i>
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                aria-invalid={!!errors.name}
                                className="w-full pl-12 pr-12 py-4 bg-transparent border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all backdrop-blur-sm font-medium"
                            />
                        </div>
                        {errors.name && <p className="mt-2 text-red-400 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white/90 uppercase tracking-wide">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="ri-mail-line text-white/50 text-lg"></i>
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                aria-invalid={!!errors.email}
                                className="w-full pl-12 pr-12 py-4 bg-transparent border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all backdrop-blur-sm font-medium"
                            />
                        </div>
                        {errors.email && <p className="mt-2 text-red-400 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white/90 uppercase tracking-wide">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="ri-lock-line text-white/50 text-lg"></i>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                aria-invalid={!!errors.password}
                                className="w-full pl-12 pr-12 py-4 bg-transparent border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all backdrop-blur-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 mt-3"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <i className="ri-eye-off-line text-white text-lg "></i>
                                ) : (
                                    <i className="ri-eye-line text-white text-lg "></i>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="mt-2 text-red-400 text-sm">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white/90 uppercase tracking-wide">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="ri-checkbox-circle-line text-white/50 text-lg"></i>
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                aria-invalid={!!errors.confirmPassword}
                                className="w-full pl-12 pr-12 py-4 bg-transparent border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all backdrop-blur-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 mt-3"
                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showConfirm ? (
                                    <i className="ri-eye-off-line text-white text-lg"></i>
                                ) : (
                                    <i className="ri-eye-line text-white text-lg"></i>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-2 text-red-400 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    {success && (
                        <div className="bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-100 text-sm text-center py-3 px-4 rounded-2xl backdrop-blur-sm font-medium">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 text-lg uppercase tracking-wide"
                    >
                        {submitting ? 'Creating account...' : 'Create account'}
                    </button>

                    <p className="mt-4 text-xs text-white/60 text-center font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white font-bold underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}