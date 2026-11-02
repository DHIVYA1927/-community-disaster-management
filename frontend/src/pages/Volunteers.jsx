import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  CheckCircle,
  MapPin,
  HeartHandshake,
  Activity
} from 'lucide-react';

const Volunteers = () => {
  const { user, isVolunteer, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');

  const skillsList = [
    'First Aid',
    'Search & Rescue',
    'Medical Care',
    'Boat Operation',
    'Logistics',
    'Cooking & Distribution',
    'Heavy Machinery'
  ];

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (skillFilter !== 'All') params.append('skill', skillFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/volunteers?${params.toString()}`);
      setVolunteers(res.data.volunteers || []);
    } catch (err) {
      showToast('Error loading volunteers: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter, skillFilter]);

  const handleUpdateMyStatus = async (newStatus) => {
    try {
      await api.put('/auth/profile', { availabilityStatus: newStatus });
      showToast(`Your status updated to ${newStatus}`, 'success');
      fetchVolunteers();
    } catch (err) {
      showToast('Status update failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Community Volunteers & First Responders
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered volunteers, medical workers, boat operators, and logistics teams mobilized for emergency operations
          </p>
        </div>

        {/* Volunteer Self Status Switcher */}
        {isVolunteer && (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">My Status:</span>
            {['Available', 'Busy', 'On-Mission'].map((st) => (
              <button
                key={st}
                onClick={() => handleUpdateMyStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  user?.volunteerProfile?.availabilityStatus === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by volunteer name, location, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVolunteers()}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={fetchVolunteers}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="All">All Availabilities</option>
            <option value="Available">Available Only</option>
            <option value="On-Mission">On-Mission</option>
            <option value="Busy">Busy</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="All">All Skill Specializations</option>
            {skillsList.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Volunteer Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving volunteers directory..." />
      ) : volunteers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No volunteers match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {volunteers.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        v.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          v.user?.name || 'Volunteer'
                        )}&background=8b5cf6&color=fff`
                      }
                      alt=""
                      className="w-11 h-11 rounded-full object-cover border border-purple-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {v.user?.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded-full border border-purple-200">
                          {v.badge || 'First Responder'}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                          {v.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.availabilityStatus === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.availabilityStatus === 'On-Mission'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ● {v.availabilityStatus}
                  </span>
                </div>

                {/* Contact info */}
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-[11px] text-slate-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{v.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.contactNumber || v.user?.phone || 'No direct phone'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{v.address || v.user?.address || 'City Zone'}</span>
                  </div>
                </div>

                {/* Skills Tags */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Capabilities:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {v.skills?.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-100"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tasks Completed Counter */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  Missions Accomplished:
                </span>
                <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {v.totalTasksCompleted || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Volunteers;
