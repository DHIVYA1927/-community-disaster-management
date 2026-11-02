import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Bell,
  PlusCircle,
  AlertTriangle,
  Flame,
  Info,
  CheckCircle,
  Radio,
  Send,
  Trash2
} from 'lucide-react';

const Alerts = () => {
  const { user, isAdmin } = useAuth();
  const { showToast, refreshAlerts } = useAlert();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Emergency Alert',
    severity: 'Warning',
    targetRole: 'all'
  });

  const fetchAlertsList = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterSeverity !== 'All') params.append('severity', filterSeverity);

      const res = await api.get(`/notifications?${params.toString()}`);
      setAlerts(res.data.notifications || []);
    } catch (err) {
      showToast('Error loading alerts: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsList();
  }, [filterSeverity]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    try {
      await api.post('/notifications', formData);
      showToast('Emergency broadcast published successfully!', 'success');
      setShowModal(false);
      setFormData({
        title: '',
        message: '',
        type: 'Emergency Alert',
        severity: 'Warning',
        targetRole: 'all'
      });
      fetchAlertsList();
      refreshAlerts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Broadcast failed.', 'error');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Delete this broadcast notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      showToast('Notification deleted.', 'success');
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      refreshAlerts();
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
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Disaster Alerts & Public Broadcasts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time public safety bulletins, evacuation notices, weather advisories, and relief shelter announcements
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-900/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Broadcast Alert</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 ml-2">Severity:</span>
        {['All', 'Critical', 'High', 'Warning', 'Info'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSeverity === sev
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <LoadingSpinner text="Retrieving broadcasts & disaster alerts..." />
      ) : alerts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No active alerts recorded at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <div
              key={a._id}
              className={`p-5 rounded-2xl border shadow-sm transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                a.severity === 'Critical'
                  ? 'bg-rose-50/70 border-rose-200'
                  : a.severity === 'High'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    a.severity === 'Critical'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : a.severity === 'High'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/10 text-slate-800">
                      {a.type}
                    </span>
                    <SeverityBadge severity={a.severity} />
                    <span className="text-[11px] text-slate-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {a.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    {a.message}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDeleteAlert(a._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition self-end sm:self-center"
                  title="Delete Bulletin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publish Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Publish Emergency Alert Broadcast
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatches an immediate alert notification to all citizens and volunteers.
            </p>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH FLOOD WARNING: Evacuate Riverbank Zone"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alert Category
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Emergency Alert">Emergency Alert</option>
                    <option value="Shelter Notice">Shelter Notice</option>
                    <option value="Resource Allocation">Resource Allocation</option>
                    <option value="General Announcement">General Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide precise instructions, safety steps, contact telephone lines, or evacuation rendezvous points..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
