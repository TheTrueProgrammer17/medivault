import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div><span>Loading...</span></div>;
  return currentUser ? children : <Navigate to="/login" />;
}

export default function App() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/emergency/:userId" element={<Emergency />} />
      </Routes>
    </>
  );
}
