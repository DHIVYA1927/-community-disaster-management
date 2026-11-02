import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Award,
  Save,
  Shield,
  Navigation
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, isVolunteer, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
    bloodGroup: user?.volunteerProfile?.bloodGroup || 'O+',
    skills: user?.volunteerProfile?.skills || ['First Aid'],
    latitude: user?.location?.coordinates?.[1] || 28.6139,
    longitude: user?.location?.coordinates?.[0] || 77.2090
  });

  const availableSkills = [
    'First Aid',
    'Search & Rescue',
    'Medical Care',
    'Boat Operation',
    'Logistics',
    'Cooking & Distribution',
    'Counseling & Child Care',
    'Heavy Machinery Driving'
  ];

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    setIsLocating(true);
    showToast('Acquiring GPS location and fetching address...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));

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
            showToast('Current address and GPS auto-filled!', 'success');
          } else {
            showToast('Updated coordinates from device GPS.', 'success');
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          showToast('Updated coordinates from device GPS.', 'info');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        showToast('GPS error: ' + err.message, 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/auth/profile', {
        ...formData,
        coordinates: [Number(formData.longitude), Number(formData.latitude)]
      });
      updateUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1e293b&color=fff`
            }
            alt=""
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow-sm"
          />
          <div>
            <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                {user?.role}
              </span>
              {isVolunteer && user?.volunteerProfile?.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  ★ {user.volunteerProfile.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Residential Address / Operations Base
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting address...' : '📍 Auto-fill Address via GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* Coordinates */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Home / Base Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                Detect GPS Location
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
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Longitude:</span>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Volunteer specific capabilities */}
          {isVolunteer && (
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Volunteer Certifications & Skills:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableSkills.map((sk) => {
                    const isSelected = formData.skills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => handleSkillToggle(sk)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
