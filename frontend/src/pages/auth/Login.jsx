import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';
import { Mail, Lock, Loader2, BookOpen } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error } = useSelector((state) => state.auth);

  const onSubmit = (data) => {
    dispatch(loginUser(data)).then((res) => {
      if (!res.error) {
        navigate('/admin/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-glass-light dark:shadow-glass-dark border border-white/20 dark:border-white/10 z-10 relative">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <BookOpen className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
            Sign in to access your Campus Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white/50 dark:bg-dark-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="e.g. superadmin@erp.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-16 py-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white/50 dark:bg-dark-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-brand-600 hover:text-brand-500 dark:text-brand-400 focus:outline-none font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-dark-300 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/30 dark:shadow-brand-900/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="mt-6 border-t border-gray-200 dark:border-dark-700 pt-6">
            <p className="text-xs text-gray-500 dark:text-dark-400 mb-2 font-medium text-center">Demo Administrator Credentials:</p>
            <div className="rounded-lg bg-gray-100 dark:bg-dark-800 p-3 text-xs text-gray-600 dark:text-dark-300 space-y-1 text-center font-mono">
              <p><span className="font-semibold text-gray-500 dark:text-dark-400">Email:</span> superadmin@erp.com</p>
              <p><span className="font-semibold text-gray-500 dark:text-dark-400">Password:</span> admin123</p>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Login;
