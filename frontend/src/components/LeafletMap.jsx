import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Home, LifeBuoy, Users, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';

// Custom Map Marker Icons using Leaflet DivIcon
const createCustomIcon = (bgColor, label, symbol) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid white;
        transition: transform 0.2s;
      " title="${label}">
        ${symbol}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

const getDisasterIcon = (severity) => {
  if (severity === 'Critical') return createCustomIcon('#dc2626', 'Critical Disaster', '🔥');
  if (severity === 'High') return createCustomIcon('#ea580c', 'High Disaster', '⚠️');
  if (severity === 'Medium') return createCustomIcon('#f59e0b', 'Medium Disaster', '🌊');
  return createCustomIcon('#3b82f6', 'Disaster', '📍');
};

const shelterIcon = createCustomIcon('#059669', 'Relief Camp', '⛺');
const requestIcon = createCustomIcon('#e11d48', 'Emergency Request', '🆘');

const LeafletMap = ({
  disasters = [],
  shelters = [],
  requests = [],
  center = [28.6250, 77.2250],
  zoom = 12,
  height = '540px'
}) => {
  const [activeFilter, setActiveFilter] = useState('all'); // all | disasters | shelters | requests

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
      {/* Map Filter Controls Bar */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 flex items-center space-x-1 sm:space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Markers ({disasters.length + shelters.length + requests.length})
        </button>
        <button
          onClick={() => setActiveFilter('disasters')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeFilter === 'disasters'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🔥</span> Disasters ({disasters.length})
        </button>
        <button
          onClick={() => setActiveFilter('shelters')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeFilter === 'shelters'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⛺</span> Relief Camps ({shelters.length})
        </button>
        <button
          onClick={() => setActiveFilter('requests')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeFilter === 'requests'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🆘</span> SOS Requests ({requests.length})
        </button>
      </div>

      <div style={{ height, width: '100%' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Disaster Markers */}
          {(activeFilter === 'all' || activeFilter === 'disasters') &&
            disasters.map((d) => {
              const coords = d.location?.coordinates;
              if (!coords || coords.length !== 2) return null;
              // coordinates stored as [lng, lat], Leaflet takes [lat, lng]
              const latLng = [coords[1], coords[0]];

              return (
                <Marker
                  key={`disaster-${d._id}`}
                  position={latLng}
                  icon={getDisasterIcon(d.severityLevel)}
                >
                  <Popup>
                    <div className="p-3 max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {d.disasterType}
                        </span>
                        <SeverityBadge severity={d.severityLevel} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{d.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                        {d.incidentDescription}
                      </p>
                      <div className="text-[11px] text-slate-500 space-y-1 mb-3 bg-slate-50 p-2 rounded">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{d.location?.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>~{d.affectedPeople?.toLocaleString()} people affected</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <StatusBadge status={d.status} />
                        <Link
                          to={`/disasters/${d._id}`}
                          className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                        >
                          View Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Relief Camp / Shelter Markers */}
          {(activeFilter === 'all' || activeFilter === 'shelters') &&
            shelters.map((s) => {
              const coords = s.location?.coordinates;
              if (!coords || coords.length !== 2) return null;
              const latLng = [coords[1], coords[0]];

              const occupancyPercent = Math.round((s.currentOccupancy / s.capacity) * 100);

              return (
                <Marker key={`shelter-${s._id}`} position={latLng} icon={shelterIcon}>
                  <Popup>
                    <div className="p-3 max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ⛺ Relief Camp
                        </span>
                        <StatusBadge status={s.status} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{s.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">{s.address}</p>

                      <div className="bg-slate-50 p-2 rounded mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Occupancy:</span>
                          <span className="font-semibold text-slate-800">
                            {s.currentOccupancy} / {s.capacity} ({occupancyPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancyPercent >= 90
                                ? 'bg-rose-500'
                                : occupancyPercent >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.contactPerson} ({s.contactPhone})</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Link
                          to="/shelters"
                          className="text-xs text-emerald-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                        >
                          Shelters List &rarr;
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Emergency SOS Request Markers */}
          {(activeFilter === 'all' || activeFilter === 'requests') &&
            requests.map((r) => {
              const coords = r.location?.coordinates;
              if (!coords || coords.length !== 2) return null;
              const latLng = [coords[1], coords[0]];

              return (
                <Marker key={`request-${r._id}`} position={latLng} icon={requestIcon}>
                  <Popup>
                    <div className="p-3 max-w-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          🆘 {r.requestType} Help
                        </span>
                        <SeverityBadge severity={r.urgencyLevel} />
                      </div>
                      <p className="text-xs text-slate-800 font-medium line-clamp-2 mb-2">
                        {r.description}
                      </p>
                      <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded mb-2">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Persons in distress: <b>{r.peopleCount}</b></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.contactPhone}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <StatusBadge status={r.status} />
                        <Link
                          to="/emergency-requests"
                          className="text-xs text-rose-600 font-semibold hover:underline"
                        >
                          Respond &rarr;
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
};

export default LeafletMap;
