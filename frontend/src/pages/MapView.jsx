import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import LeafletMap from '../components/LeafletMap';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, AlertTriangle, Home, LifeBuoy, Layers, Compass } from 'lucide-react';

const MapView = () => {
  const { showToast } = useAlert();
  const [disasters, setDisasters] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const [disRes, sheltRes, reqRes] = await Promise.all([
          api.get('/disasters'),
          api.get('/shelters'),
          api.get('/emergency-requests')
        ]);
        setDisasters(disRes.data.disasters || []);
        setShelters(sheltRes.data.shelters || []);
        setRequests(reqRes.data.requests || []);
      } catch (err) {
        showToast('Error loading live map data: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Map Header & Legend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Live Interactive Disaster Situation Map
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial monitoring of disaster incidents, active relief camps, and citizen SOS distress calls
          </p>
        </div>

        {/* Legend Summary Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            Disasters ({disasters.length})
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Relief Camps ({shelters.length})
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            Distress SOS ({requests.length})
          </div>
        </div>
      </div>

      {/* Map Container */}
      {loading ? (
        <LoadingSpinner text="Rendering interactive OpenStreetMap tiles & geo-coordinates..." />
      ) : (
        <div className="relative">
          <LeafletMap
            disasters={disasters}
            shelters={shelters}
            requests={requests}
            center={[28.6250, 77.2250]}
            zoom={12}
            height="calc(100vh - 240px)"
          />
        </div>
      )}
    </div>
  );
};

export default MapView;
