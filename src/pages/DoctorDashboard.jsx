import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

export default function DoctorDashboard() {
  const { currentUser, userData } = useAuth();
  const [verificationKey, setVerificationKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);

  // After key is validated
  const [accessGranted, setAccessGranted] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientDocs, setPatientDocs] = useState([]);
  const [verifyingIdx, setVerifyingIdx] = useState(null);
  const [msg, setMsg] = useState('');

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleKeySubmit(e) {
    e.preventDefault();
    setKeyError('');
    setKeyLoading(true);

    try {
      // Query verificationKeys collection for this key
      const q = query(
        collection(db, 'verificationKeys'),
        where('key', '==', verificationKey.trim().toUpperCase()),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setKeyError('Invalid or expired verification key.');
        setKeyLoading(false);
        return;
      }

      const keyDoc = snap.docs[0];
      const keyData = keyDoc.data();

      // Check expiry
      if (new Date(keyData.expiresAt) <= new Date()) {
        // Mark as expired
        await setDoc(doc(db, 'verificationKeys', keyDoc.id), { status: 'expired' }, { merge: true });
        setKeyError('This verification key has expired.');
        setKeyLoading(false);
        return;
      }

      // Load patient documents
      const patientSnap = await getDoc(doc(db, 'users', keyData.patientId));
      if (!patientSnap.exists()) {
        setKeyError('Patient not found.');
        setKeyLoading(false);
        return;
      }

      const pData = patientSnap.data();
      setPatientId(keyData.patientId);
      setPatientName(pData.name || 'Patient');
      setPatientDocs(pData.documents || []);
      setAccessGranted(true);
    } catch (err) {
      setKeyError('Error validating key: ' + err.message);
    }
    setKeyLoading(false);
  }

  async function handleVerifyDocument(idx) {
    if (!patientId) return;
    setVerifyingIdx(idx);

    try {
      const updatedDocs = [...patientDocs];
      updatedDocs[idx] = {
        ...updatedDocs[idx],
        verificationStatus: 'verified',
        verifiedByDoctor: userData?.name || currentUser.displayName || 'Doctor',
        verifiedByHospital: userData?.hospitalName || 'Unknown Hospital',
        verificationTimestamp: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', patientId), { documents: updatedDocs }, { merge: true });
      setPatientDocs(updatedDocs);
      flash(`Document "${updatedDocs[idx].documentTitle}" verified successfully!`);
    } catch (err) {
      flash('Error verifying document: ' + err.message);
    }
    setVerifyingIdx(null);
  }

  function handleDisconnect() {
    setAccessGranted(false);
    setPatientId(null);
    setPatientName('');
    setPatientDocs([]);
    setVerificationKey('');
    setKeyError('');
    setMsg('');
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
          Provider Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Welcome, {userData?.name || currentUser?.displayName}. Verify patient medical documents securely.
        </p>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      {!accessGranted ? (
        /* Key Entry Card */
        <div className="card" style={{ maxWidth: '560px' }}>
          <div className="card-header">
            <h2>🔑 Enter Verification Key</h2>
            <p>Enter the verification key provided by the patient to access their documents for verification.</p>
          </div>

          {keyError && <div className="alert alert-error">⚠️ {keyError}</div>}

          <form onSubmit={handleKeySubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="ver-key">Verification Key</label>
              <input
                id="ver-key"
                className="form-input"
                type="text"
                placeholder="MV-VER-XXXX-XXXX"
                value={verificationKey}
                onChange={(e) => setVerificationKey(e.target.value)}
                style={{ fontFamily: "'Courier New', monospace", fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={keyLoading}>
              {keyLoading ? 'Validating...' : 'Access Patient Documents'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>ℹ️ How it works</div>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Patient generates a time-limited verification key from their Documents page</li>
              <li>Enter the key above to view and verify their medical document records</li>
              <li>Access expires automatically after the patient-selected duration</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Patient Documents View */
        <div>
          <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}>
                  📋 Viewing documents for: {patientName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  You can view and verify document records only. No profile editing is allowed.
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </div>

          {patientDocs.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="icon">📂</div>
                <p>This patient has no document records.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2>Patient Documents ({patientDocs.length})</h2>
                <p>Review and verify each document below.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {patientDocs.map((d, i) => (
                  <div key={i} className="verify-doc-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      {/* Icon */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(46,125,50,0.1)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0
                      }}>
                        {typeIcons[d.documentType] || '📄'}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {d.documentTitle}
                        </div>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-main)', border: '1px solid var(--border)',
                          fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px'
                        }}>
                          {d.documentType}
                        </span>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px', marginBottom: '8px' }}>
                          {d.doctorName && (
                            <div style={{ fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Doctor: </span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.doctorName}</span>
                            </div>
                          )}
                          {d.hospitalName && (
                            <div style={{ fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Hospital: </span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.hospitalName}</span>
                            </div>
                          )}
                          {d.treatmentDate && (
                            <div style={{ fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(d.treatmentDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Verification Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {d.verificationStatus === 'verified' ? (
                            <>
                              <span className="verification-badge verified">✓ Verified by {d.verifiedByDoctor}</span>
                              {d.verifiedByHospital && (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  ({d.verifiedByHospital})
                                </span>
                              )}
                              {d.verificationTimestamp && (
                                <span className="verification-timestamp">
                                  {new Date(d.verificationTimestamp).toLocaleString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="verification-badge pending">⏳ Pending Verification</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignSelf: 'center' }}>
                        {d.verificationStatus !== 'verified' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleVerifyDocument(i)}
                            disabled={verifyingIdx === i}
                          >
                            {verifyingIdx === i ? 'Verifying...' : '✓ Verify Document'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
