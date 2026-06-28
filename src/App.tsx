import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Authentication & Route Protection Guards
import { ProtectedRoute, AuthRoute, RoleRoute } from './components/RouteGuards';

// Pages & Layout Modules
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import EquipmentPage from './features/equipment/EquipmentPage';
import TicketPage from './features/tickets/TicketPage';
import UserPage from './features/users/UserPage';
import ActivityPage from './features/activity/ActivityPage';
import SettingsPage from './features/settings/SettingsPage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';

// Instantiate TanStack QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Authentication Entry Routes */}
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            } 
          />

          {/* 2. Protected Multi-Tenant App Dashboard Portal */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Standard Dashboard View (KPI cards and status charts) */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Equipment management (Inventories & Rooms) */}
            <Route path="equipments" element={<EquipmentPage />} />

            {/* Incident Ticketing system (Assignment, Comments, Image Uploads) */}
            <Route path="tickets" element={<TicketPage />} />

            {/* Organization Collaborators roster (Admin only) */}
            <Route 
              path="users" 
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <UserPage />
                </RoleRoute>
              } 
            />

            {/* Real-time Audit & Activity logs (Tech & Admin only) */}
            <Route 
              path="activities" 
              element={
                <RoleRoute allowedRoles={['ADMIN', 'TECH']}>
                  <ActivityPage />
                </RoleRoute>
              } 
            />

            {/* Custom user options & security clearances */}
            <Route path="settings" element={<SettingsPage />} />

            {/* 3. Platform Administration Portal (Super Admin only) */}
            <Route 
              path="admin" 
              element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminDashboardPage />
                </RoleRoute>
              } 
            />
            <Route 
              path="admin/organizations" 
              element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminDashboardPage />
                </RoleRoute>
              } 
            />
          </Route>

          {/* 4. Global Wildcard Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Feed for real-time STOMP alerts */}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
