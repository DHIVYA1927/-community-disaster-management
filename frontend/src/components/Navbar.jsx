import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import {
  ShieldAlert,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  AlertTriangle,
  LifeBuoy,
  PlusCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin, isVolunteer, isCitizen } = useAuth();
  const { alerts, unreadAlertsCount } = useAlert();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const criticalAlerts = alerts.filter((a) => a.severity === 'Critical');

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Urgent Alert Marquee Banner if critical disaster alert is active */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-white text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
              Emergency
            </span>
            <span className="truncate">{criticalAlerts[0].title}: {criticalAlerts[0].message}</span>
          </div>
          <Link
            to="/alerts"
            className="text-white underline hover:text-rose-100 flex-shrink-0 text-xs font-bold pl-3"
          >
            View Alerts &rarr;
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  ResQ<span className="text-rose-400">Hub</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 rounded">
                    CDM-RAS
                  </span>
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
                  Disaster Management & Resource Allocation
                </span>
              </div>
            </Link>
          </div>

          {/* Center/Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Emergency Action Buttons */}
            {isCitizen && (
              <Link
                to="/request-help"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm animate-emergency-pulse"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Request Help (SOS)</span>
              </Link>
            )}

            <Link
              to="/report-disaster"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Disaster</span>
            </Link>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                    <span className="font-bold text-sm">Disaster Alerts & Bulletins</span>
                    <Link
                      to="/alerts"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      View all ({alerts.length})
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No active alerts at this moment.
                      </div>
                    ) : (
                      alerts.slice(0, 5).map((a) => (
                        <div key={a._id} className="p-3 hover:bg-slate-50 transition text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                a.severity === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : a.severity === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {a.severity}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">{a.title}</p>
                          <p className="text-slate-600 line-clamp-2 mt-0.5">{a.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 focus:outline-none transition"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1e293b&color=f8fafc`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                    <span className="text-[10px] font-medium text-amber-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <User className="w-4 h-4 mr-2.5 text-slate-500" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
