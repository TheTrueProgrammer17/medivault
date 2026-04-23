import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout, userData } = useAuth();
  const navigate = useNavigate();

  const isDoctor = userData?.role === 'doctor';

  const patientLinks = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/profile', label: 'Create Medical Profile', icon: '🩺' },
    { path: '/family', label: 'Family Dashboard', icon: '👨‍👩‍👧‍👦' },
    { path: '/documents', label: 'Documents', icon: '📄' },
    { path: '/qr', label: 'Emergency QR', icon: '📱' },
  ];

  const doctorLinks = [
    { path: '/dashboard', label: 'Verify Documents', icon: '🏠' },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {isDoctor && (
        <div style={{ padding: '8px 24px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
            background: 'rgba(46,125,50,0.1)', color: '#2E7D32',
            fontSize: '0.8rem', fontWeight: 700
          }}>
            🩺 Provider Account
          </span>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth <= 768) onClose(); }}
          >
            <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
        <button 
          className="sidebar-link" 
          onClick={handleLogout} 
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: '1.2rem' }}>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
