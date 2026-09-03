import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Personnel,
  UserAccount,
  Role,
  Battery,
  ParadeStatus,
  DutyAssignment,
  AuditLogItem,
  BatteryParadeSummary,
  DailyParadePoint,
  ParadePointCount,
  OutOfUnitCategory,
} from '../types';
import {
  INITIAL_PERSONNEL,
  INITIAL_USERS,
  INITIAL_DUTY_ROSTER,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import { INITIAL_PARADE_POINTS } from '../data/paradePointsData';
import {
  db,
  auth,
  signInWithGoogle,
  logoutFirebase,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  onAuthStateChanged,
  FirebaseUser,
} from '../lib/firebase';

interface AppContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchRole: (role: Role, battery?: Battery) => void;
  usersList: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  updateUser: (id: string, updated: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  personnelList: Personnel[];
  addPersonnel: (person: Omit<Personnel, 'id'>) => void;
  updatePersonnel: (id: string, updated: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  updateParadeStatus: (id: string, status: ParadeStatus, statusDetails?: string) => void;
  updatePersonnelStatus?: (id: string, status: ParadeStatus, statusDetails?: string) => void;
  batchUpdateStatus: (ids: string[], status: ParadeStatus, statusDetails?: string) => void;
  dutyRoster: DutyAssignment[];
  addDutyAssignment: (assignment: Omit<DutyAssignment, 'id'>) => void;
  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, details: string, category: AuditLogItem['category']) => void;
  getBatterySummaries: () => BatteryParadeSummary[];
  getRegimentalTotals: () => {
    totalPosted: number;
    totalPresent: number;
    totalDuty: number;
    totalSick: number;
    totalLeave: number;
    totalCourse: number;
    totalTempDuty: number;
    totalAttached: number;
    totalAbsent: number;
    presentPercentage: number;
  };
  activePage: string;
  setActivePage: (page: string) => void;
  selectedBatteryFilter: Battery | 'All';
  setSelectedBatteryFilter: (bty: Battery | 'All') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  notification: string | null;
  showNotification: (msg: string) => void;

  // Daily Parade State Management
  dailyParadePoints: DailyParadePoint[];
  updateParadePointCount: (pointId: string, battery: Battery, counts: ParadePointCount) => void;
  togglePointForBattery: (pointId: string, battery: Battery, enabled: boolean) => void;
  setRsmPointSuggestion: (pointId: string, suggestion: Partial<ParadePointCount>) => void;
  addDailyParadePoint: (name: string, enabledBatteries?: Battery[], initialCounts?: ParadePointCount) => void;
  deleteDailyParadePoint: (pointId: string) => void;
  toggleDailyParadePointActive: (pointId: string, active: boolean) => void;

  // Out Of Unit Management
  assignOutOfUnit: (
    personnelId: string,
    category: OutOfUnitCategory,
    details: {
      location?: string;
      startDate?: string;
      endDate?: string;
      authority?: string;
      remarks?: string;
    }
  ) => void;
  cancelOutOfUnit: (personnelId: string) => void;

  // Modal triggers
  syncNominalRollToCloud: () => Promise<void>;
  dailyParadeModalOpen: boolean;
  setDailyParadeModalOpen: (open: boolean) => void;
  outOfUnitModalOpen: boolean;
  setOutOfUnitModalOpen: (open: boolean) => void;
  activeOutOfUnitCategory: OutOfUnitCategory;
  setActiveOutOfUnitCategory: (cat: OutOfUnitCategory) => void;

  // Authentication & Session
  isAuthenticated: boolean;
  loginWithCredentials: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => Promise<void>;

  // Firebase Auth & Cloud Sync
  firebaseUser: FirebaseUser | null;
  isFirebaseReady: boolean;
  loginWithGoogle: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PERSONNEL: '10med_personnel_v5',
  USER: '10med_currentUser_v1',
  USERS_LIST: '10med_users_v2',
  DUTY: '10med_duty_v1',
  LOGS: '10med_logs_v1',
  LOGO: '10med_custom_logo_v1',
  PARADE_POINTS: '10med_parade_points_v1',
  AUTH_STATUS: '10med_auth_status_v2',
  ACTIVE_PAGE: '10med_active_page_v2',
};

// Helper to strip undefined values so Firestore does not throw serialization error
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)).filter((item) => item !== undefined) as any;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as any)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as any;
  }
  return obj;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local states initialized from localStorage cache or initial seed
  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_USERS[0]; // Default to CO
  });

  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERSONNEL);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_PERSONNEL;
  });

  const [dutyRoster, setDutyRoster] = useState<DutyAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUTY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_DUTY_ROSTER;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [dailyParadePoints, setDailyParadePoints] = useState<DailyParadePoint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARADE_POINTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_PARADE_POINTS;
  });

  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_STATUS) === 'true';
  });

  const [activePage, setActivePage] = useState<string>(() => {
    const isAuth = localStorage.getItem(STORAGE_KEYS.AUTH_STATUS) === 'true';
    if (!isAuth) return 'login';
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE);
    return saved && saved !== 'login' ? saved : 'main_dashboard';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, isAuthenticated ? 'true' : 'false');
    if (isAuthenticated && activePage !== 'login') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, activePage);
    }
  }, [isAuthenticated, activePage]);
  const [selectedBatteryFilter, setSelectedBatteryFilter] = useState<Battery | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customLogo, setCustomLogoState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LOGO);
  });
  const [notification, setNotification] = useState<string | null>(null);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  // Modals
  const [dailyParadeModalOpen, setDailyParadeModalOpen] = useState<boolean>(false);
  const [outOfUnitModalOpen, setOutOfUnitModalOpen] = useState<boolean>(false);
  const [activeOutOfUnitCategory, setActiveOutOfUnitCategory] = useState<OutOfUnitCategory>('Msn');

  // Sync to localStorage for offline cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(personnelList));
  }, [personnelList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUTY, JSON.stringify(dutyRoster));
  }, [dutyRoster]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARADE_POINTS, JSON.stringify(dailyParadePoints));
  }, [dailyParadePoints]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Link with existing user or create/update profile
        setUsersList((prev) => {
          const existing = prev.find((u) => u.email === user.email || u.id === user.uid);
          if (existing) {
            setCurrentUserState(existing);
            return prev;
          }
          const isLeadAdmin = user.email === '10medclk@gmail.com';
          const newAcct: UserAccount = {
            id: user.uid,
            username: user.email ? user.email.split('@')[0] : `user_${user.uid.slice(0, 5)}`,
            name: user.displayName || 'Authorized User',
            rank: isLeadAdmin ? 'Col' : 'Offr',
            role: isLeadAdmin ? 'Admin' : 'Offr',
            assignedBattery: 'HQ Bty',
            assignedBatteries: ['HQ Bty', 'P Bty', 'Q Bty', 'R Bty'],
            email: user.email || undefined,
            avatar: user.photoURL || undefined,
            lastLogin: new Date().toISOString(),
          };
          setCurrentUserState(newAcct);
          // Persist user to Firestore
          setDoc(doc(db, 'users', user.uid), sanitizeForFirestore(newAcct)).catch((e) =>
            console.error('Error saving new user to Firestore:', e)
          );
          return [newAcct, ...prev];
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Listeners & Database bootstrapping
  useEffect(() => {
    setIsFirebaseReady(true);

    // 1. /users listener
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers = snapshot.docs.map((d) => d.data() as UserAccount);
          setUsersList(remoteUsers);
        } else {
          // Seed Firestore users
          INITIAL_USERS.forEach((u) => {
            setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u)).catch((e) =>
              console.warn('User seed error:', e)
            );
          });
        }
      },
      (err) => console.warn('Firestore users listener warning:', err)
    );

    // 2. /personnel listener
    const unsubPersonnel = onSnapshot(
      collection(db, 'personnel'),
      (snapshot) => {
        if (!snapshot.empty && snapshot.docs.length >= 500) {
          const remotePersonnel = snapshot.docs.map((d) => d.data() as Personnel);
          setPersonnelList(remotePersonnel);
        } else {
          // Seed Firestore personnel with full 606 official nominal roll
          INITIAL_PERSONNEL.forEach((p) => {
            setDoc(doc(db, 'personnel', p.id), sanitizeForFirestore(p)).catch((e) =>
              console.warn('Personnel seed error:', e)
            );
          });
          setPersonnelList(INITIAL_PERSONNEL);
        }
      },
      (err) => console.warn('Firestore personnel listener warning:', err)
    );

    // 3. /parade_points listener
    const unsubPoints = onSnapshot(
      collection(db, 'parade_points'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remotePoints = snapshot.docs
            .map((d) => d.data() as DailyParadePoint)
            .sort((a, b) => a.order - b.order);
          setDailyParadePoints(remotePoints);
        } else {
          // Seed Firestore parade points
          INITIAL_PARADE_POINTS.forEach((pt) => {
            setDoc(doc(db, 'parade_points', pt.id), sanitizeForFirestore(pt)).catch((e) =>
              console.warn('Parade point seed error:', e)
            );
          });
        }
      },
      (err) => console.warn('Firestore parade points listener warning:', err)
    );

    // 4. /duty_roster listener
    const unsubDuty = onSnapshot(
      collection(db, 'duty_roster'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteDuty = snapshot.docs.map((d) => d.data() as DutyAssignment);
          setDutyRoster(remoteDuty);
        } else {
          // Seed Firestore duty roster
          INITIAL_DUTY_ROSTER.forEach((d) => {
            setDoc(doc(db, 'duty_roster', d.id), sanitizeForFirestore(d)).catch((e) =>
              console.warn('Duty seed error:', e)
            );
          });
        }
      },
      (err) => console.warn('Firestore duty roster listener warning:', err)
    );

    // 5. /audit_logs listener (strictly ordered by timestamp)
    const unsubLogs = onSnapshot(
      collection(db, 'audit_logs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs = snapshot.docs
            .map((d) => d.data() as AuditLogItem)
            .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
          setAuditLogs(remoteLogs);
        } else {
          // Seed Firestore audit logs
          INITIAL_AUDIT_LOGS.forEach((l) => {
            setDoc(doc(db, 'audit_logs', l.id), sanitizeForFirestore(l)).catch((e) =>
              console.warn('Audit seed error:', e)
            );
          });
        }
      },
      (err) => console.warn('Firestore audit logs listener warning:', err)
    );

    // 6. /settings/regiment_settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'regiment_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.customLogo !== undefined) {
            setCustomLogoState(data.customLogo);
          }
        }
      },
      (err) => console.warn('Firestore settings listener warning:', err)
    );

    return () => {
      unsubUsers();
      unsubPersonnel();
      unsubPoints();
      unsubDuty();
      unsubLogs();
      unsubSettings();
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const loginWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      showNotification(`Signed in with Google: ${user.displayName || user.email}`);
      addAuditLog('Google OAuth Login', `User authenticated: ${user.email}`, 'SECURITY');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showNotification(`Google Sign-In: ${err?.message || 'Authentication failed'}`);
      }
    }
  };

  const loginWithCredentials = (
    usernameInput: string,
    passwordInput: string
  ): { success: boolean; error?: string } => {
    const cleanU = usernameInput.trim().toLowerCase();
    const cleanP = passwordInput.trim();

    if (!cleanU) {
      return { success: false, error: 'অনুগ্রহ করে ইউজারনেম প্রদান করুন।' };
    }
    if (!cleanP) {
      return { success: false, error: 'অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।' };
    }

    // Look up user by username (case-insensitive)
    const user =
      usersList.find((u) => u.username.toLowerCase() === cleanU) ||
      INITIAL_USERS.find((u) => u.username.toLowerCase() === cleanU);

    if (!user) {
      return { success: false, error: 'ভুল ইউজারনেম! এই ইউজারনেমে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' };
    }

    // Default password lookup based on role if not explicitly set
    const fallbackPassword =
      user.role === 'CO'
        ? 'co123'
        : user.role === 'RSM'
        ? 'rsm123'
        : user.role === 'Admin'
        ? 'admin123'
        : user.role === 'Offr'
        ? 'offr123'
        : 'bsm123';

    const validPassword = user.password || fallbackPassword;

    if (cleanP !== validPassword) {
      return { success: false, error: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।' };
    }

    // Login successful
    setCurrentUserState(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');

    // Route to designated dashboard based on role
    if (user.role === 'CO') {
      setActivePage('co_dashboard');
    } else if (user.role === 'RSM') {
      setActivePage('rsm_dashboard');
    } else if (user.role === 'Admin') {
      setActivePage('admin_panel');
    } else if (['P BSM', 'Q BSM', 'R BSM', 'HQ BSM'].includes(user.role)) {
      const bty =
        user.assignedBattery ||
        (user.role === 'P BSM'
          ? 'P Bty'
          : user.role === 'Q BSM'
          ? 'Q Bty'
          : user.role === 'R BSM'
          ? 'R Bty'
          : 'HQ Bty');
      setSelectedBatteryFilter(bty);
      setActivePage('battery_dashboard');
    } else {
      setActivePage('main_dashboard');
    }

    showNotification(`স্বাগতম! ${user.rank} ${user.name} (${user.role}) হিসেবে সফলভাবে লগইন হয়েছে।`);
    addAuditLog('User Login', `User ${user.name} (${user.role}) authenticated successfully`, 'SECURITY');
    return { success: true };
  };

  const logout = async () => {
    try {
      if (firebaseUser) {
        await logoutFirebase();
      }
    } catch (err: any) {
      console.warn('Firebase logout warning:', err);
    }
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATUS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PAGE);
    setActivePage('login');
    showNotification('সফলভাবে লগআউট সম্পন্ন হয়েছে।');
    addAuditLog('Logout', `User ${currentUser.name} signed out`, 'SECURITY');
  };

  const setCustomLogo = (logo: string | null) => {
    setCustomLogoState(logo);
    if (logo) {
      localStorage.setItem(STORAGE_KEYS.LOGO, logo);
      addAuditLog('Logo Updated (Admin)', 'Admin updated unit heraldic logo', 'SECURITY');
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOGO);
      addAuditLog('Logo Reset (Admin)', 'Admin restored default unit logo', 'SECURITY');
    }
    // Sync to Firestore settings
    setDoc(
      doc(db, 'settings', 'regiment_settings'),
      sanitizeForFirestore({ customLogo: logo, unitName: '10 Med Regt Arty', updatedAt: new Date().toISOString() }),
      { merge: true }
    ).catch((e) => console.error('Error saving settings to Firestore:', e));
  };

  const syncNominalRollToCloud = async () => {
    try {
      showNotification('Syncing 606 personnel to Firebase Cloud Firestore...');
      for (const p of INITIAL_PERSONNEL) {
        await setDoc(doc(db, 'personnel', p.id), sanitizeForFirestore(p));
      }
      setPersonnelList(INITIAL_PERSONNEL);
      showNotification('606 Personnel successfully synced to Cloud Firestore!');
    } catch (e: any) {
      showNotification('Sync error: ' + (e?.message || 'Failed'));
    }
  };

  const addAuditLog = (action: string, details: string, category: AuditLogItem['category']) => {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      performedBy: `${currentUser.rank} ${currentUser.name} (${currentUser.role})`,
      role: currentUser.role,
      details,
      category,
    };
    // Optimistic local update
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    // Firestore append-only write (Immutable)
    setDoc(doc(db, 'audit_logs', newLog.id), sanitizeForFirestore(newLog)).catch((e) =>
      console.error('Error appending audit log to Firestore:', e)
    );
  };

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserState(user);
    addAuditLog('User Session Changed', `Switched active profile to ${user.name} (${user.role})`, 'SECURITY');
  };

  const switchRole = (role: Role, battery?: Battery) => {
    const matchingUser = usersList.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role);
    if (matchingUser) {
      let defaultBty: Battery | undefined = battery || matchingUser.assignedBattery;
      if (!defaultBty) {
        if (role === 'P BSM') defaultBty = 'P Bty';
        else if (role === 'Q BSM') defaultBty = 'Q Bty';
        else if (role === 'R BSM') defaultBty = 'R Bty';
        else if (role === 'HQ BSM') defaultBty = 'HQ Bty';
      }
      const updatedUser: UserAccount = {
        ...matchingUser,
        assignedBattery: defaultBty,
      };
      setCurrentUserState(updatedUser);
      showNotification(
        `Active Role changed to ${role}${updatedUser.assignedBattery ? ` (${updatedUser.assignedBattery})` : ''}`
      );
      addAuditLog('Role Switch', `Switched view mode to ${role}`, 'SECURITY');
    }
  };

  const addUser = (user: Omit<UserAccount, 'id'>) => {
    const newId = 'u-' + Date.now();
    const newUser: UserAccount = {
      ...user,
      id: newId,
      assignedBattery:
        user.assignedBatteries && user.assignedBatteries.length > 0 ? user.assignedBatteries[0] : user.assignedBattery,
      lastLogin: 'Never',
    };
    setUsersList((prev) => [...prev, newUser]);
    showNotification(`User account @${newUser.username} (${newUser.rank} ${newUser.name}) created successfully.`);
    addAuditLog(
      'User Created (Admin)',
      `Created user @${newUser.username} with role ${newUser.role} & assigned btys: ${
        newUser.assignedBatteries?.join(', ') || 'All'
      }`,
      'SECURITY'
    );
    // Sync to Firestore
    setDoc(doc(db, 'users', newId), sanitizeForFirestore(newUser)).catch((e) =>
      console.error('Error adding user to Firestore:', e)
    );
  };

  const updateUser = (id: string, updated: Partial<UserAccount>) => {
    let finalUpdated: UserAccount | null = null;
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          finalUpdated = { ...u, ...updated };
          if (currentUser.id === id) {
            setCurrentUserState(finalUpdated);
          }
          return finalUpdated;
        }
        return u;
      })
    );
    showNotification(`User account updated successfully.`);
    addAuditLog('User Updated (Admin)', `Modified user settings for ID ${id}`, 'SECURITY');
    // Sync to Firestore
    if (finalUpdated) {
      setDoc(doc(db, 'users', id), sanitizeForFirestore(finalUpdated), { merge: true }).catch((e) =>
        console.error('Error updating user in Firestore:', e)
      );
    }
  };

  const deleteUser = (id: string) => {
    const target = usersList.find((u) => u.id === id);
    if (!target) return;
    if (target.id === currentUser.id) {
      showNotification('Cannot delete your currently active user account.');
      return;
    }
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    showNotification(`User @${target.username} (${target.name}) removed.`);
    addAuditLog('User Deleted (Admin)', `Deleted user account @${target.username} (${target.name})`, 'SECURITY');
    // Delete from Firestore
    deleteDoc(doc(db, 'users', id)).catch((e) => console.error('Error deleting user from Firestore:', e));
  };

  const addPersonnel = (person: Omit<Personnel, 'id'>) => {
    const newId = (personnelList.length + 1).toString();
    const newPerson: Personnel = { ...person, id: newId };
    setPersonnelList((prev) => [newPerson, ...prev]);
    showNotification(`Soldier ${newPerson.rk} ${newPerson.name} (${newPerson.snkNo}) enlisted successfully.`);
    addAuditLog(
      'Personnel Enlisted',
      `${currentUser.role} enlisted ${newPerson.rk} ${newPerson.name} (${newPerson.snkNo}) to ${newPerson.battery}`,
      'PERSONNEL'
    );
    // Write to Firestore
    setDoc(doc(db, 'personnel', newId), sanitizeForFirestore(newPerson)).catch((e) =>
      console.error('Error adding personnel to Firestore:', e)
    );
  };

  const updatePersonnel = (id: string, updated: Partial<Personnel>) => {
    let updatedRecord: Personnel | null = null;
    setPersonnelList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedRecord = { ...p, ...updated };
          return updatedRecord;
        }
        return p;
      })
    );
    showNotification(`Personnel record updated successfully.`);
    addAuditLog('Personnel Updated', `Modified record for ID: ${id}`, 'PERSONNEL');
    // Write to Firestore
    if (updatedRecord) {
      setDoc(doc(db, 'personnel', id), sanitizeForFirestore(updatedRecord), { merge: true }).catch((e) =>
        console.error('Error updating personnel in Firestore:', e)
      );
    }
  };

  const deletePersonnel = (id: string) => {
    const target = personnelList.find((p) => p.id === id);
    if (target) {
      setPersonnelList((prev) => prev.filter((p) => p.id !== id));
      showNotification(`Record for ${target.rk} ${target.name} removed from active roll.`);
      addAuditLog('Personnel Deleted', `Deleted ${target.rk} ${target.name} (${target.snkNo})`, 'PERSONNEL');
      // Delete from Firestore
      deleteDoc(doc(db, 'personnel', id)).catch((e) =>
        console.error('Error deleting personnel from Firestore:', e)
      );
    }
  };

  const updateParadeStatus = (id: string, status: ParadeStatus, statusDetails?: string) => {
    let updatedDoc: Partial<Personnel> | null = null;
    setPersonnelList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextDetails = statusDetails ?? (status === 'Present' ? undefined : p.statusDetails);
          const nextCategory = status === 'Present' ? undefined : p.outOfUnitCategory;
          updatedDoc = {
            status,
            statusDetails: nextDetails,
            outOfUnitCategory: nextCategory,
          };
          return {
            ...p,
            ...updatedDoc,
          };
        }
        return p;
      })
    );
    const target = personnelList.find((p) => p.id === id);
    if (target) {
      showNotification(`Status for ${target.name} set to ${status}`);
      addAuditLog(
        'Parade Status Change',
        `Marked ${target.rk} ${target.name} (${target.snkNo}) as ${status}`,
        'PARADE_STATE'
      );
    }
    // Write to Firestore
    if (updatedDoc) {
      setDoc(doc(db, 'personnel', id), sanitizeForFirestore(updatedDoc), { merge: true }).catch((e) =>
        console.error('Error updating parade status in Firestore:', e)
      );
    }
  };

  const batchUpdateStatus = (ids: string[], status: ParadeStatus, statusDetails?: string) => {
    setPersonnelList((prev) =>
      prev.map((p) => {
        if (ids.includes(p.id)) {
          return {
            ...p,
            status,
            statusDetails: statusDetails ?? (status === 'Present' ? undefined : p.statusDetails),
            outOfUnitCategory: status === 'Present' ? undefined : p.outOfUnitCategory,
          };
        }
        return p;
      })
    );
    showNotification(`Updated ${ids.length} soldiers to ${status}`);
    addAuditLog('Batch Status Update', `Updated ${ids.length} records to ${status}`, 'PARADE_STATE');
    // Batch sync to Firestore
    ids.forEach((id) => {
      setDoc(
        doc(db, 'personnel', id),
        sanitizeForFirestore({
          status,
          statusDetails: statusDetails ?? null,
          outOfUnitCategory: status === 'Present' ? null : undefined,
        }),
        { merge: true }
      ).catch((e) => console.error('Error batch updating personnel in Firestore:', e));
    });
  };

  // Out Of Unit Handlers
  const assignOutOfUnit = (
    personnelId: string,
    category: OutOfUnitCategory,
    details: {
      location?: string;
      startDate?: string;
      endDate?: string;
      authority?: string;
      remarks?: string;
    }
  ) => {
    let paradeStatus: ParadeStatus = 'Temp Duty';
    if (category === 'CMH') paradeStatus = 'CMH/Sick';
    else if (category === 'P/Lve' || category === 'C/Lve') paradeStatus = 'Leave';
    else if (category === 'Course') paradeStatus = 'Course/Trg';
    else if (category === 'Att') paradeStatus = 'Attached Out';
    else paradeStatus = 'Temp Duty';

    const patch: Partial<Personnel> = {
      status: paradeStatus,
      outOfUnitCategory: category,
      outOfUnitLocation: details.location,
      outOfUnitStartDate: details.startDate,
      outOfUnitEndDate: details.endDate,
      outOfUnitAuthority: details.authority,
      outOfUnitRemarks: details.remarks,
      statusDetails: `${category} - ${details.location || details.remarks || 'Out of Unit'}`,
    };

    setPersonnelList((prev) =>
      prev.map((p) => {
        if (p.id === personnelId) {
          return {
            ...p,
            ...patch,
          };
        }
        return p;
      })
    );

    const person = personnelList.find((p) => p.id === personnelId);
    showNotification(`Assigned ${person?.rk} ${person?.name} to [${category}] (${details.location || 'Out of Unit'})`);
    addAuditLog(
      'Out Of Unit Assignment',
      `Assigned ${person?.rk} ${person?.name} (${person?.battery}) to ${category}: ${details.location || ''}`,
      'PARADE_STATE'
    );
    // Sync to Firestore
    setDoc(doc(db, 'personnel', personnelId), sanitizeForFirestore(patch), { merge: true }).catch((e) =>
      console.error('Error assigning out of unit in Firestore:', e)
    );
  };

  const cancelOutOfUnit = (personnelId: string) => {
    const patch: Record<string, any> = {
      status: 'Present',
      outOfUnitCategory: null,
      outOfUnitLocation: null,
      outOfUnitStartDate: null,
      outOfUnitEndDate: null,
      outOfUnitAuthority: null,
      outOfUnitRemarks: null,
      statusDetails: null,
    };

    setPersonnelList((prev) =>
      prev.map((p) => {
        if (p.id === personnelId) {
          return {
            ...p,
            status: 'Present',
            outOfUnitCategory: undefined,
            outOfUnitLocation: undefined,
            outOfUnitStartDate: undefined,
            outOfUnitEndDate: undefined,
            outOfUnitAuthority: undefined,
            outOfUnitRemarks: undefined,
            statusDetails: undefined,
          };
        }
        return p;
      })
    );

    const person = personnelList.find((p) => p.id === personnelId);
    showNotification(`Cancelled Out-of-Unit status for ${person?.rk} ${person?.name} - Returned to Unit Present.`);
    addAuditLog(
      'Out Of Unit Cancelled',
      `Returned ${person?.rk} ${person?.name} (${person?.battery}) to Present status in Unit`,
      'PARADE_STATE'
    );
    // Sync to Firestore
    setDoc(doc(db, 'personnel', personnelId), patch, { merge: true }).catch((e) =>
      console.error('Error cancelling out of unit in Firestore:', e)
    );
  };

  // Daily Parade State Management Handlers
  const updateParadePointCount = (pointId: string, battery: Battery, counts: ParadePointCount) => {
    let updatedPt: DailyParadePoint | null = null;
    setDailyParadePoints((prev) =>
      prev.map((pt) => {
        if (pt.id === pointId) {
          updatedPt = {
            ...pt,
            counts: {
              ...pt.counts,
              [battery]: counts,
            },
          };
          return updatedPt;
        }
        return pt;
      })
    );
    // Sync to Firestore
    if (updatedPt) {
      setDoc(doc(db, 'parade_points', pointId), sanitizeForFirestore(updatedPt), { merge: true }).catch((e) =>
        console.error('Error updating parade point in Firestore:', e)
      );
    }
  };

  const togglePointForBattery = (pointId: string, battery: Battery, enabled: boolean) => {
    let updatedPt: DailyParadePoint | null = null;
    setDailyParadePoints((prev) =>
      prev.map((pt) => {
        if (pt.id === pointId) {
          const current = pt.enabledBatteries || ['HQ Bty', 'P Bty', 'Q Bty', 'R Bty'];
          const updated = enabled
            ? Array.from(new Set([...current, battery]))
            : current.filter((b) => b !== battery);
          updatedPt = {
            ...pt,
            enabledBatteries: updated,
          };
          return updatedPt;
        }
        return pt;
      })
    );
    showNotification(`Updated parade point visibility for ${battery}`);
    // Sync to Firestore
    if (updatedPt) {
      setDoc(doc(db, 'parade_points', pointId), sanitizeForFirestore(updatedPt), { merge: true }).catch((e) =>
        console.error('Error toggling parade point in Firestore:', e)
      );
    }
  };

  const setRsmPointSuggestion = (pointId: string, suggestion: Partial<ParadePointCount>) => {
    let updatedPt: DailyParadePoint | null = null;
    setDailyParadePoints((prev) =>
      prev.map((pt) => {
        if (pt.id === pointId) {
          updatedPt = {
            ...pt,
            rsmSuggested: { ...pt.rsmSuggested, ...suggestion },
          };
          return updatedPt;
        }
        return pt;
      })
    );
    showNotification(`RSM point suggestion updated.`);
    // Sync to Firestore
    if (updatedPt) {
      setDoc(doc(db, 'parade_points', pointId), sanitizeForFirestore(updatedPt), { merge: true }).catch((e) =>
        console.error('Error updating RSM suggestion in Firestore:', e)
      );
    }
  };

  const addDailyParadePoint = (name: string, enabledBatteries?: Battery[], initialCounts?: ParadePointCount) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newId = 'pt-' + Date.now();
    const defaultCount = initialCounts || { offr: 0, jco: 0, or: 0 };
    const newPoint: DailyParadePoint = {
      id: newId,
      name: trimmed,
      order: dailyParadePoints.length + 1,
      isActive: true,
      enabledBatteries: enabledBatteries || ['HQ Bty', 'P Bty', 'Q Bty', 'R Bty'],
      counts: {
        'HQ Bty': { ...defaultCount },
        'P Bty': { ...defaultCount },
        'Q Bty': { ...defaultCount },
        'R Bty': { ...defaultCount },
      },
    };
    setDailyParadePoints((prev) => [...prev, newPoint]);
    showNotification(`Added new Daily Parade point: "${trimmed}"`);
    addAuditLog('Parade Point Added', `Added parade duty point "${trimmed}"`, 'PARADE_STATE');
    // Sync to Firestore
    setDoc(doc(db, 'parade_points', newId), sanitizeForFirestore(newPoint)).catch((e) =>
      console.error('Error adding parade point to Firestore:', e)
    );
  };

  const deleteDailyParadePoint = (pointId: string) => {
    const target = dailyParadePoints.find((p) => p.id === pointId);
    setDailyParadePoints((prev) => prev.filter((p) => p.id !== pointId));
    showNotification(`Parade point "${target?.name}" removed.`);
    addAuditLog('Parade Point Removed', `Removed point "${target?.name}"`, 'PARADE_STATE');
    // Delete from Firestore
    deleteDoc(doc(db, 'parade_points', pointId)).catch((e) =>
      console.error('Error deleting parade point from Firestore:', e)
    );
  };

  const toggleDailyParadePointActive = (pointId: string, active: boolean) => {
    setDailyParadePoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, isActive: active } : p))
    );
    // Sync to Firestore
    setDoc(doc(db, 'parade_points', pointId), { isActive: active }, { merge: true }).catch((e) =>
      console.error('Error updating parade point active status in Firestore:', e)
    );
  };

  const addDutyAssignment = (assignment: Omit<DutyAssignment, 'id'>) => {
    const newAssignment: DutyAssignment = {
      ...assignment,
      id: 'duty-' + Date.now(),
    };
    setDutyRoster((prev) => [newAssignment, ...prev]);
    showNotification(`New duty roster created for ${assignment.dutyType}`);
    addAuditLog('Duty Assigned', `Scheduled ${assignment.dutyType} on ${assignment.date}`, 'PARADE_STATE');
    // Sync to Firestore
    setDoc(doc(db, 'duty_roster', newAssignment.id), sanitizeForFirestore(newAssignment)).catch((e) =>
      console.error('Error saving duty assignment to Firestore:', e)
    );
  };

  const getBatterySummaries = (): BatteryParadeSummary[] => {
    const batteries: Battery[] = ['HQ Bty', 'P Bty', 'Q Bty', 'R Bty'];
    return batteries.map((bty) => {
      const btyMembers = personnelList.filter((p) => p.battery === bty);
      const posted = btyMembers.length;
      const present = btyMembers.filter((p) => p.status === 'Present').length;
      const onDuty = btyMembers.filter((p) => p.status === 'On Duty').length;
      const sick = btyMembers.filter((p) => p.status === 'CMH/Sick').length;
      const leave = btyMembers.filter((p) => p.status === 'Leave').length;
      const course = btyMembers.filter((p) => p.status === 'Course/Trg').length;
      const tempDuty = btyMembers.filter((p) => p.status === 'Temp Duty').length;
      const attached = btyMembers.filter((p) => p.status === 'Attached Out').length;
      const absent = btyMembers.filter((p) => p.status === 'AWOL/OSL').length;

      return {
        battery: bty,
        posted,
        present,
        onDuty,
        sick,
        leave,
        course,
        tempDuty,
        attached,
        absent,
        submissionStatus: 'Approved',
        lastUpdated: '0630 HRS',
        submittedBy:
          bty === 'P Bty'
            ? 'SWO Jafor (BSM)'
            : bty === 'Q Bty'
            ? 'WO Hamid (BSM)'
            : bty === 'R Bty'
            ? 'WO Aminul (BSM)'
            : 'SWO Nasir (RSM)',
      };
    });
  };

  const getRegimentalTotals = () => {
    const totalPosted = personnelList.length;
    const totalPresent = personnelList.filter((p) => p.status === 'Present').length;
    const totalDuty = personnelList.filter((p) => p.status === 'On Duty').length;
    const totalSick = personnelList.filter((p) => p.status === 'CMH/Sick').length;
    const totalLeave = personnelList.filter((p) => p.status === 'Leave').length;
    const totalCourse = personnelList.filter((p) => p.status === 'Course/Trg').length;
    const totalTempDuty = personnelList.filter((p) => p.status === 'Temp Duty').length;
    const totalAttached = personnelList.filter((p) => p.status === 'Attached Out').length;
    const totalAbsent = personnelList.filter((p) => p.status === 'AWOL/OSL').length;
    const effectivePresent = totalPresent + totalDuty;
    const presentPercentage = totalPosted > 0 ? Math.round((effectivePresent / totalPosted) * 100) : 0;

    return {
      totalPosted,
      totalPresent,
      totalDuty,
      totalSick,
      totalLeave,
      totalCourse,
      totalTempDuty,
      totalAttached,
      totalAbsent,
      presentPercentage,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        usersList,
        addUser,
        updateUser,
        deleteUser,
        personnelList,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        updateParadeStatus,
        updatePersonnelStatus: updateParadeStatus,
        batchUpdateStatus,
        dutyRoster,
        addDutyAssignment,
        auditLogs,
        addAuditLog,
        getBatterySummaries,
        getRegimentalTotals,
        activePage,
        setActivePage,
        selectedBatteryFilter,
        setSelectedBatteryFilter,
        searchQuery,
        setSearchQuery,
        customLogo,
        setCustomLogo,
        notification,
        showNotification,

        dailyParadePoints,
        updateParadePointCount,
        togglePointForBattery,
        setRsmPointSuggestion,
        addDailyParadePoint,
        deleteDailyParadePoint,
        toggleDailyParadePointActive,

        assignOutOfUnit,
        cancelOutOfUnit,
        syncNominalRollToCloud,

        dailyParadeModalOpen,
        setDailyParadeModalOpen,
        outOfUnitModalOpen,
        setOutOfUnitModalOpen,
        activeOutOfUnitCategory,
        setActiveOutOfUnitCategory,

        isAuthenticated,
        loginWithCredentials,

        firebaseUser,
        isFirebaseReady,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
