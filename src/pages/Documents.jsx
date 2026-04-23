import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

const DURATION_OPTIONS = [
  { label: '30 Minutes', minutes: 30 },
  { label: '1 Hour', minutes: 60 },
  { label: '3 Hours', minutes: 180 },
  { label: '5 Hours', minutes: 300 },
];

const DOCUMENT_TYPES = [
  'Prescription',
  'Lab Report',
  'Scan Report',
  'Discharge Summary',
  'Medical Certificate',
  'Insurance Document',
  'Other',
];

function generateVerificationKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MV-VER-${seg(4)}-${seg(4)}`;
}

// Document type icons
const typeIcons = {
  'Prescription': '💊',
  'Lab Report': '🔬',
  'Scan Report': '🩻',
  'Discharge Summary': '🏥',
  'Medical Certificate': '📋',
  'Insurance Document': '🛡️',
  'Other': '📄',
};

export default function Documents() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [msg, setMsg] = useState('');

  // Add Document modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('');
  const [docDoctorName, setDocDoctorName] = useState('');
  const [docHospitalName, setDocHospitalName] = useState('');
  const [docTreatmentDate, setDocTreatmentDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Verification key modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    async function loadData() {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          setDocuments(snap.data().documents || []);
        }
      } catch (err) {
        console.error('Load error:', err);
      }
    }
    loadData();
  }, [currentUser]);

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  // ============ ADD DOCUMENT ============
  async function handleAddDocument(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const newDoc = {
        documentTitle: docTitle.trim(),
        documentType: docType,
        doctorName: docDoctorName.trim(),
        hospitalName: docHospitalName.trim(),
        treatmentDate: docTreatmentDate,
        uploadTimestamp: new Date().toISOString(),
        verificationStatus: 'pending',
      };
      const newDocs = [...documents, newDoc];
      setDocuments(newDocs);
      await setDoc(doc(db, 'users', currentUser.uid), { documents: newDocs }, { merge: true });
      flash('Document record added successfully!');
      closeAddModal();
    } catch (err) {
      flash('Error adding document: ' + err.message);
    }
    setSaving(false);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setDocTitle('');
    setDocType('');
    setDocDoctorName('');
    setDocHospitalName('');
    setDocTreatmentDate('');
  }

  async function deleteDoc(i) {
    const newDocs = documents.filter((_, idx) => idx !== i);
    setDocuments(newDocs);
    await setDoc(doc(db, 'users', currentUser.uid), { documents: newDocs }, { merge: true });
    flash('Document record removed.');
  }

  // ============ VERIFICATION KEY ============
  async function handleGenerateKey() {
    if (!selectedDuration) return;
    setGenerating(true);
    try {
      const key = generateVerificationKey();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + selectedDuration.minutes);

      await addDoc(collection(db, 'verificationKeys'), {
        key,
        patientId: currentUser.uid,
        expiresAt: expiresAt.toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      setGeneratedKey({ key, expiresAt: expiresAt.toISOString() });
    } catch (err) {
      flash('Error generating key: ' + err.message);
    }
    setGenerating(false);
  }

  function copyKey() {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function closeKeyModal() {
    setShowKeyModal(false);
    setSelectedDuration(null);
    setGeneratedKey(null);
    setCopied(false);
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Documents</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Record and manage your medical documents</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ gap: '6px' }}>
            ➕ Add Document
          </button>
          <button className="btn btn-accent" onClick={() => setShowKeyModal(true)} style={{ gap: '6px' }}>
            🔑 Generate Verification Key
          </button>
        </div>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      {/* Document Cards */}
      {documents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📂</div>
            <p>No documents recorded yet.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowAddModal(true)}>
              Add Your First Document
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {documents.map((d, i) => (
            <div key={i} className="card" style={{ padding: '20px', position: 'relative' }}>
              {/* Type Icon & Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(11,60,93,0.08)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0
                }}>
                  {typeIcons[d.documentType] || '📄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {d.documentTitle}
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-main)', border: '1px solid var(--border)',
                    fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)'
                  }}>
                    {d.documentType}
                  </span>
                </div>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {d.doctorName && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Doctor</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.doctorName}</div>
                  </div>
                )}
                {d.hospitalName && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Hospital</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.hospitalName}</div>
                  </div>
                )}
                {d.treatmentDate && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Treatment Date</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(d.treatmentDate).toLocaleDateString()}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Added On</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(d.uploadTimestamp).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Verification Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div>
                  {d.verificationStatus === 'verified' ? (
                    <div>
                      <span className="verification-badge verified">✓ Verified by {d.verifiedByDoctor}</span>
                      {d.verificationTimestamp && (
                        <div className="verification-timestamp" style={{ marginTop: '4px' }}>
                          {new Date(d.verificationTimestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="verification-badge pending">⏳ Pending Verification</span>
                  )}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteDoc(i)} style={{ flexShrink: 0 }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ ADD DOCUMENT MODAL ============ */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3>➕ Add Document Record</h3>
            <p>Enter the details of your medical document for secure record keeping.</p>

            <form onSubmit={handleAddDocument}>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-title">Document Title *</label>
                <input
                  id="doc-title"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Blood Test Report — April 2026"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doc-type">Document Type *</label>
                <select
                  id="doc-type"
                  className="form-input"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  required
                >
                  <option value="" disabled>Select type...</option>
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-doctor">Doctor Name</label>
                  <input
                    id="doc-doctor"
                    className="form-input"
                    type="text"
                    placeholder="Dr. Smith"
                    value={docDoctorName}
                    onChange={(e) => setDocDoctorName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-hospital">Hospital Name</label>
                  <input
                    id="doc-hospital"
                    className="form-input"
                    type="text"
                    placeholder="City Hospital"
                    value={docHospitalName}
                    onChange={(e) => setDocHospitalName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doc-date">Treatment Date</label>
                <input
                  id="doc-date"
                  className="form-input"
                  type="date"
                  value={docTreatmentDate}
                  onChange={(e) => setDocTreatmentDate(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeAddModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ VERIFICATION KEY MODAL ============ */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={closeKeyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!generatedKey ? (
              <>
                <h3>🔑 Generate Verification Key</h3>
                <p>Select how long the doctor should have access to verify your documents.</p>
                <div className="duration-grid">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.minutes}
                      className={`duration-option ${selectedDuration?.minutes === opt.minutes ? 'selected' : ''}`}
                      onClick={() => setSelectedDuration(opt)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={closeKeyModal}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedDuration || generating}
                    onClick={handleGenerateKey}
                  >
                    {generating ? 'Generating...' : 'Generate Key'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>✅ Verification Key Generated</h3>
                <p>Share this key with your doctor to allow document verification.</p>
                <div className="generated-key">
                  <div className="key-value">{generatedKey.key}</div>
                  <div className="key-expiry">
                    Expires: {new Date(generatedKey.expiresAt).toLocaleString()}
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={copyKey}>
                    {copied ? '✓ Copied!' : '📋 Copy Key'}
                  </button>
                  <button className="btn btn-primary" onClick={closeKeyModal}>Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
