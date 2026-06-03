import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    dispatch(loginUser(data)).then((res) => {
      if (!res.error) {
        navigate('/admin/dashboard');
      }
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]"></div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-slate-900/60 p-8 shadow-glass-dark backdrop-blur-md">
        
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white font-extrabold text-2xl shadow-lg shadow-brand-500/30 mb-3">
            Ω
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-400">Access the College ERP + LMS Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="e.g. superadmin@erp.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition duration-150 focus:border-brand-500 focus:bg-slate-850"
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-400">{errors.email.message}</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-brand-400 hover:text-brand-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition duration-150 focus:border-brand-500 focus:bg-slate-850"
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white transition duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400 mb-2 font-medium">Demo Administrator Credentials:</p>
          <div className="rounded-lg bg-slate-850 p-3 text-xs text-slate-500 space-y-1">
            <p><span className="font-semibold text-slate-400">Email:</span> superadmin@erp.com</p>
            <p><span className="font-semibold text-slate-400">Password:</span> admin123</p>
          </div>
        </div>

        {/* Register Redirect */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Need onboarding?{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
            Register College Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
