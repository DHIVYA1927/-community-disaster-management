import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2
} from 'lucide-react';

const Disasters = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'All') params.append('type', filterType);
      if (filterSeverity !== 'All') params.append('severity', filterSeverity);
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/disasters?${params.toString()}`);
      setDisasters(res.data.disasters || []);
    } catch (err) {
      showToast('Error loading disaster reports: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, [filterType, filterSeverity, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDisasters();
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await api.patch(`/disasters/${id}/status`, { status: newStatus });
      showToast(`Disaster status updated to ${newStatus}`, 'success');
      setDisasters((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteDisaster = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disaster record?')) return;
    try {
      await api.delete(`/disasters/${id}`);
      showToast('Disaster report deleted.', 'success');
      setDisasters((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Disaster Incident Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified emergency occurrences, severity levels, and on-ground relief operations
          </p>
        </div>

        <Link
          to="/report-disaster"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-900/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Disaster</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by disaster title, description, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Disaster Types</option>
            {['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide', 'Tsunami', 'Other'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Severities</option>
            {['Critical', 'High', 'Medium', 'Low'].map((s) => (
              <option key={s} value={s}>
                {s} Severity
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            {['Pending', 'Verified', 'In-Progress', 'Resolved', 'Rejected'].map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disasters Content */}
      {loading ? (
        <LoadingSpinner text="Retrieving disaster occurrences..." />
      ) : disasters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Disaster Incidents Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No incidents matched your query. Try resetting filters or submit a new disaster report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {disasters.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
            >
              {/* Image banner if present */}
              {d.imageUrl && (
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={d.imageUrl}
                    alt={d.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase bg-slate-900/80 text-white backdrop-blur-sm">
                      {d.disasterType}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <SeverityBadge severity={d.severityLevel} />
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col">
                {!d.imageUrl && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase bg-rose-50 text-rose-700">
                      {d.disasterType}
                    </span>
                    <SeverityBadge severity={d.severityLevel} />
                  </div>
                )}

                <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug">
                  {d.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 mb-3 flex-1">
                  {d.incidentDescription}
                </p>

                {/* Location & Affected info */}
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 text-[11px] text-slate-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{d.location?.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.affectedPeople?.toLocaleString()} people</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(d.reportDateTime || d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <StatusBadge status={d.status} />

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/disasters/${d._id}`}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {isAdmin && (
                      <>
                        {d.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(d._id, 'Verified')}
                            disabled={updatingId === d._id}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Verify Incident"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {d.status === 'Verified' && (
                          <button
                            onClick={() => handleStatusUpdate(d._id, 'In-Progress')}
                            disabled={updatingId === d._id}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="Set In-Progress"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                        {d.status === 'In-Progress' && (
                          <button
                            onClick={() => handleStatusUpdate(d._id, 'Resolved')}
                            disabled={updatingId === d._id}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Mark Resolved"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDisaster(d._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Delete Disaster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Disasters;
