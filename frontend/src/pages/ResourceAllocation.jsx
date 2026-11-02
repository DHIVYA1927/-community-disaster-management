import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Share2,
  PlusCircle,
  Truck,
  CheckCircle,
  Package,
  Home,
  AlertTriangle,
  Calendar,
  Filter,
  ArrowRight,
  Printer
} from 'lucide-react';

const ResourceAllocation = () => {
  const { user, isAdmin, isVolunteer } = useAuth();
  const { showToast } = useAlert();
  const [allocations, setAllocations] = useState([]);
  const [resources, setResources] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    resourceId: '',
    disasterId: '',
    shelterId: '',
    allocatedQuantity: 100,
    purpose: '',
    priority: 'High',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, resRes, disRes, sheltRes] = await Promise.all([
        api.get(`/allocations${statusFilter !== 'All' ? `?status=${statusFilter}` : ''}`),
        api.get('/resources'),
        api.get('/disasters'),
        api.get('/shelters')
      ]);

      setAllocations(allocRes.data.allocations || []);
      setResources(resRes.data.resources || []);
      setDisasters(disRes.data.disasters || []);
      setShelters(sheltRes.data.shelters || []);
    } catch (err) {
      showToast('Error loading allocations: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const selectedResourceItem = resources.find((r) => r._id === formData.resourceId);

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    if (!formData.resourceId || !formData.allocatedQuantity || !formData.purpose) {
      showToast('Please select a resource, specify quantity, and state purpose.', 'warning');
      return;
    }

    try {
      await api.post('/allocations', formData);
      showToast('Resources allocated successfully and deducted from stock.', 'success');
      setShowAllocateModal(false);
      setFormData({
        resourceId: '',
        disasterId: '',
        shelterId: '',
        allocatedQuantity: 100,
        purpose: '',
        priority: 'High',
        notes: ''
      });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Allocation failed.', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/allocations/${id}/status`, { status: newStatus });
      showToast(`Distribution updated to ${newStatus}`, 'success');
      setAllocations((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      showToast('Failed to update allocation: ' + err.message, 'error');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Resource Allocation & Logistics Dispatch
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Allocate food rations, water, medicines, and rescue gear to disaster zones and relief camps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            title="Print or Export Allocation Report"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAllocateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-900/30"
            >
              <PlusCircle className="w-4 h-4" />
              New Resource Allocation
            </button>
          )}
        </div>
      </div>

      {/* Filter by Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {['All', 'Allocated', 'Dispatched', 'In-Transit', 'Delivered', 'Cancelled'].map((st) => (
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
        <span className="text-xs text-slate-400 font-medium">
          Showing {allocations.length} records
        </span>
      </div>

      {/* Allocation List / Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving resource allocation records..." />
      ) : allocations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No resource allocations logged yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Dispatched Item</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5">Target Destination / Camp</th>
                  <th className="px-4 py-3.5">Purpose</th>
                  <th className="px-4 py-3.5">Allocated By / Date</th>
                  <th className="px-4 py-3.5">Logistics Status</th>
                  <th className="px-4 py-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allocations.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{a.resource?.resourceName}</p>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">
                            {a.resource?.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <span className="text-sm font-extrabold text-blue-600">
                        {a.allocatedQuantity?.toLocaleString()}
                      </span>{' '}
                      <span className="text-[11px] text-slate-500 font-normal">{a.resource?.unit}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      {a.shelter ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Home className="w-3.5 h-3.5" />
                          <span>{a.shelter?.name}</span>
                        </div>
                      ) : a.disaster ? (
                        <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{a.disaster?.title}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">General Distribution</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      {a.purpose}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      <p className="font-semibold text-slate-800">{a.allocatedBy?.name}</p>
                      <span>{new Date(a.dispatchDate || a.createdAt).toLocaleDateString()}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {a.status === 'Allocated' && (
                        <button
                          onClick={() => handleUpdateStatus(a._id, 'Dispatched')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition"
                        >
                          Dispatch &rarr;
                        </button>
                      )}
                      {a.status === 'Dispatched' && (
                        <button
                          onClick={() => handleUpdateStatus(a._id, 'In-Transit')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition"
                        >
                          In-Transit &rarr;
                        </button>
                      )}
                      {a.status === 'In-Transit' && (
                        <button
                          onClick={() => handleUpdateStatus(a._id, 'Delivered')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                        >
                          Mark Delivered ✓
                        </button>
                      )}
                      {a.status === 'Delivered' && (
                        <span className="text-[11px] font-bold text-emerald-600">Delivered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Resource Allocation Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Dispatch Resource Allocation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate provisions from central inventory to disaster victims or relief shelters.
            </p>

            <form onSubmit={handleCreateAllocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Resource from Inventory *
                </label>
                <select
                  required
                  value={formData.resourceId}
                  onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="">-- Choose Inventory Item --</option>
                  {resources.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.resourceName} ({r.category}) - Available: {r.availableQuantity} {r.unit}
                    </option>
                  ))}
                </select>
                {selectedResourceItem && (
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">
                    Available in stock: {selectedResourceItem.availableQuantity} {selectedResourceItem.unit} (At {selectedResourceItem.storageLocation})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Allocation Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedResourceItem?.availableQuantity || 999999}
                    required
                    value={formData.allocatedQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, allocatedQuantity: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Disaster Zone
                  </label>
                  <select
                    value={formData.disasterId}
                    onChange={(e) => setFormData({ ...formData, disasterId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="">-- None / Select Disaster --</option>
                    {disasters.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.title} ({d.disasterType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Relief Camp / Shelter
                  </label>
                  <select
                    value={formData.shelterId}
                    onChange={(e) => setFormData({ ...formData, shelterId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="">-- None / Select Shelter --</option>
                    {shelters.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} (Occ: {s.currentOccupancy}/{s.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose / Distribution Goal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily meals distribution for 500 flood displaced citizens"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;
