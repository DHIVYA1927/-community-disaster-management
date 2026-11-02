import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Share2,
  AlertTriangle,
  Edit,
  Trash2,
  Box,
  Droplet,
  HeartPulse,
  Shirt,
  Shield,
  Layers
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food packets': Box,
  'Drinking water': Droplet,
  'Medicines': HeartPulse,
  'Clothes': Shirt,
  'Blankets': Layers,
  'First aid kits': Shield,
  'Rescue equipment': AlertTriangle
};

const Resources = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [resources, setResources] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [modalForm, setModalForm] = useState({
    resourceName: '',
    category: 'Food packets',
    unit: 'Packets',
    availableQuantity: 100,
    requiredQuantity: 200,
    storageLocation: 'Central Civil Defense Depot',
    minimumThreshold: 20
  });

  const categories = [
    'Food packets',
    'Drinking water',
    'Medicines',
    'Clothes',
    'Blankets',
    'First aid kits',
    'Rescue equipment'
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'All') params.append('category', filterCategory);
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/resources?${params.toString()}`);
      setResources(res.data.resources || []);
      setTotals(res.data.totals || {});
    } catch (err) {
      showToast('Error loading resources: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterCategory, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setModalForm({
      resourceName: '',
      category: 'Food packets',
      unit: 'Packets',
      availableQuantity: 100,
      requiredQuantity: 200,
      storageLocation: 'Central Civil Defense Depot',
      minimumThreshold: 20
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (r) => {
    setEditingResource(r);
    setModalForm({
      resourceName: r.resourceName,
      category: r.category,
      unit: r.unit,
      availableQuantity: r.availableQuantity,
      requiredQuantity: r.requiredQuantity,
      storageLocation: r.storageLocation,
      minimumThreshold: r.minimumThreshold || 20
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource._id}`, modalForm);
        showToast('Resource item updated.', 'success');
      } else {
        await api.post('/resources', modalForm);
        showToast('New resource added to inventory.', 'success');
      }
      setShowModal(false);
      fetchResources();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource from inventory?')) return;
    try {
      await api.delete(`/resources/${id}`);
      showToast('Resource deleted from inventory.', 'success');
      fetchResources();
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
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Emergency Resource Inventory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track supplies, food packets, drinking water, medicines, and rescue equipment across storage depots
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Resource
              </button>
              <Link
                to="/allocations"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-900/30"
              >
                <Share2 className="w-4 h-4" />
                Allocate Resources
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Available Stock</span>
          <p className="text-xl font-extrabold text-blue-600 mt-1">
            {totals.totalAvailable?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Allocated / Dispatched</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {totals.totalAllocated?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Estimated Target Demand</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {totals.totalRequired?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Low-Stock Warnings</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            {totals.lowStockCount || 0}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by resource name, warehouse location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchResources}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="All">All 7 Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="All">All Stock Statuses</option>
            <option value="In-Stock">In-Stock</option>
            <option value="Low-Stock">Low-Stock</option>
            <option value="Out-of-Stock">Out-of-Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <LoadingSpinner text="Loading resource inventory catalog..." />
      ) : resources.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No resources found matching criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Resource Name & Category</th>
                  <th className="px-4 py-3.5">Available Stock</th>
                  <th className="px-4 py-3.5">Allocated</th>
                  <th className="px-4 py-3.5">Required Target</th>
                  <th className="px-4 py-3.5">Storage Location</th>
                  <th className="px-4 py-3.5">Distribution Status</th>
                  {isAdmin && <th className="px-4 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resources.map((r) => {
                  const CategoryIcon = CATEGORY_ICONS[r.category] || Box;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{r.resourceName}</p>
                            <span className="text-[11px] text-slate-500 font-medium">{r.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <span className="text-sm font-extrabold text-blue-600">
                          {r.availableQuantity?.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500 font-normal">{r.unit}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-emerald-600">
                          {r.allocatedQuantity?.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">{r.unit}</span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {r.requiredQuantity?.toLocaleString()} {r.unit}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="font-medium text-xs text-slate-800">{r.storageLocation}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={r.distributionStatus} />
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                            title="Edit Stock"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(r._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              {editingResource ? 'Edit Resource Stock' : 'Add New Inventory Resource'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter resource specifications, category, units, and warehouse storage details.
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resource Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready-to-Eat Emergency Food Packets"
                  value={modalForm.resourceName}
                  onChange={(e) => setModalForm({ ...modalForm, resourceName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Measurement Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Packets / Liters / Kits / Sets"
                    value={modalForm.unit}
                    onChange={(e) => setModalForm({ ...modalForm, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={modalForm.availableQuantity}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, availableQuantity: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Required Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.requiredQuantity}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, requiredQuantity: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={modalForm.minimumThreshold}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, minimumThreshold: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Depot / Storage Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Warehouse, Sector 18"
                  value={modalForm.storageLocation}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, storageLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20"
                >
                  {editingResource ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
