import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types/risk';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Silent
  }
}

// Subscribe to auth state changes
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Google Sign-In
export async function loginWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err: any) {
    // If popup blocked or failed in iframe, provide informative message
    const msg = err.code === 'auth/popup-blocked'
      ? 'החלון הקופץ נחסם על ידי הדפדפן. אפשר חלונות קופצים או השתמש בדוא״ל/אורח.'
      : 'שגיאה בהתחברות עם חשבון Google.';
    return { success: false, error: msg };
  }
}

// Email/Password Login
export async function loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (err: any) {
    let msg = 'שגיאה בהתחברות. בדוק את הדוא״ל והסיסמה.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'שם משתמש או סיסמה שגויים.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'כתובת דוא״ל אינה תקינה.';
    }
    return { success: false, error: msg };
  }
}

// Email/Password Registration
export async function registerWithEmail(email: string, pass: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (name.trim()) {
      await updateProfile(result.user, { displayName: name.trim() });
    }
    return { success: true, user: result.user };
  } catch (err: any) {
    let msg = 'שגיאה ביצירת החשבון.';
    if (err.code === 'auth/email-already-in-use') {
      msg = 'כתובת דוא״ל זו כבר רשומה במערכת.';
    } else if (err.code === 'auth/weak-password') {
      msg = 'הסיסמה חלשה מדי. הזן לפחות 6 תווים.';
    }
    return { success: false, error: msg };
  }
}

// Anonymous / Guest Login
export async function loginAsGuest(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await signInAnonymously(auth);
    return { success: true, user: result.user };
  } catch (err: any) {
    return { success: false, error: 'שגיאה בכניסה כאורח.' };
  }
}

// Sign Out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Silent
  }
}

// Save User Profile to Firestore
export async function saveProfileToFirestore(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      updatedAt: Date.now()
    }, { merge: true });
  } catch {
    // Silent
  }
}

// Load User Profile from Firestore
export async function loadProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch {
    // Silent
  }
  return null;
}
