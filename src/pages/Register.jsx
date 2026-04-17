import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in">
        <div className="card-header">
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛡️</div>
          <h2>Create Your Vault</h2>
          <p>Set up your secure medical profile</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" className="form-input" type="text" placeholder="John Doe"
              value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" className="form-input" type="password" placeholder="Min 6 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" className="form-input" type="password" placeholder="Re-enter password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating vault...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
