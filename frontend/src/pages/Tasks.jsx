import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CheckSquare,
  PlusCircle,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  MessageSquare,
  Send,
  LifeBuoy
} from 'lucide-react';

const Tasks = () => {
  const { user, isVolunteer, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('all'); // all | mine
  const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [progressStatus, setProgressStatus] = useState('In-Progress');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      if (scopeFilter === 'mine' && isVolunteer) params.append('volunteerId', user.id);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      showToast('Error loading operational tasks: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, scopeFilter]);

  const handleAcceptTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/accept`);
      showToast('Mission accepted! Deployment underway.', 'success');
      fetchTasks();
    } catch (err) {
      showToast('Failed to accept task: ' + err.message, 'error');
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskForUpdate) return;

    try {
      await api.patch(`/tasks/${selectedTaskForUpdate._id}/progress`, {
        status: progressStatus,
        updateText: progressText || `Status changed to ${progressStatus}`
      });
      showToast('Task progress logged successfully.', 'success');
      setSelectedTaskForUpdate(null);
      setProgressText('');
      fetchTasks();
    } catch (err) {
      showToast('Failed to update progress: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Rescue Tasks & Field Operations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch, coordinate, and track field rescue teams, medical triage, and evacuations
          </p>
        </div>

        {/* View Toggle for Volunteers */}
        {isVolunteer && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                scopeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Field Tasks
            </button>
            <button
              onClick={() => setScopeFilter('mine')}
              className={`px-3 py-1.5 rounded-lg transition ${
                scopeFilter === 'mine'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Assigned Missions
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {['All', 'Assigned', 'In-Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Priority:</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                priorityFilter === pr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner text="Retrieving operational rescue tasks..." />
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No tasks found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Mission #{t._id.slice(-6)}
                  </span>
                  <SeverityBadge severity={t.priority} />
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{t.title}</h3>
                <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {t.description}
                </p>

                {t.location?.address && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{t.location.address}</span>
                  </div>
                )}

                {/* Assigned Volunteer Banner */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-500 font-medium">Assigned Responder:</span>
                  <span className="font-bold text-slate-900">
                    {t.assignedVolunteer ? t.assignedVolunteer.name : 'Unassigned (Open)'}
                  </span>
                </div>

                {/* Recent Progress Logs */}
                {t.progressUpdates?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Latest Progress Log:
                    </span>
                    <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-100">
                      <p className="font-medium">
                        "{t.progressUpdates[t.progressUpdates.length - 1].updateText}"
                      </p>
                      <span className="text-[10px] text-emerald-600 block mt-1">
                        {new Date(
                          t.progressUpdates[t.progressUpdates.length - 1].timestamp
                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge status={t.status} />

                <div className="flex items-center gap-2">
                  {/* If unassigned and volunteer wants to accept */}
                  {!t.assignedVolunteer && isVolunteer && t.status === 'Assigned' && (
                    <button
                      onClick={() => handleAcceptTask(t._id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      Accept Mission
                    </button>
                  )}

                  {/* If assigned to me or admin, update progress */}
                  {(isAdmin || (isVolunteer && t.assignedVolunteer?._id === user?.id)) &&
                    t.status !== 'Completed' && (
                      <button
                        onClick={() => {
                          setSelectedTaskForUpdate(t);
                          setProgressStatus(t.status === 'Assigned' ? 'In-Progress' : 'Completed');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                      >
                        Log Progress / Complete
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Log Task Progress */}
      {selectedTaskForUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Update Task Progress
            </h3>
            <p className="text-xs text-slate-500 mb-4 truncate font-medium">
              Mission: {selectedTaskForUpdate.title}
            </p>

            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Task Status *
                </label>
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed ✓</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Field Progress Update / Activity Note *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Evacuation completed for 6 individuals, safe transfer to shelter done."
                  value={progressText}
                  onChange={(e) => setProgressText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForUpdate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
