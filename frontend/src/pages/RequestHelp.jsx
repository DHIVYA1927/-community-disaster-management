import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import {
  LifeBuoy,
  Users,
  Phone,
  MapPin,
  Flame,
  AlertTriangle,
  Navigation
} from 'lucide-react';

const RequestHelp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useAlert();
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [disasters, setDisasters] = useState([]);
  const [formData, setFormData] = useState({
    disasterId: '',
    requestType: 'Rescue',
    urgencyLevel: 'Critical',
    description: '',
    peopleCount: 1,
    address: user?.address || '',
    contactPhone: user?.phone || '',
    latitude: 28.6250,
    longitude: 77.2250
  });

  const requestTypes = ['Rescue', 'Medical', 'Food', 'Drinking Water', 'Shelter', 'Clothes', 'Other'];
  const urgencyLevels = ['Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    const fetchActiveDisasters = async () => {
      try {
        const res = await api.get('/disasters?status=Verified');
        setDisasters(res.data.disasters || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActiveDisasters();
  }, []);

  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    setIsLocating(true);
    showToast('Detecting current GPS location and fetching address...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));

        try {
          const res = await api.get(`/geocode/reverse?lat=${lat}&lng=${lng}`);
          if (res.data?.success && res.data.address) {
            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              address: res.data.address
            }));
            showToast('Current address and GPS coordinates auto-filled!', 'success');
          } else {
            showToast('GPS coordinates acquired.', 'success');
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          showToast('GPS coordinates acquired.', 'info');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        showToast('Geolocation error: ' + error.message, 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.address || !formData.contactPhone) {
      showToast('Please provide your situation description, address, and contact number.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await api.post('/emergency-requests', {
        ...formData,
        coordinates: [Number(formData.longitude), Number(formData.latitude)]
      });

      showToast('Emergency SOS Request sent! Responders are being alerted.', 'success');
      navigate('/emergency-requests');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* SOS Header */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider mb-2 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Direct Citizen Emergency Dispatch
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Emergency Help & Rescue Request (SOS)
          </h1>
          <p className="text-xs text-rose-100 mt-1">
            Fill in your immediate distress details. Local emergency coordination centers and volunteers will receive this instant alert.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request Type & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Type of Immediate Aid *
              </label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
              >
                {requestTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Level *
              </label>
              <select
                value={formData.urgencyLevel}
                onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-rose-50 text-rose-800 border border-rose-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {urgencyLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* People Count & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of People Trapped / In Need *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.peopleCount}
                  onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Active Contact Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Associated Disaster */}
          {disasters.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Link to Known Ongoing Disaster (Optional)
              </label>
              <select
                value={formData.disasterId}
                onChange={(e) => setFormData({ ...formData, disasterId: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">-- General / Unlinked Incident --</option>
                {disasters.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.disasterType} - {d.location?.address})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Situation & Assistance Required *
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Stranded on 2nd floor roof, rising water level, elderly person needs insulin, baby requires milk formula..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            ></textarea>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Exact Location / Landmark *
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline transition"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting address...' : '📍 Auto-fill Address via GPS'}</span>
              </button>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="House number, landmark, school, near bridge etc."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                GPS Location Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold hover:underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                Detect My GPS Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Latitude:</span>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Longitude:</span>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/30 animate-emergency-pulse disabled:opacity-50"
            >
              {loading ? 'Transmitting SOS...' : 'Transmit Emergency SOS Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestHelp;
