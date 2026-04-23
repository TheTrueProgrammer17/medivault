import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });

    // Create initial Firestore document with UID as document ID
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: displayName,
      email: email,
      bloodGroup: '',
      allergies: [],
      conditions: [],
      medications: '',
      contacts: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return userCredential;
  }

  async function signupDoctor(email, password, displayName, hospitalName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });

    await setDoc(doc(db, 'doctors', userCredential.user.uid), {
      name: displayName,
      email: email,
      hospitalName: hospitalName,
      role: 'doctor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          document.documentElement.setAttribute('data-theme', 'patient');
        } else {
          docSnap = await getDoc(doc(db, 'doctors', user.uid));
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            document.documentElement.setAttribute('data-theme', 'doctor');
          }
        }
      } else {
        setUserData(null);
        document.documentElement.removeAttribute('data-theme');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    signupDoctor,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

