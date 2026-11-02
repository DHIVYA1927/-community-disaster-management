import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LifeBuoy,
  Search,
  Filter,
  PlusCircle,
  Phone,
  Users,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle,
  HandHeart
} from 'lucide-react';

const EmergencyRequests = () => {
  const { user, isAdmin, isVolunteer, isCitizen } = useAuth();
  const { showToast } = useAlert();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReqForAssign, setSelectedReqForAssign] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterUrgency !== 'All') params.append('urgency', filterUrgency);
      if (filterType !== 'All') params.append('requestType', filterType);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/emergency-requests?${params.toString()}`);
      setRequests(res.data.requests || []);
    } catch (err) {
      showToast('Error loading emergency requests: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/volunteers');
        setVolunteers(res.data.volunteers || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchVolunteers();
  }, [filterStatus, filterUrgency, filterType]);

  const handleVolunteerSelfAccept = async (reqId) => {
    try {
      await api.patch(`/emergency-requests/${reqId}/status`, {
        status: 'In-Progress'
      });
      showToast('You have accepted this emergency assistance mission!', 'success');
      fetchRequests();
    } catch (err) {
      showToast('Action failed: ' + err.message, 'error');
    }
  };

  const handleAssignVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVolunteerId || !selectedReqForAssign) return;

    try {
      await api.patch(`/emergency-requests/${selectedReqForAssign._id}/assign`, {
        volunteerId: selectedVolunteerId,
        status: 'Assigned'
      });
      showToast('Volunteer assigned & rescue task created.', 'success');
      setSelectedReqForAssign(null);
      setSelectedVolunteerId('');
      fetchRequests();
    } catch (err) {
      showToast('Assignment failed: ' + err.message, 'error');
    }
  };

  const handleStatusUpdate = async (reqId, newStatus) => {
    try {
      await api.patch(`/emergency-requests/${reqId}/status`, { status: newStatus });
      showToast(`Request marked as ${newStatus}`, 'success');
      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status: newStatus } : r))
      );
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
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Emergency Assistance (SOS) Requests
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isCitizen
              ? 'Track your submitted distress calls and view field responder dispatches'
              : 'Direct citizen distress calls requiring immediate evacuation, food, water, or medical rescue'}
          </p>
        </div>

        <Link
          to="/request-help"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-900/30 animate-emergency-pulse"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Emergency Request (SOS)</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description, address, or contact phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={fetchRequests}
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            {['Pending', 'Assigned', 'In-Progress', 'Fulfilled', 'Cancelled'].map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Urgency Levels</option>
            {['Critical', 'High', 'Medium', 'Low'].map((u) => (
              <option key={u} value={u}>
                {u} Urgency
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Aid Categories</option>
            {['Rescue', 'Medical', 'Food', 'Drinking Water', 'Shelter', 'Clothes', 'Other'].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Requests Grid / List */}
      {loading ? (
        <LoadingSpinner text="Retrieving emergency distress requests..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Emergency Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isCitizen
              ? 'You have not submitted any active emergency help requests.'
              : 'There are no assistance requests matching your current filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-extrabold uppercase bg-rose-50 text-rose-700 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    {r.requestType} Help Needed
                  </span>
                  <SeverityBadge severity={r.urgencyLevel} />
                </div>

                <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                  "{r.description}"
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span><b>{r.peopleCount}</b> persons affected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span><b>{r.contactPhone}</b></span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{r.location?.address}</span>
                  </div>
                </div>

                {r.assignedVolunteer && (
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      Assigned: {r.assignedVolunteer?.name}
                    </span>
                    <span className="text-blue-700">{r.assignedVolunteer?.phone}</span>
                  </div>
                )}
              </div>

              {/* Status and Action bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge status={r.status} />

                <div className="flex items-center gap-2">
                  {/* Volunteer quick action */}
                  {isVolunteer && r.status === 'Pending' && (
                    <button
                      onClick={() => handleVolunteerSelfAccept(r._id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <HandHeart className="w-3.5 h-3.5" />
                      Accept Mission
                    </button>
                  )}

                  {/* Admin assignment trigger */}
                  {isAdmin && (
                    <button
                      onClick={() => setSelectedReqForAssign(r)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      Assign Volunteer
                    </button>
                  )}

                  {/* Status toggle for Admin / Assigned Volunteer */}
                  {(isAdmin || (isVolunteer && r.assignedVolunteer?._id === user?.id)) && (
                    <>
                      {r.status === 'In-Progress' && (
                        <button
                          onClick={() => handleStatusUpdate(r._id, 'Fulfilled')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Admin Assign Volunteer to Request */}
      {selectedReqForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Dispatch Volunteer to Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an available volunteer responder to mobilize for this distress call.
            </p>

            <form onSubmit={handleAssignVolunteerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Choose Volunteer:
                </label>
                <select
                  required
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Available Volunteer --</option>
                  {volunteers.map((v) => (
                    <option key={v.user?._id || v._id} value={v.user?._id}>
                      {v.user?.name} ({v.availabilityStatus}) - Skills: {v.skills?.slice(0, 2).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReqForAssign(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20"
                >
                  Assign & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRequests;
