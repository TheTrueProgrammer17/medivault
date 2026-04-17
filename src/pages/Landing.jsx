import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main>
      <section className="hero">
        <h1 className="fade-in">Your Medical Records,<br />Always Within Reach</h1>
        <p className="fade-in fade-in-delay-1">
          Store your vital health data securely and generate a QR code so emergency responders can access critical information when it matters most.
        </p>
        <div className="hero-actions fade-in fade-in-delay-2">
          <Link to="/register" className="btn btn-primary btn-lg">Create Your Vault</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
      </section>

      <section className="container">
        <div className="features">
          <div className="card feature-card fade-in fade-in-delay-1">
            <div className="feature-icon">🔒</div>
            <h3>Secure Storage</h3>
            <p>Your medical records are encrypted and stored safely with Firebase. Only you control access.</p>
          </div>
          <div className="card feature-card fade-in fade-in-delay-2">
            <div className="feature-icon">📱</div>
            <h3>Emergency QR Code</h3>
            <p>Generate a QR code that reveals vital info — blood group, allergies, and emergency contacts — to first responders.</p>
          </div>
          <div className="card feature-card fade-in fade-in-delay-3">
            <div className="feature-icon">📄</div>
            <h3>Document Uploads</h3>
            <p>Upload prescriptions, lab reports, and medical documents as PDFs. Access them anytime from your dashboard.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 MediVault. Built to save lives.</p>
      </footer>
    </main>
  );
}
