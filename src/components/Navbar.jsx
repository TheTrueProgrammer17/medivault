import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on emergency page
  if (location.pathname.startsWith('/emergency/')) return null;

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">🛡️</div>
        MediVault
      </Link>
      <div className="navbar-links">
        {currentUser ? (
          <div className="navbar-user">
            <span>Hi, {currentUser.displayName || 'User'}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
