import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import {
  AlertTriangle,
  Upload,
  MapPin,
  Users,
  Flame,
  FileText,
  Navigation
} from 'lucide-react';

const ReportDisaster = () => {
  const navigate = useNavigate();
  const { showToast } = useAlert();
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    disasterType: 'Flood',
    incidentDescription: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    affectedPeople: '',
    severityLevel: 'High',
    latitude: 28.6250,
    longitude: 77.2250,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const disasterTypes = ['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide', 'Tsunami', 'Other'];
  const severities = ['Critical', 'High', 'Medium', 'Low'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    setIsLocating(true);
    showToast('Acquiring GPS location and fetching exact street address...', 'info');

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
              address: res.data.address,
              city: res.data.city || prev.city,
              state: res.data.state || prev.state
            }));
            showToast('Exact address and GPS auto-filled successfully!', 'success');
          } else {
            showToast('GPS coordinates updated.', 'success');
          }
        } catch (err) {
          console.warn('Reverse geocode failed:', err);
          showToast('GPS coordinates updated.', 'info');
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
    if (!formData.title || !formData.incidentDescription || !formData.address) {
      showToast('Please fill all required disaster incident details.', 'warning');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('disasterType', formData.disasterType);
      submitData.append('incidentDescription', formData.incidentDescription);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('affectedPeople', formData.affectedPeople || 0);
      submitData.append('severityLevel', formData.severityLevel);
      submitData.append(
        'coordinates',
        JSON.stringify([Number(formData.longitude), Number(formData.latitude)])
      );

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      await api.post('/disasters', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Disaster incident reported successfully! Response teams notified.', 'success');
      navigate('/disasters');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit disaster report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Report Disaster Incident
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit critical situation details to alert emergency command and mobilize community responders
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Disaster Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Disaster Type *
              </label>
              <select
                value={formData.disasterType}
                onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
              >
                {disasterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity Level *
              </label>
              <select
                value={formData.severityLevel}
                onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs border rounded-xl font-bold focus:outline-none focus:ring-2 ${
                  formData.severityLevel === 'Critical'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-500'
                    : formData.severityLevel === 'High'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-amber-500'
                    : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-blue-500'
                }`}
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev} Severity
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Incident Headline / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Flood Inundation in low-lying riverside area"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Incident Description & On-Ground Situation *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what happened, extent of flooding or damage, trapped persons, hazards, and immediate relief needed..."
              value={formData.incidentDescription}
              onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            ></textarea>
          </div>

          {/* Affected People & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Exact Incident Address / Landmark *
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
                  placeholder="Street name, colony, landmark or sector"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Affected People
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 150"
                  value={formData.affectedPeople}
                  onChange={(e) => setFormData({ ...formData, affectedPeople: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Coordinates and GPS */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                GPS Map Coordinates (Latitude & Longitude)
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                Use My Current Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Incident Photo / Evidence (File Upload or Image URL)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
              </div>
              <div>
                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {imagePreview && (
              <div className="mt-3 relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setFormData({ ...formData, imageUrl: '' });
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white text-xs flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            )}
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
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/20 disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : 'Publish Disaster Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDisaster;
