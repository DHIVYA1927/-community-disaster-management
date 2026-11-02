import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  Flame,
  Users,
  LifeBuoy,
  Package,
  Share2,
  Home,
  CheckCircle,
  PlusCircle,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#f59e0b',
  Low: '#10b981'
};

const Dashboard = () => {
  const { user, isAdmin, isVolunteer, isCitizen } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling disaster response metrics & live analytics..." />;
  }

  const { stats, charts, recentData } = data || {
    stats: {},
    charts: {},
    recentData: {}
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-600/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-amber-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Central Command Operational
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Commander'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Connected to the Community Disaster Management & Resource Allocation Network. Monitor live incidents, coordinate relief logistics, and mobilize rescue teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs transition shadow-md shadow-blue-900/50"
            >
              <MapPin className="w-4 h-4" />
              Interactive Map
            </Link>
            {isCitizen && (
              <Link
                to="/request-help"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs transition shadow-md shadow-rose-900/50 animate-emergency-pulse"
              >
                <LifeBuoy className="w-4 h-4" />
                Emergency SOS
              </Link>
            )}
            <Link
              to="/report-disaster"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Report Incident
            </Link>
          </div>
        </div>
      </div>

      {/* 7 Core KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Emergencies"
          value={stats.activeEmergencies}
          subtext="Urgent response active"
          icon={Flame}
          color="red"
          trend="Critical"
        />
        <StatsCard
          title="Pending Help Requests"
          value={stats.pendingRequests}
          subtext="Citizen SOS calls awaiting dispatch"
          icon={LifeBuoy}
          color="orange"
          trend="Needs Attention"
        />
        <StatsCard
          title="Total Volunteers"
          value={stats.totalVolunteers}
          subtext="Active field responders"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Active Relief Camps"
          value={stats.activeReliefCamps}
          subtext="Shelters providing refuge"
          icon={Home}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Disaster Reports"
          value={stats.totalDisasters}
          subtext="Logged in system database"
          icon={AlertTriangle}
          color="blue"
        />
        <StatsCard
          title="Available Resources"
          value={stats.availableResources?.toLocaleString()}
          subtext="Stock ready for allocation"
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Resources Distributed"
          value={stats.resourcesDistributed?.toLocaleString()}
          subtext="Allocated to shelters & zones"
          icon={Share2}
          color="green"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Category Allocation Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Resource Inventory vs Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Quantity in stock vs allocated for disaster relief
              </p>
            </div>
            <Link to="/resources" className="text-xs text-blue-600 font-semibold hover:underline">
              Inventory &rarr;
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.resourceDistribution || []}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="available" name="Available Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="allocated" name="Allocated / Dispatched" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disaster Severity Breakdown Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Disaster Severity Index
            </h3>
            <p className="text-xs text-slate-500">Breakdown of reported incidents by urgency</p>
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.disasterSeverity || []}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(charts.disasterSeverity || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.severity] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            {(charts.disasterSeverity || []).map((s) => (
              <div key={s.severity} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[s.severity] || '#64748b' }}
                ></span>
                <span className="text-slate-600 font-medium">{s.severity}:</span>
                <span className="font-bold text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Disasters & Emergency Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Disasters Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Recent Disaster Reports
              </h3>
            </div>
            <Link to="/disasters" className="text-xs text-blue-600 font-semibold hover:underline">
              View All ({stats.totalDisasters}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentData.recentDisasters?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No disasters recorded yet.</p>
            ) : (
              recentData.recentDisasters?.map((d) => (
                <Link
                  key={d._id}
                  to={`/disasters/${d._id}`}
                  className="block p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      {d.disasterType}
                    </span>
                    <SeverityBadge severity={d.severityLevel} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{d.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {d.incidentDescription}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {d.location?.address}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Urgent Assistance Requests */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Recent SOS Emergency Requests
              </h3>
            </div>
            <Link
              to="/emergency-requests"
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View Requests &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentData.recentRequests?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No requests recorded yet.</p>
            ) : (
              recentData.recentRequests?.map((r) => (
                <div
                  key={r._id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        🆘 {r.requestType} Help
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({r.peopleCount} people)
                      </span>
                    </div>
                    <SeverityBadge severity={r.urgencyLevel} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{r.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60">
                    <span>Contact: {r.contactPhone}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
