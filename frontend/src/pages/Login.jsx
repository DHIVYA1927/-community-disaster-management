import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { ShieldAlert, LogIn, Lock, Mail, UserCheck, HeartHandshake, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickDemoLogin } = useAuth();
  const { showToast } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Signed in successfully!', 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to sign in. Check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    try {
      setLoading(true);
      await quickDemoLogin(role);
      showToast(`Signed in as demo ${role.toUpperCase()}!`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showToast('Demo login error: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 shadow-xl shadow-rose-950/50 mb-3 text-white">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ResQ<span className="text-rose-500">Hub</span> Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
          Community Disaster Management & Resource Allocation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        {/* Demo Fast Login Box for Evaluators */}
        <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>⚡ 1-Click Fast Demo Login</span>
            <span className="text-[10px] text-slate-400 font-normal">For testing & review</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('administrator')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-[11px] font-bold transition shadow-sm hover:border-blue-500"
            >
              <UserCheck className="w-4 h-4 text-blue-400 mb-1" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('volunteer')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-[11px] font-bold transition shadow-sm hover:border-emerald-500"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400 mb-1" />
              <span>Volunteer</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('citizen')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-[11px] font-bold transition shadow-sm hover:border-amber-500"
            >
              <User className="w-4 h-4 text-amber-400 mb-1" />
              <span>Citizen</span>
            </button>
          </div>
        </div>

        {/* Standard Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-2xl border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl shadow-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In to System
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
