import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
  isAuthCancellationError
} from '../lib/firebase';
import {
  UserProfile,
  UserRole,
  ClassGroup,
  StaffAssignment,
  SEVEN_DPK_DIVISIONS
} from '../types';

export const BOOTSTRAP_ADMIN_EMAIL = 'prasetyoadhitama92@gmail.com';

export interface LoginOptions {
  intendedRole?: UserRole;
  preferredDivisionId?: string;
  preferredClass?: ClassGroup;
  accessCode?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  profileError: string | null;
  loading: boolean;
  realRole: UserRole;
  activeRole: UserRole;
  previewDivisionId: string;
  previewClassGroup: ClassGroup;
  isPreviewing: boolean;
  setPreviewContext: (role: UserRole | null, divisionId?: string, classGroup?: ClassGroup) => void;
  clearPreview: () => void;
  loginWithGoogle: (options?: LoginOptions) => Promise<void>;
  retryProfileSync: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function stripUndefined<T extends object>(obj: T): T {
  const result: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) {
      result[k] = v;
    }
  });
  return result as T;
}

async function ensureAdminDefaults(adminEmail: string) {
  try {
    const configRef = doc(db, 'appConfig', 'default');
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, {
        id: 'default',
        primaryDivisionWeight: 60,
        secondaryDivisionWeight: 40,
        allowStudentDivisionSelection: true,
        updatedBy: adminEmail,
        updatedAt: new Date().toISOString()
      });
    }

    const defaultCodes: { code: string; role: 'admin' | 'pendamping' | 'walikelas'; label: string }[] = [
      { code: 'PENDAMPING2026', role: 'pendamping', label: 'Kode Guru Pendamping Divisi' },
      { code: 'WALIKELAS2026', role: 'walikelas', label: 'Kode Wali Kelas X-1 s/d X-6' },
      { code: 'ADMIN2026', role: 'admin', label: 'Kode Admin / Koordinator' }
    ];

    for (const item of defaultCodes) {
      const codeRef = doc(db, 'roleCodes', item.code);
      const codeSnap = await getDoc(codeRef);
      if (!codeSnap.exists()) {
        await setDoc(codeRef, {
          code: item.code,
          role: item.role,
          label: item.label,
          active: true,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('Could not initialize admin defaults yet:', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isManualLoginRef = useRef<boolean>(false);

  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [previewDivisionId, setPreviewDivisionId] = useState<string>(SEVEN_DPK_DIVISIONS[0].id);
  const [previewClassGroup, setPreviewClassGroup] = useState<ClassGroup>('X-1');

  const syncUserFromAuth = async (currentUser: User) => {
    setProfileError(null);
    try {
      const emailLower = (currentUser.email || '').trim().toLowerCase();
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      let staffData: StaffAssignment | null = null;
      if (emailLower) {
        try {
          const staffSnap = await getDoc(doc(db, 'staffAssignments', emailLower));
          if (staffSnap.exists()) {
            staffData = staffSnap.data() as StaffAssignment;
          }
        } catch {
          // Staff assignment may not exist for student accounts
        }
      }

      const isBootAdmin = emailLower === BOOTSTRAP_ADMIN_EMAIL;

      if (docSnap.exists()) {
        let data = docSnap.data() as UserProfile;

        if (isBootAdmin && data.role !== 'admin') {
          data = { ...data, role: 'admin', canExport: true, updatedAt: new Date().toISOString() };
          await setDoc(userDocRef, stripUndefined(data), { merge: true });
        } else if (
          staffData &&
          (data.role !== staffData.role ||
            data.assignedDivisionId !== staffData.assignedDivisionId ||
            data.assignedClassGroup !== staffData.assignedClassGroup)
        ) {
          data = stripUndefined({
            ...data,
            role: staffData.role,
            assignedDivisionId: staffData.assignedDivisionId || data.assignedDivisionId,
            assignedClassGroup: staffData.assignedClassGroup || data.assignedClassGroup,
            canExport: staffData.canExport ?? true,
            updatedAt: new Date().toISOString()
          });
          await setDoc(userDocRef, data, { merge: true });
        }

        setProfile(data);
        if (data.role === 'admin') {
          await ensureAdminDefaults(emailLower);
        }
      } else {
        const initialRole: UserRole = isBootAdmin
          ? 'admin'
          : staffData
          ? staffData.role
          : 'murid';

        const newProfile: UserProfile = stripUndefined({
          uid: currentUser.uid,
          email: emailLower,
          displayName: currentUser.displayName || 'Warga SMA PL Santo Yosef',
          photoURL: currentUser.photoURL || '',
          role: initialRole,
          assignedDivisionId: staffData?.assignedDivisionId,
          assignedClassGroup: staffData?.assignedClassGroup,
          classGroup: staffData?.assignedClassGroup || 'X-1',
          canExport: initialRole === 'admin' || Boolean(staffData?.canExport),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        if (initialRole === 'admin') {
          await ensureAdminDefaults(emailLower);
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching or syncing user profile:', err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('resource-exhausted')) {
        setProfileError(
          'Kuota baca harian gratis Firebase Firestore telah habis, sehingga profil peran akun Anda belum dapat dimuat. Tunggu reset kuota esok hari atau upgrade database Firestore di Firebase Console.'
        );
      } else {
        setProfileError('Gagal memuat profil peran akun dari Firestore. Silakan coba muat ulang.');
      }
    }
  };

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (isManualLoginRef.current) {
        return;
      }
      setUser(currentUser);
      if (currentUser) {
        await syncUserFromAuth(currentUser);
      } else {
        setProfile(null);
        setProfileError(null);
        setPreviewRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const retryProfileSync = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    await syncUserFromAuth(auth.currentUser);
    setLoading(false);
  };

  const loginWithGoogle = async (options?: LoginOptions) => {
    const {
      intendedRole = 'murid',
      preferredDivisionId,
      preferredClass = 'X-1',
      accessCode
    } = options || {};

    isManualLoginRef.current = true;
    setProfileError(null);
    setLoading(true);
    let googleSignedIn = false;
    try {
      const loggedUser = await signInWithGoogle();
      googleSignedIn = true;
      const emailLower = (loggedUser.email || '').trim().toLowerCase();
      const userDocRef = doc(db, 'users', loggedUser.uid);
      const docSnap = await getDoc(userDocRef);

      let staffData: StaffAssignment | null = null;
      if (emailLower) {
        try {
          const staffSnap = await getDoc(doc(db, 'staffAssignments', emailLower));
          if (staffSnap.exists()) {
            staffData = staffSnap.data() as StaffAssignment;
          }
        } catch {
          // No pre-assigned staff record
        }
      }

      const isBootAdmin = emailLower === BOOTSTRAP_ADMIN_EMAIL;
      const existingData = docSnap.exists() ? (docSnap.data() as UserProfile) : null;

      let resolvedRole: UserRole = intendedRole;
      if (isBootAdmin && intendedRole === 'admin') {
        resolvedRole = 'admin';
      } else if (staffData && staffData.role === intendedRole) {
        resolvedRole = staffData.role;
      } else if (
        (intendedRole === 'pendamping' || intendedRole === 'walikelas' || intendedRole === 'admin') &&
        !isBootAdmin &&
        existingData?.role !== intendedRole
      ) {
        if (!accessCode || !accessCode.trim()) {
          throw new Error(
            'Peran pendidik/admin memerlukan Kode Otorisasi atau penugasan email oleh Admin (Pak Tio / Koordinator).'
          );
        }
      }

      const resolvedDivisionId =
        resolvedRole === 'pendamping'
          ? staffData?.assignedDivisionId || preferredDivisionId || existingData?.assignedDivisionId || SEVEN_DPK_DIVISIONS[0].id
          : existingData?.assignedDivisionId;

      const resolvedClassGroup =
        resolvedRole === 'walikelas'
          ? staffData?.assignedClassGroup || preferredClass || existingData?.assignedClassGroup || 'X-1'
          : existingData?.assignedClassGroup;

      const userProfile: UserProfile = stripUndefined({
        uid: loggedUser.uid,
        email: emailLower,
        displayName: loggedUser.displayName || 'Warga Sekolah',
        photoURL: loggedUser.photoURL || '',
        role: resolvedRole,
        assignedDivisionId: resolvedDivisionId,
        secondaryDivisionId: existingData?.secondaryDivisionId,
        assignedClassGroup: resolvedClassGroup,
        studentId: existingData?.studentId,
        classGroup: preferredClass || existingData?.classGroup || 'X-1',
        nisn: existingData?.nisn,
        canExport:
          resolvedRole === 'admin' ||
          resolvedRole === 'pendamping' ||
          resolvedRole === 'walikelas' ||
          Boolean(staffData?.canExport),
        inviteCode: accessCode ? accessCode.trim().toUpperCase() : existingData?.inviteCode,
        updatedAt: new Date().toISOString(),
        ...(existingData ? {} : { createdAt: new Date().toISOString() })
      });

      try {
        await setDoc(userDocRef, userProfile, { merge: true });
      } catch (writeErr: unknown) {
        const msg = writeErr instanceof Error ? writeErr.message : String(writeErr);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
          throw new Error(
            'Kode otorisasi tidak cocok atau email Anda belum terdaftar untuk peran tersebut. Hubungi Admin (Pak Tio / Koordinator).'
          );
        }
        throw writeErr;
      }

      setUser(loggedUser);
      setProfile(userProfile);
      setProfileError(null);
      setPreviewRole(null);

      if (resolvedRole === 'admin') {
        await ensureAdminDefaults(emailLower);
      }
    } catch (error) {
      if (googleSignedIn) {
        // Prevent leaving user half-logged-in with null profile (which previously fell back to Student view)
        await signOutUser().catch(() => {});
        setUser(null);
        setProfile(null);
      }
      if (isAuthCancellationError(error)) {
        console.info('Google sign-in was cancelled by the user.');
      } else {
        console.error('Failed to sign in with Google:', error);
      }
      throw error;
    } finally {
      isManualLoginRef.current = false;
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
      setProfileError(null);
      setPreviewRole(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updated = stripUndefined({
        ...data,
        updatedAt: new Date().toISOString()
      });
      await updateDoc(userDocRef, updated);
      setProfile((prev) => (prev ? { ...prev, ...updated } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const realRole: UserRole =
    profile?.role ||
    (user?.email?.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL ? 'admin' : 'murid');
  const activeRole: UserRole = realRole === 'admin' && previewRole ? previewRole : realRole;
  const isPreviewing = realRole === 'admin' && previewRole !== null && previewRole !== 'admin';

  const setPreviewContext = (role: UserRole | null, divisionId?: string, classGroup?: ClassGroup) => {
    if (realRole !== 'admin') return;
    setPreviewRole(role);
    if (divisionId) setPreviewDivisionId(divisionId);
    if (classGroup) setPreviewClassGroup(classGroup);
  };

  const clearPreview = () => {
    setPreviewRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileError,
        loading,
        realRole,
        activeRole,
        previewDivisionId,
        previewClassGroup,
        isPreviewing,
        setPreviewContext,
        clearPreview,
        loginWithGoogle,
        retryProfileSync,
        logout,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
