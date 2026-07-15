import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './routes/ProtectedRoutes';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetails from './pages/LeadDetails';
import LeadForm from './pages/LeadForm';
import UserManagement from './pages/UserManagement';



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (All Roles) */}
          <Route element={<ProtectedRoutes allowedRoles={['Admin', 'Manager', 'Agent']} />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadList />} />
              <Route path="/leads/:leadId" element={<LeadDetails />} />
              
              {/* Agent and Manager/Admin can Edit or Update details */}
              <Route path="/leads/:leadId/edit" element={<LeadForm />} />
            </Route>
          </Route>

          {/* Protected Routes (Manager & Admin only) */}
          <Route element={<ProtectedRoutes allowedRoles={['Admin', 'Manager']} />}>
            <Route element={<MainLayout />}>
              <Route path="/leads/new" element={<LeadForm />} />
            </Route>
          </Route>

          {/* Protected Routes (Admin only) */}
          <Route element={<ProtectedRoutes allowedRoles={['Admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
