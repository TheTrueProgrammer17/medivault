import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import Dashboard from './pages/Dashboard';
import MedicalProfile from './pages/MedicalProfile';
import FamilyDashboard from './pages/FamilyDashboard';
import Documents from './pages/Documents';
import EmergencyQRPage from './pages/EmergencyQRPage';
import Emergency from './pages/Emergency';
import AppLayout from './components/AppLayout';
import PublicLayout from './components/PublicLayout';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div><span>Loading...</span></div>;
  return currentUser ? children : <Navigate to="/login" />;
}

export default function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/doctor-login" element={currentUser ? <Navigate to="/dashboard" /> : <DoctorLogin />} />
        <Route path="/register-doctor" element={currentUser ? <Navigate to="/dashboard" /> : <DoctorRegister />} />
      </Route>
      
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<MedicalProfile />} />
        <Route path="/family" element={<FamilyDashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/qr" element={<EmergencyQRPage />} />
      </Route>

      <Route path="/emergency/:userId" element={<Emergency />} />
      <Route path="/emergency/member/:memberId" element={<Emergency />} />
    </Routes>
  );
}
