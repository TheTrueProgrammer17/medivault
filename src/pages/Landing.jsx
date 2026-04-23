import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <h1 className="fade-in">Your Medical Information.<br />Instantly Available When It Matters Most</h1>
          <p className="fade-in fade-in-delay-1">
            Secure emergency-ready medical profiles accessible through QR code and RoadSOS smart infrastructure
          </p>
          <div className="hero-actions fade-in fade-in-delay-2" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Medical Profile</Link>
            <Link to="/doctor-login" className="btn btn-secondary btn-lg">🩺 Doctor Login</Link>
          </div>
        </div>
      </section>

      {/* Primary Feature Cards */}
      <section id="features" className="container" style={{ paddingTop: '60px', paddingBottom: '20px' }}>
        <div className="features" style={{ padding: '0' }}>
          <div className="card feature-card fade-in">
            <div className="feature-icon">👨‍👩‍👧‍👦</div>
            <h3>Family Medical Profiles</h3>
            <p>Manage structured health records for your entire family securely.</p>
          </div>
          <div className="card feature-card fade-in fade-in-delay-1">
            <div className="feature-icon">📱</div>
            <h3>Emergency QR Access</h3>
            <p>Generate a unique QR code for instant access to critical data.</p>
          </div>
          <div className="card feature-card fade-in fade-in-delay-2">
            <div className="feature-icon">📄</div>
            <h3>Secure Medical Documents</h3>
            <p>Safely store prescriptions, reports, and vital files.</p>
          </div>
          <div className="card feature-card fade-in fade-in-delay-3">
            <div className="feature-icon">🚨</div>
            <h3>RoadSOS Accident Integration</h3>
            <p>Direct integration with smart infrastructure for rapid emergency response.</p>
          </div>
        </div>
      </section>

      {/* Explore Grid */}
      <section id="explore" style={{ background: 'var(--bg-main)', padding: '60px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="section-title">Explore MediVault Features</h2>
          <div className="explore-grid">
            <div className="explore-card">
              <div className="explore-icon">👤</div>
              <div className="explore-info">
                <h3>Personal Medical Profile</h3>
                <p>Maintain an up-to-date repository of your blood group, conditions, and medications.</p>
              </div>
            </div>
            <div className="explore-card">
              <div className="explore-icon">👨‍👩‍👧‍👦</div>
              <div className="explore-info">
                <h3>Family Dashboard</h3>
                <p>Add and manage profiles for dependents and elderly family members from a single account.</p>
              </div>
            </div>
            <div className="explore-card">
              <div className="explore-icon">📱</div>
              <div className="explore-info">
                <h3>Emergency QR Access</h3>
                <p>Lock screen ready QR codes that give first responders critical triage information.</p>
              </div>
            </div>
            <div className="explore-card">
              <div className="explore-icon">🔒</div>
              <div className="explore-info">
                <h3>Medical Document Vault</h3>
                <p>Store encrypted PDFs of lab results, vaccination records, and prescriptions.</p>
              </div>
            </div>
            <div className="explore-card">
              <div className="explore-icon">🚑</div>
              <div className="explore-info">
                <h3>Responder Emergency View</h3>
                <p>Optimized triage view displaying only essential life-saving data for paramedics.</p>
              </div>
            </div>
            <div className="explore-card">
              <div className="explore-icon">🚦</div>
              <div className="explore-info">
                <h3>RoadSOS Integration</h3>
                <p>Automated profile sharing with emergency services during smart-detected accidents.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">How MediVault Works</h2>
          <div className="steps">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <h3>Create Profile</h3>
              <p>Sign up securely using government-grade encryption protocols.</p>
            </div>
            <div className="step-card fade-in fade-in-delay-1">
              <div className="step-number">2</div>
              <h3>Add Medical Information</h3>
              <p>Input blood type, allergies, conditions, and emergency contacts.</p>
            </div>
            <div className="step-card fade-in fade-in-delay-2">
              <div className="step-number">3</div>
              <h3>Share QR with responders</h3>
              <p>Keep your QR code on your vehicle or lock screen for instant triage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RoadSOS Integration */}
      <section className="roadsos-section">
        <div className="container">
          <div className="roadsos-badge">🛡️ Official Infrastructure Partner</div>
          <h2>RoadSOS Smart Integration</h2>
          <p>
            MediVault is seamlessly integrated with the RoadSOS smart streetlight accident detection network. 
            When a crash is detected by infrastructure sensors, your linked MediVault emergency profile is 
            instantly securely transmitted to dispatched first responders before they even arrive at the scene.
          </p>
          <button className="btn btn-secondary btn-lg">Learn about RoadSOS</button>
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">2M+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5M+</div>
              <div className="stat-label">Documents Stored</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Responders Enabled</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1.2k+</div>
              <div className="stat-label">Lives Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>About MediVault</h2>
          <p>
            MediVault is a government-grade digital health repository designed to bridge the gap between 
            patients and emergency responders. Built on secure, encrypted architecture, it ensures that your 
            critical medical history speaks for you when you cannot. By partnering with smart city 
            initiatives like RoadSOS, MediVault transforms personal health records into proactive life-saving tools.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>MediVault</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94A3B8' }}>
                Secure, instant access to critical medical information powering smart city emergency responses.
              </p>
            </div>
            <div className="footer-col">
              <h3>Platform</h3>
              <div className="footer-links">
                <a href="#about">About</a>
                <a href="#features">Features</a>
                <a href="#">RoadSOS Integration</a>
              </div>
            </div>
            <div className="footer-col">
              <h3>Legal & Security</h3>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Emergency Access Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
            <div className="footer-col">
              <h3>Support</h3>
              <div className="footer-links">
                <a href="#">Contact Us</a>
                <a href="#">Help Center</a>
                <a href="#">For First Responders</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 MediVault. Professional Medical Information System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
