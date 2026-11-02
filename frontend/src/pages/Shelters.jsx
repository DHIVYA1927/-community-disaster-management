import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Home,
  PlusCircle,
  Search,
  Filter,
  Phone,
  Users,
  MapPin,
  CheckCircle2,
  Trash2,
  Edit,
  Building,
  Navigation
} from 'lucide-react';

const Shelters = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [shelters, setShelters] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);

  const [modalForm, setModalForm] = useState({
    name: '',
    address: '',
    city: 'Delhi',
    capacity: 500,
    currentOccupancy: 50,
    contactPerson: '',
    contactPhone: '',
    facilities: ['Clean Drinking Water', 'Medical Camp', 'Hot Meals'],
    latitude: 28.6250,
    longitude: 77.2250
  });

  const availableFacilities = [
    'Clean Drinking Water',
    'Field Hospital',
    'Hot Meals',
    'Sanitation Blocks',
    'Power Backup',
    'Child Care',
    'Wheelchair Accessible',
    'Blanket & Cot Distribution'
  ];

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/shelters?${params.toString()}`);
      setShelters(res.data.shelters || []);
      setStats(res.data.stats || {});
    } catch (err) {
      showToast('Error loading shelters: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [statusFilter]);

  const handleFacilityToggle = (fac) => {
    setModalForm((prev) => {
      const exists = prev.facilities.includes(fac);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter((f) => f !== fac) };
      } else {
        return { ...prev, facilities: [...prev.facilities, fac] };
      }
    });
  };

  const handleOpenAddModal = () => {
    setEditingShelter(null);
    setModalForm({
      name: '',
      address: '',
      city: 'Delhi',
      capacity: 500,
      currentOccupancy: 50,
      contactPerson: '',
      contactPhone: '',
      facilities: ['Clean Drinking Water', 'Field Hospital', 'Hot Meals'],
      latitude: 28.6250,
      longitude: 77.2250
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (s) => {
    setEditingShelter(s);
    setModalForm({
      name: s.name,
      address: s.address,
      city: s.city || '',
      capacity: s.capacity,
      currentOccupancy: s.currentOccupancy,
      contactPerson: s.contactPerson,
      contactPhone: s.contactPhone,
      facilities: s.facilities || [],
      latitude: s.location?.coordinates?.[1] || 28.6250,
      longitude: s.location?.coordinates?.[0] || 77.2250
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...modalForm,
        coordinates: [Number(modalForm.longitude), Number(modalForm.latitude)]
      };

      if (editingShelter) {
        await api.put(`/shelters/${editingShelter._id}`, payload);
        showToast('Shelter details updated successfully.', 'success');
      } else {
        await api.post('/shelters', payload);
        showToast('New relief camp added.', 'success');
      }
      setShowModal(false);
      fetchShelters();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteShelter = async (id) => {
    if (!window.confirm('Delete this relief shelter record?')) return;
    try {
      await api.delete(`/shelters/${id}`);
      showToast('Shelter deleted.', 'success');
      fetchShelters();
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
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Home className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Relief Camps & Emergency Shelters
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Community safe zones providing lodging, clean drinking water, hot rations, and medical care
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-900/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Relief Shelter</span>
          </button>
        )}
      </div>

      {/* Capacity Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total System Capacity</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {stats.totalCapacity?.toLocaleString() || 0} beds
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Current Occupancy</span>
          <p className="text-xl font-extrabold text-blue-600 mt-1">
            {stats.totalOccupied?.toLocaleString() || 0} persons
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Available Bed Spaces</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {stats.availableSlots?.toLocaleString() || 0} open
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Operational Camps</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            {stats.activeSheltersCount || 0}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by shelter name, address, contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchShelters()}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={fetchShelters}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {['All', 'Active', 'Near Full', 'Full', 'Inactive'].map((st) => (
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
      </div>

      {/* Shelters Grid Cards */}
      {loading ? (
        <LoadingSpinner text="Retrieving active relief camps..." />
      ) : shelters.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No shelters match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shelters.map((s) => {
            const occupancyRate = Math.round((s.currentOccupancy / s.capacity) * 100);

            return (
              <div
                key={s._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50">
                      ⛺ Relief Camp
                    </span>
                    <StatusBadge status={s.status} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </p>

                  {/* Occupancy Progress */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Camp Capacity</span>
                      <span className="font-bold text-slate-800">
                        {s.currentOccupancy} / {s.capacity} beds ({occupancyRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyRate >= 90
                            ? 'bg-rose-500'
                            : occupancyRate >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">
                      {Math.max(0, s.capacity - s.currentOccupancy)} slots currently vacant
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="text-xs text-slate-600 space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Coordinator: <b>{s.contactPerson}</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone: <b>{s.contactPhone}</b></span>
                    </div>
                  </div>

                  {/* Facilities Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {s.facilities?.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="Edit Shelter Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteShelter(s._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Shelter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Shelter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              {editingShelter ? 'Edit Shelter Details' : 'Register New Relief Shelter / Camp'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter camp location, bed capacity, coordinator contact, and available facilities.
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shelter / Camp Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community Stadium Emergency Camp"
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address & Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Location address"
                  value={modalForm.address}
                  onChange={(e) => setModalForm({ ...modalForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Bed Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalForm.capacity}
                    onChange={(e) => setModalForm({ ...modalForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Occupancy
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.currentOccupancy}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, currentOccupancy: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Coordinator Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="In-charge name"
                    value={modalForm.contactPerson}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, contactPerson: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={modalForm.contactPhone}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, contactPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Facilities check */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Available Camp Amenities & Services:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableFacilities.map((fac) => {
                    const isSelected = modalForm.facilities.includes(fac);
                    return (
                      <button
                        type="button"
                        key={fac}
                        onClick={() => handleFacilityToggle(fac)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {fac}
                      </button>
                    );
                  })}
                </div>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20"
                >
                  {editingShelter ? 'Save Changes' : 'Register Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shelters;
