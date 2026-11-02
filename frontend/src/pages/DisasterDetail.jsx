import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import LeafletMap from '../components/LeafletMap';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  Share2,
  Phone,
  LifeBuoy,
  ShieldCheck
} from 'lucide-react';

const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useAlert();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/disasters/${id}`);
        setDisaster(res.data.disaster);
      } catch (err) {
        showToast('Failed to load disaster details: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/disasters/${id}/status`, { status: newStatus });
      setDisaster({ ...disaster, status: newStatus });
      showToast(`Disaster status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast('Status update failed: ' + err.message, 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving disaster details..." />;
  }

  if (!disaster) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Disaster Report Not Found</h3>
        <Link to="/disasters" className="text-blue-600 underline text-xs mt-2 inline-block">
          Back to Disasters List
        </Link>
      </div>
    );
  }

  const coords = disaster.location?.coordinates || [77.2090, 28.6139];
  const center = [coords[1], coords[0]];

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Change Status:</span>
            {['Verified', 'In-Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  disaster.status === st
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {disaster.imageUrl && (
          <div className="w-full h-72 sm:h-96 bg-slate-100 overflow-hidden relative">
            <img
              src={disaster.imageUrl}
              alt={disaster.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-slate-900/90 text-white backdrop-blur-md">
                {disaster.disasterType}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <SeverityBadge severity={disaster.severityLevel} />
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              {!disaster.imageUrl && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase bg-rose-50 text-rose-700">
                    {disaster.disasterType}
                  </span>
                  <SeverityBadge severity={disaster.severityLevel} />
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {disaster.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Reported by {disaster.reportedBy?.name || 'Citizen'}</span>
                <span>•</span>
                <span>{new Date(disaster.reportDateTime).toLocaleString()}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={disaster.status} />
              {isAdmin && (
                <Link
                  to="/allocations"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Allocate Resources
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Incident Overview & Situation Report
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {disaster.incidentDescription}
            </p>
          </div>

          {/* Key Incident Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Estimated Affected People</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {disaster.affectedPeople?.toLocaleString()} individuals
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Location Address</span>
              <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {disaster.location?.address}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Verification Status</span>
              <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                {disaster.verifiedBy ? `Verified by ${disaster.verifiedBy.name}` : 'Pending Admin Verification'}
              </p>
            </div>
          </div>

          {/* Incident Geographic Map */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Geographic Incident Coordinates & Map
            </h3>
            <LeafletMap disasters={[disaster]} center={center} zoom={13} height="360px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetail;
