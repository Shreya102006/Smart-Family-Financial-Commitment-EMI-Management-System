import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FamilyPage from './pages/FamilyPage';
import AddFamilyMemberPage from './pages/AddFamilyMemberPage';
import CommitmentsPage from './pages/CommitmentsPage';
import AddCommitmentPage from './pages/AddCommitmentPage';
import CommitmentDetailsPage from './pages/CommitmentDetailsPage';
import PaymentsPage from './pages/PaymentsPage';
import UpcomingPaymentsPage from './pages/UpcomingPaymentsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

// Authenticated layout wrapper
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/family"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FamilyPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/family/add"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddFamilyMemberPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commitments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommitmentsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commitments/add"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddCommitmentPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commitments/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommitmentDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commitments/edit/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddCommitmentPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PaymentsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/upcoming"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UpcomingPaymentsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PaymentHistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
