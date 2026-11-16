import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  AuthUser,
  fromDbStaff,
  fromDbUser,
  handleDbError,
  isSupabaseConfigured,
  mapSupabaseUser,
  signInWithGoogleOAuth,
  signOutUser,
  supabase,
  toDbUser
} from '../lib/supabase';
import {
  UserProfile,
  UserRole,
  ClassGroup,
  StaffAssignment,
  SEVEN_DPK_DIVISIONS
} from '../types';

export const BOOTSTRAP_ADMIN_EMAIL = 'prasetyoadhitama92@gmail.com';
const PENDING_LOGIN_STORAGE_KEY = 'son_pending_login_options';

export interface LoginOptions {
  intendedRole?: UserRole;
  preferredDivisionId?: string;
  preferredClass?: ClassGroup;
  accessCode?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  profileError: string | null;
  clearProfileError: () => void;
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

function consumePendingLoginOptions(): LoginOptions | null {
  try {
    const raw = sessionStorage.getItem(PENDING_LOGIN_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_LOGIN_STORAGE_KEY);
    return JSON.parse(raw) as LoginOptions;
  } catch {
    return null;
  }
}

function readOAuthUrlError(): string | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hashStr);
    const errDesc =
      searchParams.get('error_description') ||
      hashParams.get('error_description') ||
      searchParams.get('error') ||
      hashParams.get('error');
    if (errDesc) {
      // Clean error query/hash from address bar cleanly
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);
      return decodeURIComponent(errDesc.replace(/\+/g, ' '));
    }
  } catch {
    // Ignore URL parsing issues
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const syncInFlightRef = useRef<string | null>(null);

  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [previewDivisionId, setPreviewDivisionId] = useState<string>(SEVEN_DPK_DIVISIONS[0].id);
  const [previewClassGroup, setPreviewClassGroup] = useState<ClassGroup>('X-1');

  const clearProfileError = useCallback(() => setProfileError(null), []);

  const syncUserFromSession = useCallback(async (authUser: AuthUser, explicitOptions?: LoginOptions | null) => {
    if (!supabase) return;
    if (syncInFlightRef.current === authUser.uid) return;
    syncInFlightRef.current = authUser.uid;
    setProfileError(null);

    const pendingOptions = explicitOptions !== undefined ? explicitOptions : consumePendingLoginOptions();

    try {
      const emailLower = authUser.email.trim().toLowerCase();
      const isBootAdmin = emailLower === BOOTSTRAP_ADMIN_EMAIL;

      const { data: userRow, error: userSelectError } = await supabase
        .from('users')
        .select('*')
        .eq('uid', authUser.uid)
        .maybeSingle();

      if (userSelectError) {
        handleDbError(userSelectError, 'select', 'users');
      }

      const existingData: UserProfile | null = userRow ? fromDbUser(userRow) : null;

      let staffData: StaffAssignment | null = null;
      if (emailLower) {
        const { data: staffRow } = await supabase
          .from('staff_assignments')
          .select('*')
          .eq('email', emailLower)
          .maybeSingle();
        if (staffRow) {
          staffData = fromDbStaff(staffRow);
        }
      }

      const now = new Date().toISOString();

      if (pendingOptions && pendingOptions.intendedRole) {
        const {
          intendedRole,
          preferredDivisionId,
          preferredClass = 'X-1',
          accessCode
        } = pendingOptions;

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
            await signOutUser().catch(() => {});
            setUser(null);
            setProfile(null);
            setProfileError(
              'Peran pendidik/admin memerlukan Kode Otorisasi atau penugasan email oleh Admin (Pak Tio / Koordinator).'
            );
            return;
          }
        }

        const resolvedDivisionId =
          resolvedRole === 'pendamping'
            ? staffData?.assignedDivisionId ||
              preferredDivisionId ||
              existingData?.assignedDivisionId ||
              SEVEN_DPK_DIVISIONS[0].id
            : existingData?.assignedDivisionId;

        const resolvedClassGroup =
          resolvedRole === 'walikelas'
            ? staffData?.assignedClassGroup ||
              preferredClass ||
              existingData?.assignedClassGroup ||
              'X-1'
            : existingData?.assignedClassGroup;

        const desiredProfile: UserProfile = {
          uid: authUser.uid,
          email: emailLower,
          displayName: authUser.displayName || 'Warga Sekolah',
          photoURL: authUser.photoURL || '',
          role: resolvedRole,
          assignedDivisionId: resolvedDivisionId,
          secondaryDivisionId: existingData?.secondaryDivisionId || '',
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
          createdAt: existingData?.createdAt || now,
          updatedAt: now
        };

        const { data: upsertedRow, error: upsertError } = await supabase
          .from('users')
          .upsert(toDbUser(desiredProfile), { onConflict: 'uid' })
          .select('*')
          .single();

        if (upsertError) {
          const msg = (upsertError.message || '').toLowerCase();
          if (
            upsertError.code === '42501' ||
            msg.includes('row-level security') ||
            msg.includes('permission')
          ) {
            await signOutUser().catch(() => {});
            setUser(null);
            setProfile(null);
            setProfileError(
              'Kode otorisasi tidak cocok atau email Anda belum terdaftar untuk peran tersebut. Hubungi Admin (Pak Tio / Koordinator).'
            );
            return;
          }
          handleDbError(upsertError, 'upsert', 'users');
        }

        setUser(authUser);
        setProfile(fromDbUser(upsertedRow));
        setPreviewRole(null);
        return;
      }

      // Normal session restore (no pending login options)
      if (existingData) {
        let updatedData = existingData;

        if (isBootAdmin && existingData.role !== 'admin') {
          const patched = { ...existingData, role: 'admin' as UserRole, canExport: true, updatedAt: now };
          const { data: savedRow, error: updErr } = await supabase
            .from('users')
            .update(toDbUser({ role: 'admin', canExport: true, updatedAt: now }))
            .eq('uid', authUser.uid)
            .select('*')
            .single();
          if (!updErr && savedRow) {
            updatedData = fromDbUser(savedRow);
          } else {
            updatedData = patched;
          }
        } else if (
          staffData &&
          (existingData.role !== staffData.role ||
            existingData.assignedDivisionId !== staffData.assignedDivisionId ||
            existingData.assignedClassGroup !== staffData.assignedClassGroup)
        ) {
          const nextPatch: Partial<UserProfile> = {
            role: staffData.role,
            assignedDivisionId: staffData.assignedDivisionId || existingData.assignedDivisionId,
            assignedClassGroup: staffData.assignedClassGroup || existingData.assignedClassGroup,
            canExport: staffData.canExport ?? true,
            updatedAt: now
          };
          const { data: savedRow, error: updErr } = await supabase
            .from('users')
            .update(toDbUser(nextPatch))
            .eq('uid', authUser.uid)
            .select('*')
            .single();
          if (!updErr && savedRow) {
            updatedData = fromDbUser(savedRow);
          } else {
            updatedData = { ...existingData, ...nextPatch };
          }
        }

        setUser(authUser);
        setProfile(updatedData);
      } else {
        const initialRole: UserRole = isBootAdmin
          ? 'admin'
          : staffData
          ? staffData.role
          : 'murid';

        const newProfile: UserProfile = {
          uid: authUser.uid,
          email: emailLower,
          displayName: authUser.displayName || 'Warga SMA PL Santo Yosef',
          photoURL: authUser.photoURL || '',
          role: initialRole,
          assignedDivisionId: staffData?.assignedDivisionId,
          secondaryDivisionId: '',
          assignedClassGroup: staffData?.assignedClassGroup,
          classGroup: staffData?.assignedClassGroup || 'X-1',
          canExport: initialRole === 'admin' || Boolean(staffData?.canExport),
          createdAt: now,
          updatedAt: now
        };

        const { data: insertedRow, error: insError } = await supabase
          .from('users')
          .upsert(toDbUser(newProfile), { onConflict: 'uid' })
          .select('*')
          .single();

        if (insError) {
          handleDbError(insError, 'insert', 'users');
        }

        setUser(authUser);
        setProfile(fromDbUser(insertedRow));
      }
    } catch (err: unknown) {
      console.error('Error syncing Supabase user profile:', err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      setUser(authUser);
      setProfile(null);
      setProfileError(
        rawMsg || 'Gagal memuat profil peran akun dari Supabase. Silakan coba muat ulang.'
      );
    } finally {
      syncInFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const urlOAuthErr = readOAuthUrlError();
    if (urlOAuthErr) {
      consumePendingLoginOptions();
      setProfileError(`Login Google dibatalkan atau gagal: ${urlOAuthErr}`);
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error('Supabase getSession error:', error);
          setProfileError(error.message);
          setLoading(false);
          return;
        }
        if (session?.user) {
          await syncUserFromSession(mapSupabaseUser(session.user));
        } else {
          setUser(null);
          setProfile(null);
        }
        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.error('Unexpected getSession failure:', err);
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setProfile(null);
        setPreviewRole(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await syncUserFromSession(mapSupabaseUser(session.user));
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserFromSession]);

  const retryProfileSync = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await syncUserFromSession(mapSupabaseUser(data.user), null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (options?: LoginOptions) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Koneksi Supabase belum dikonfigurasi. Lengkapi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada environment build.'
      );
    }

    setProfileError(null);
    const payload: LoginOptions = {
      intendedRole: options?.intendedRole || 'murid',
      preferredDivisionId: options?.preferredDivisionId,
      preferredClass: options?.preferredClass || 'X-1',
      accessCode: options?.accessCode
    };

    try {
      sessionStorage.setItem(PENDING_LOGIN_STORAGE_KEY, JSON.stringify(payload));
      await signInWithGoogleOAuth();
    } catch (err) {
      sessionStorage.removeItem(PENDING_LOGIN_STORAGE_KEY);
      throw err;
    }
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem(PENDING_LOGIN_STORAGE_KEY);
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
    if (!user || !supabase) return;
    try {
      const now = new Date().toISOString();
      const dbPatch = toDbUser({ ...data, updatedAt: now });
      const { error } = await supabase.from('users').update(dbPatch).eq('uid', user.uid);
      if (error) {
        handleDbError(error, 'update', `users/${user.uid}`);
      }
      setProfile((prev) => (prev ? { ...prev, ...data, updatedAt: now } : null));
    } catch (error) {
      handleDbError(error, 'update', `users/${user.uid}`);
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
        clearProfileError,
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
