import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  LifeBuoy,
  Home,
  Package,
  Share2,
  CheckSquare,
  Users,
  Bell,
  UserCheck,
  ShieldAlert,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isVolunteer, isCitizen } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="font-bold text-white text-sm">ResQHub Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Overview & Operations
            </p>
            <div className="space-y-1">
              <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
                <LayoutDashboard className="w-4 h-4 mr-3 text-slate-400" />
                Dashboard & Analytics
              </NavLink>
              <NavLink to="/map" onClick={onClose} className={navItemClass}>
                <MapPin className="w-4 h-4 mr-3 text-rose-400" />
                Disaster Live Map
              </NavLink>
              <NavLink to="/disasters" onClick={onClose} className={navItemClass}>
                <AlertTriangle className="w-4 h-4 mr-3 text-amber-400" />
                Disaster Incidents
              </NavLink>
              <NavLink to="/emergency-requests" onClick={onClose} className={navItemClass}>
                <LifeBuoy className="w-4 h-4 mr-3 text-rose-500" />
                Emergency Requests (SOS)
              </NavLink>
              <NavLink to="/shelters" onClick={onClose} className={navItemClass}>
                <Home className="w-4 h-4 mr-3 text-emerald-400" />
                Relief Camps & Shelters
              </NavLink>
            </div>
          </div>

          {/* Resources & Relief Allocation */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Logistics & Resources
            </p>
            <div className="space-y-1">
              <NavLink to="/resources" onClick={onClose} className={navItemClass}>
                <Package className="w-4 h-4 mr-3 text-cyan-400" />
                Resource Inventory
              </NavLink>
              {(isAdmin || isVolunteer) && (
                <NavLink to="/allocations" onClick={onClose} className={navItemClass}>
                  <Share2 className="w-4 h-4 mr-3 text-indigo-400" />
                  Resource Allocation
                </NavLink>
              )}
            </div>
          </div>

          {/* Volunteer & Task Dispatch */}
          {(isVolunteer || isAdmin) && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Rescue Operations
              </p>
              <div className="space-y-1">
                <NavLink to="/tasks" onClick={onClose} className={navItemClass}>
                  <CheckSquare className="w-4 h-4 mr-3 text-emerald-500" />
                  Rescue Tasks
                </NavLink>
                <NavLink to="/volunteers" onClick={onClose} className={navItemClass}>
                  <Users className="w-4 h-4 mr-3 text-purple-400" />
                  Volunteers Directory
                </NavLink>
              </div>
            </div>
          )}

          {/* Citizen Actions */}
          {isCitizen && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Citizen Portal
              </p>
              <div className="space-y-1">
                <NavLink to="/request-help" onClick={onClose} className={navItemClass}>
                  <LifeBuoy className="w-4 h-4 mr-3 text-rose-400" />
                  Request Assistance
                </NavLink>
                <NavLink to="/report-disaster" onClick={onClose} className={navItemClass}>
                  <AlertTriangle className="w-4 h-4 mr-3 text-amber-400" />
                  Report New Disaster
                </NavLink>
              </div>
            </div>
          )}

          {/* Announcements & Admin Management */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Communications
            </p>
            <div className="space-y-1">
              <NavLink to="/alerts" onClick={onClose} className={navItemClass}>
                <Bell className="w-4 h-4 mr-3 text-yellow-400" />
                Disaster Alerts & Notices
              </NavLink>
              {isAdmin && (
                <NavLink to="/users" onClick={onClose} className={navItemClass}>
                  <UserCheck className="w-4 h-4 mr-3 text-blue-400" />
                  Manage Users & Roles
                </NavLink>
              )}
            </div>
          </div>
        </div>

        {/* Current User Quick Info in Sidebar Footer */}
        {user && (
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-2.5">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`
                }
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
