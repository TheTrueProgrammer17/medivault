import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('medical');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  // Medical info state
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditions, setConditions] = useState([]);
  const [conditionInput, setConditionInput] = useState('');
  const [medications, setMedications] = useState('');

  // Emergency contacts state
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        const d = snap.data();
        setBloodGroup(d.bloodGroup || '');
        setAllergies(d.allergies || []);
        setConditions(d.conditions || []);
        setMedications(d.medications || '');
        setContacts(d.contacts || []);
        setDocuments(d.documents || []);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
  }

  async function saveData(overrides = {}) {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        bloodGroup, allergies, conditions, medications, contacts, documents,
        name: currentUser.displayName || '',
        email: currentUser.email,
        updatedAt: new Date().toISOString(),
        ...overrides,
      }, { merge: true });
      flash('Saved successfully!');
    } catch (err) {
      flash('Error saving: ' + err.message);
    }
    setSaving(false);
  }

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  function addAllergy() {
    const v = allergyInput.trim();
    if (v && !allergies.includes(v)) { setAllergies([...allergies, v]); }
    setAllergyInput('');
  }
  function removeAllergy(i) { setAllergies(allergies.filter((_, idx) => idx !== i)); }

  function addCondition() {
    const v = conditionInput.trim();
    if (v && !conditions.includes(v)) { setConditions([...conditions, v]); }
    setConditionInput('');
  }
  function removeCondition(i) { setConditions(conditions.filter((_, idx) => idx !== i)); }

  function addContact() {
    if (!contactForm.name || !contactForm.phone) return;
    setContacts([...contacts, { ...contactForm }]);
    setContactForm({ name: '', phone: '', relation: '' });
  }
  function removeContact(i) { setContacts(contacts.filter((_, idx) => idx !== i)); }

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { flash('Only PDF files are allowed.'); return; }
    if (file.size > 10 * 1024 * 1024) { flash('File must be under 10MB.'); return; }
    setUploading(true);
    try {
      const path = `documents/${currentUser.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const newDoc = { name: file.name, url, path, uploadedAt: new Date().toISOString(), size: file.size };
      const newDocs = [...documents, newDoc];
      setDocuments(newDocs);
      await saveData({ documents: newDocs });
      flash('Document uploaded!');
    } catch (err) {
      flash('Upload error: ' + err.message);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function deleteDoc(i) {
    const d = documents[i];
    try {
      await deleteObject(ref(storage, d.path));
    } catch (err) { /* file might not exist */ }
    const newDocs = documents.filter((_, idx) => idx !== i);
    setDocuments(newDocs);
    await saveData({ documents: newDocs });
    flash('Document deleted.');
  }

  const qrUrl = `${window.location.origin}/emergency/${currentUser?.uid}`;

  return (
    <div className="page container fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          Your Medical Vault
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your health data and emergency information
        </p>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      <div className="tabs">
        {['medical', 'contacts', 'documents', 'qr'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'medical' && '🩺 Medical Info'}
            {t === 'contacts' && '📞 Emergency Contacts'}
            {t === 'documents' && '📄 Documents'}
            {t === 'qr' && '📱 QR Code'}
          </button>
        ))}
      </div>

      {/* Medical Info Tab */}
      {tab === 'medical' && (
        <div className="card fade-in">
          <div className="card-header">
            <h2>Medical Information</h2>
            <p>Your vital health details for emergencies</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="blood-group">Blood Group</label>
            <select id="blood-group" className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Allergies</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="form-input" placeholder="e.g. Penicillin"
                value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())} />
              <button type="button" className="btn btn-secondary" onClick={addAllergy}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allergies.map((a, i) => (
                <span key={i} className="tag tag-danger">{a}<button className="tag-remove" onClick={() => removeAllergy(i)}>×</button></span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Medical Conditions</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="form-input" placeholder="e.g. Diabetes"
                value={conditionInput} onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())} />
              <button type="button" className="btn btn-secondary" onClick={addCondition}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {conditions.map((c, i) => (
                <span key={i} className="tag">{c}<button className="tag-remove" onClick={() => removeCondition(i)}>×</button></span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="medications">Current Medications</label>
            <textarea id="medications" className="form-textarea" placeholder="List your current medications..."
              value={medications} onChange={(e) => setMedications(e.target.value)} />
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => saveData()} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Medical Info'}
          </button>
        </div>
      )}

      {/* Emergency Contacts Tab */}
      {tab === 'contacts' && (
        <div className="card fade-in">
          <div className="card-header">
            <h2>Emergency Contacts</h2>
            <p>People to notify in case of an emergency</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '20px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Contact name" value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+1234567890" value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Relation</label>
              <input className="form-input" placeholder="e.g. Spouse" value={contactForm.relation}
                onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={addContact} style={{ height: '45px' }}>Add</button>
          </div>

          {contacts.length === 0 ? (
            <div className="empty-state"><div className="icon">📞</div><p>No emergency contacts added yet.</p></div>
          ) : (
            contacts.map((c, i) => (
              <div key={i} className="contact-card">
                <div className="contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div className="contact-info">
                  <div className="name">{c.name}</div>
                  <div className="relation">{c.relation || 'Contact'}</div>
                </div>
                <div className="contact-phone">{c.phone}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeContact(i)}>✕</button>
              </div>
            ))
          )}

          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary btn-lg" onClick={() => saveData()} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Contacts'}
            </button>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'documents' && (
        <div className="card fade-in">
          <div className="card-header">
            <h2>Medical Documents</h2>
            <p>Upload prescriptions, lab reports, and medical records (PDF only)</p>
          </div>

          <div className="file-drop" onClick={() => fileRef.current?.click()}>
            <div className="icon">📎</div>
            <p>{uploading ? 'Uploading...' : 'Click to upload a PDF document'}</p>
            <p className="hint">Max file size: 10MB</p>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={uploadFile} />

          <div className="doc-list" style={{ marginTop: '20px' }}>
            {documents.length === 0 ? (
              <div className="empty-state"><div className="icon">📄</div><p>No documents uploaded yet.</p></div>
            ) : (
              documents.map((d, i) => (
                <div key={i} className="doc-item">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <div className="name">{d.name}</div>
                    <div className="meta">{(d.size / 1024).toFixed(1)} KB · {new Date(d.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="doc-actions">
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View</a>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDoc(i)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QR Code Tab */}
      {tab === 'qr' && (
        <div className="card fade-in">
          <div className="card-header" style={{ textAlign: 'center' }}>
            <h2>Emergency QR Code</h2>
            <p>Print or share this code. When scanned, it shows your blood group, allergies, and emergency contacts.</p>
          </div>
          <div className="qr-container">
            <div className="qr-wrapper">
              <QRCodeSVG value={qrUrl} size={220} level="H" includeMargin={true}
                fgColor="#0f172a" bgColor="#ffffff" />
            </div>
            <p className="qr-instruction">
              Scan with any phone camera to view emergency medical information. Full medical records require login.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(qrUrl); flash('Link copied!'); }}>
                📋 Copy Link
              </button>
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                🔗 Preview Page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
