import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MedicalProfile() {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditions, setConditions] = useState([]);
  const [conditionInput, setConditionInput] = useState('');
  const [medications, setMedications] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    async function loadData() {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          const med = d.medicalInfo || {};
          setName(d.name || currentUser.displayName || '');
          setBloodGroup(med.bloodGroup || d.bloodGroup || '');
          setAllergies(Array.isArray(med.allergies) ? med.allergies : (Array.isArray(d.allergies) ? d.allergies : []));
          setConditions(Array.isArray(med.medicalConditions) ? med.medicalConditions : (Array.isArray(d.conditions) ? d.conditions : []));
          setMedications(med.medications || d.medications || '');
          setContacts(d.contacts || []);
          setDocuments(d.documents || []);
        }
      } catch (err) {
        console.error('Load error:', err);
      }
    }
    loadData();
  }, [currentUser]);

  async function saveData(overrides = {}) {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: overrides.name !== undefined ? overrides.name : name,
        medicalInfo: {
          bloodGroup: overrides.bloodGroup !== undefined ? overrides.bloodGroup : bloodGroup,
          allergies: overrides.allergies || [...allergies],
          medicalConditions: overrides.medicalConditions || [...conditions],
          medications: overrides.medications !== undefined ? overrides.medications : medications,
        },
        contacts: overrides.contacts || contacts,
        documents: overrides.documents || documents,
        email: currentUser.email,
        updatedAt: new Date().toISOString(),
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
    if (v && !allergies.includes(v)) setAllergies([...allergies, v]);
    setAllergyInput('');
  }
  function addCondition() {
    const v = conditionInput.trim();
    if (v && !conditions.includes(v)) setConditions([...conditions, v]);
    setConditionInput('');
  }
  function addContact() {
    if (!contactForm.name || !contactForm.phone) return;
    setContacts([...contacts, { ...contactForm }]);
    setContactForm({ name: '', phone: '', relation: '' });
  }

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
    } catch (err) {
      flash('Upload error: ' + err.message);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function deleteDoc(i) {
    const d = documents[i];
    try { await deleteObject(ref(storage, d.path)); } catch { /* ignore */ }
    const newDocs = documents.filter((_, idx) => idx !== i);
    setDocuments(newDocs);
    await saveData({ documents: newDocs });
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Medical Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your vital health information</p>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      <div className="grid-2">
        <div className="card fade-in">
          <div className="card-header">
            <h2>Personal Info</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={{ flex: 1 }}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              {bloodGroup && (
                <div style={{
                  background: 'var(--danger)', color: '#fff', fontWeight: 800, fontSize: '1.4rem',
                  padding: '8px 24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)'
                }}>
                  {bloodGroup}
                </div>
              )}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => saveData()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="card fade-in fade-in-delay-1">
          <div className="card-header">
            <h2>Medical Details</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Allergies</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="form-input" placeholder="e.g. Penicillin" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAllergy()} />
              <button className="btn btn-secondary" onClick={addAllergy}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allergies.map((a, i) => <span key={i} className="tag tag-danger">{a}<button className="tag-remove" onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}>×</button></span>)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Medical Conditions</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="form-input" placeholder="e.g. Diabetes" value={conditionInput} onChange={(e) => setConditionInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCondition()} />
              <button className="btn btn-secondary" onClick={addCondition}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {conditions.map((c, i) => <span key={i} className="tag">{c}<button className="tag-remove" onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}>×</button></span>)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Current Medications</label>
            <textarea className="form-textarea" placeholder="List your current medications..." value={medications} onChange={(e) => setMedications(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => saveData()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>

      <div className="card fade-in fade-in-delay-2" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2>Emergency Contacts</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '20px', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="Contact name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="+1234567890" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Relation</label>
            <input className="form-input" placeholder="e.g. Spouse" value={contactForm.relation} onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })} />
          </div>
          <button className="btn btn-secondary" onClick={addContact} style={{ height: '42px' }}>Add Contact</button>
        </div>
        {contacts.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}><p>No emergency contacts added.</p></div>
        ) : (
          contacts.map((c, i) => (
            <div key={i} className="contact-card">
              <div className="contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
              <div className="contact-info">
                <div className="name">{c.name}</div>
                <div className="relation">{c.relation || 'Contact'}</div>
              </div>
              <div className="contact-phone">{c.phone}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}>✕</button>
            </div>
          ))
        )}
        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={() => saveData()} disabled={saving}>{saving ? 'Saving...' : 'Save Contacts'}</button>
        </div>
      </div>

      <div className="card fade-in fade-in-delay-3" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2>Medical Documents</h2>
          <p>Upload prescriptions, lab reports, and other medical documents (PDF)</p>
        </div>
        <div className="file-drop" onClick={() => fileRef.current?.click()}>
          <div className="icon">📄</div>
          <p>{uploading ? 'Uploading...' : 'Click to upload a PDF document'}</p>
          <p className="hint">Max file size: 10MB</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={uploadFile} />
        
        <div className="doc-list" style={{ marginTop: '20px' }}>
          {documents.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}><p>No documents uploaded yet.</p></div>
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
    </div>
  );
}
