import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on emergency page
  if (location.pathname.startsWith('/emergency/')) return null;

  const isDoctor = userData?.role === 'doctor';

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <>
      <div className="trust-strip">
        <span>
          {isDoctor
            ? '🩺 MediVault Provider Portal — Document Verification System'
            : '🛡️ RoadSOS Emergency Infrastructure Integration Active'}
        </span>
      </div>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="hamburger" onClick={onMenuClick}>
            ☰
          </button>
          <Link to="/" className="navbar-brand">
            <div className="logo-icon">{isDoctor ? '🩺' : '+'}</div>
            MediVault{isDoctor ? ' Provider' : ''}
          </Link>
        </div>
        
        {!currentUser && (
          <div className="navbar-menu-links">
            <a href="#explore" className="nav-link">Explore</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
          </div>
        )}

        <div className="navbar-links">
          {currentUser ? (
            <div className="navbar-user">
              {isDoctor && (
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(46,125,50,0.1)', color: '#2E7D32',
                  fontSize: '0.78rem', fontWeight: 700
                }}>
                  Provider
                </span>
              )}
              <span>Hi, {currentUser.displayName || 'User'}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
