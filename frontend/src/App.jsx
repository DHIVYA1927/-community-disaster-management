import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Disasters from './pages/Disasters';
import DisasterDetail from './pages/DisasterDetail';
import ReportDisaster from './pages/ReportDisaster';
import EmergencyRequests from './pages/EmergencyRequests';
import RequestHelp from './pages/RequestHelp';
import Resources from './pages/Resources';
import ResourceAllocation from './pages/ResourceAllocation';
import Shelters from './pages/Shelters';
import Volunteers from './pages/Volunteers';
import Tasks from './pages/Tasks';
import Alerts from './pages/Alerts';
import MapView from './pages/MapView';
import UsersManagement from './pages/UsersManagement';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-6 text-center text-xs">
        <p className="font-semibold text-slate-300">
          Community Disaster Management and Resource Allocation System (CDM-RAS)
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Connecting Citizens, Field Volunteers, and Emergency Command Centers During Crises
        </p>
      </footer>
    </div>
  );
}

function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected App Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Layout>
              <MapView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disasters"
        element={
          <ProtectedRoute>
            <Layout>
              <Disasters />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disasters/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <DisasterDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-disaster"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportDisaster />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency-requests"
        element={
          <ProtectedRoute>
            <Layout>
              <EmergencyRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/request-help"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestHelp />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Layout>
              <Resources />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/allocations"
        element={
          <ProtectedRoute allowedRoles={['administrator', 'volunteer']}>
            <Layout>
              <ResourceAllocation />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shelters"
        element={
          <ProtectedRoute>
            <Layout>
              <Shelters />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteers"
        element={
          <ProtectedRoute allowedRoles={['administrator', 'volunteer']}>
            <Layout>
              <Volunteers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={['administrator', 'volunteer']}>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Layout>
              <Alerts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <Layout>
              <UsersManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
