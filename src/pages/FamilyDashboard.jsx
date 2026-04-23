import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import FamilyMemberForm from '../components/FamilyMemberForm';

export default function FamilyDashboard() {
  const { currentUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsubFamily = onSnapshot(collection(db, 'families', currentUser.uid, 'members'), (snap) => {
      const members = [];
      snap.forEach(d => members.push({ id: d.id, ...d.data() }));
      setFamilyMembers(members);
    });
    return () => unsubFamily();
  }, [currentUser]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Family Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage emergency profiles for your family members</p>
      </div>

      <div className="card fade-in">
        {editingMember ? (
          <FamilyMemberForm 
            member={editingMember === 'new' ? null : editingMember}
            onSave={() => setEditingMember(null)}
            onCancel={() => setEditingMember(null)}
          />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Family Members</h2>
              <button className="btn btn-primary" onClick={() => setEditingMember('new')}>
                + Add Member
              </button>
            </div>
            
            {familyMembers.length === 0 ? (
              <div className="empty-state">
                <div className="icon">👨‍👩‍👧‍👦</div>
                <p>No family members added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {familyMembers.map((m) => (
                  <div key={m.id} className="contact-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="contact-info">
                      <div className="name">{m.name}</div>
                      <div className="relation" style={{ marginTop: '4px' }}>
                        Blood Group: {m.bloodGroup || 'N/A'} | Age: {m.age || 'N/A'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingMember(m)}>Edit</button>
                      <a href={`/emergency/member/${m.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">View QR</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
