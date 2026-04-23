import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, collection, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function FamilyMemberForm({ member, onSave, onCancel }) {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState(member?.name || '');
  const [age, setAge] = useState(member?.age || '');
  const [bloodGroup, setBloodGroup] = useState(member?.bloodGroup || '');
  const [govId, setGovId] = useState(member?.governmentId || '');
  
  const [allergies, setAllergies] = useState(member?.allergies || []);
  const [allergyInput, setAllergyInput] = useState('');
  
  const [conditions, setConditions] = useState(member?.medicalConditions || []);
  const [conditionInput, setConditionInput] = useState('');
  
  const [medications, setMedications] = useState(member?.medications || '');
  
  const [contacts, setContacts] = useState(member?.emergencyContacts || []);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });

  const [location, setLocation] = useState(member?.lastLocation || null);

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

  function captureLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: new Date().toISOString() }),
        (err) => console.error("Location error:", err)
      );
    }
  }

  useEffect(() => {
    captureLocation();
  }, []);

  async function handleSave() {
    if (!name) return alert('Name is required');
    setSaving(true);
    try {
      let memberId = member?.id;
      if (!memberId) {
        const tempRef = doc(collection(db, 'families', currentUser.uid, 'members'));
        memberId = `${currentUser.uid}_${tempRef.id}`;
      }
      
      const memberRef = doc(db, 'families', currentUser.uid, 'members', memberId);
      const data = {
        name, age, bloodGroup, governmentId: govId,
        allergies, medicalConditions: conditions, medications,
        emergencyContacts: contacts,
        lastLocation: location,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(memberRef, data, { merge: true });
      onSave();
    } catch (err) {
      console.error(err);
      alert('Error saving: ' + err.message);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!member?.id) return;
    if (confirm('Delete this family member?')) {
      try {
        await deleteDoc(doc(db, 'families', currentUser.uid, 'members', member.id));
        onSave();
      } catch (err) {
        alert('Error deleting: ' + err.message);
      }
    }
  }

  const qrUrl = member?.id ? `${window.location.origin}/emergency/member/${member.id}` : '';

  return (
    <div className="fade-in">
      <button className="btn btn-ghost" onClick={onCancel} style={{ marginBottom: '16px' }}>← Back to List</button>
      
      <div className="grid-2">
        <div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Member Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Government ID (Optional Aadhaar Placeholder)</label>
            <input className="form-input" value={govId} onChange={e => setGovId(e.target.value)} placeholder="XXXX-XXXX-XXXX" />
          </div>
        </div>

        <div>
          <div className="form-group">
            <label className="form-label">Allergies</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="form-input" value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAllergy()} placeholder="Add allergy" />
              <button className="btn btn-secondary" onClick={addAllergy}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allergies.map((a, i) => <span key={i} className="tag tag-danger">{a} <button className="tag-remove" onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}>×</button></span>)}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Medical Conditions</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="form-input" value={conditionInput} onChange={e => setConditionInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCondition()} placeholder="Add condition" />
              <button className="btn btn-secondary" onClick={addCondition}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {conditions.map((c, i) => <span key={i} className="tag">{c} <button className="tag-remove" onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}>×</button></span>)}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Medications</label>
            <textarea className="form-textarea" value={medications} onChange={e => setMedications(e.target.value)} placeholder="Current medications..." />
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label className="form-label">Emergency Contacts</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '10px' }}>
          <input className="form-input" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
          <input className="form-input" placeholder="Phone" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
          <input className="form-input" placeholder="Relation" value={contactForm.relation} onChange={e => setContactForm({...contactForm, relation: e.target.value})} />
          <button className="btn btn-secondary" onClick={addContact}>Add</button>
        </div>
        <div>
          {contacts.map((c, i) => (
            <div key={i} className="contact-card" style={{ padding: '8px', marginBottom: '4px' }}>
              <div className="contact-info"><strong>{c.name}</strong> ({c.relation}) - {c.phone}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {member?.id && (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <h3>Member QR Code</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Scan for emergency profile</p>
          <div style={{ background: '#fff', display: 'inline-block', padding: '16px', borderRadius: '12px' }}>
            <QRCodeSVG value={qrUrl} size={150} level="H" includeMargin={true} fgColor="#0f172a" bgColor="#ffffff" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Preview Emergency Page</a>
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Member'}</button>
        {member?.id && <button className="btn btn-danger" onClick={handleDelete}>Delete</button>}
      </div>
    </div>
  );
}
