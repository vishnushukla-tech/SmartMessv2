import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  StudentProfile,
  MessAdminProfile,
  Mess,
  AttendanceRecord,
  DailyMenu,
  AttendanceAuditLog,
  JoinRequest,
  MealType,
  MessMealSchedule,
} from '../types';
import {
  AppStateData,
  loadStoredData,
  saveStoredData,
  syncToFirestore,
  saveAttendanceRecord,
  isMealCutoffPassed,
  STORAGE_KEY,
} from '../services/store';
import {
  getTodayDateString,
  getTomorrowDateString,
} from '../data/seedData';

interface AppContextType {
  userRole: UserRole | null;
  currentStudent: StudentProfile | null;
  currentAdmin: MessAdminProfile | null;
  activeMess: Mess | null;
  data: AppStateData;
  isOnline: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  // Auth & Roles
  selectRole: (role: UserRole) => void;
  loginStudent: (email: string, rollNo?: string) => { success: boolean; error?: string };
  signupStudent: (name: string, rollNo: string, email: string) => { success: boolean; error?: string };
  loginAdmin: (email: string) => { success: boolean; error?: string };
  registerMess: (
    messData: Omit<Mess, 'id' | 'activeStudentCount' | 'createdAt' | 'updatedAt'>,
    adminData: { name: string; email: string }
  ) => { success: boolean; messId: string };
  logout: () => void;
  quickDemoLogin: (role: UserRole, id?: string) => void;
  // Student Actions
  requestJoinMess: (messId: string, enteredCode?: string) => { success: boolean; message: string };
  leaveOrChangeMess: () => void;
  submitStudentAttendance: (
    date: string,
    meals: { breakfast: boolean; lunch: boolean; snacks: boolean; dinner: boolean }
  ) => Promise<{ success: boolean; message: string }>;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  // Admin Actions
  updateMenu: (
    date: string,
    menu: {
      breakfast: string[];
      lunch: string[];
      snacks: string[];
      dinner: string[];
      specialNotice?: string;
    }
  ) => void;
  updateMessTimings: (timings: MessMealSchedule) => void;
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  removeStudentFromMess: (studentUid: string) => void;
  archiveAttendanceForDate: (date: string) => void;
  // Helpers
  getStudentAttendanceForDate: (studentUid: string, date: string) => AttendanceRecord | undefined;
  getMenuForDate: (date: string) => DailyMenu | undefined;
  checkCutoff: (meal: MealType, date: string) => { isLocked: boolean; reason: string };
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppStateData>(loadStoredData);
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('smartmess_saved_role') as UserRole) || null;
  });
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    return localStorage.getItem('smartmess_saved_student_id') || null;
  });
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(() => {
    return localStorage.getItem('smartmess_saved_admin_id') || null;
  });
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to firestore on mount or data changes
  useEffect(() => {
    syncToFirestore(data);
  }, []);

  // Persist role & user selections
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('smartmess_saved_role', userRole);
    } else {
      localStorage.removeItem('smartmess_saved_role');
    }
  }, [userRole]);

  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem('smartmess_saved_student_id', currentStudentId);
    } else {
      localStorage.removeItem('smartmess_saved_student_id');
    }
  }, [currentStudentId]);

  useEffect(() => {
    if (currentAdminId) {
      localStorage.setItem('smartmess_saved_admin_id', currentAdminId);
    } else {
      localStorage.removeItem('smartmess_saved_admin_id');
    }
  }, [currentAdminId]);

  const currentStudent = data.students.find((s) => s.uid === currentStudentId) || null;
  const currentAdmin = data.admins.find((a) => a.uid === currentAdminId) || null;

  // Active mess based on active user
  const activeMess = React.useMemo(() => {
    if (userRole === 'student' && currentStudent?.messId) {
      return data.messes.find((m) => m.id === currentStudent.messId) || null;
    }
    if (userRole === 'admin' && currentAdmin?.messId) {
      return data.messes.find((m) => m.id === currentAdmin.messId) || null;
    }
    return data.messes[0] || null;
  }, [userRole, currentStudent, currentAdmin, data.messes]);

  const selectRole = (role: UserRole) => {
    setUserRole(role);
  };

  const loginStudent = (email: string, rollNo?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRoll = rollNo?.trim().toUpperCase();

    const existing = data.students.find(
      (s) =>
        s.email.toLowerCase() === trimmedEmail ||
        (trimmedRoll && s.rollNo.toUpperCase() === trimmedRoll)
    );

    if (existing) {
      setCurrentStudentId(existing.uid);
      setUserRole('student');
      return { success: true };
    }

    return {
      success: false,
      error: 'No student found with this email or roll number. Please sign up first.',
    };
  };

  const signupStudent = (name: string, rollNo: string, email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRoll = rollNo.trim().toUpperCase();

    // Check conflict
    const exists = data.students.some(
      (s) => s.email.toLowerCase() === trimmedEmail || s.rollNo.toUpperCase() === trimmedRoll
    );
    if (exists) {
      return { success: false, error: 'A student with this email or roll number already exists.' };
    }

    const newStudent: StudentProfile = {
      uid: 'std-' + Date.now(),
      name: name.trim(),
      rollNo: trimmedRoll,
      email: trimmedEmail,
      messId: null,
      joinStatus: 'none',
      dietaryPref: 'Veg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextData: AppStateData = {
      ...data,
      students: [newStudent, ...data.students],
    };

    setData(nextData);
    saveStoredData(nextData);
    setCurrentStudentId(newStudent.uid);
    setUserRole('student');
    return { success: true };
  };

  const loginAdmin = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const existing = data.admins.find((a) => a.email.toLowerCase() === trimmed);
    if (existing) {
      setCurrentAdminId(existing.uid);
      setUserRole('admin');
      return { success: true };
    }

    return {
      success: false,
      error: 'Admin account not found. Please register your mess or check your email.',
    };
  };

  const registerMess = (
    messData: Omit<Mess, 'id' | 'activeStudentCount' | 'createdAt' | 'updatedAt'>,
    adminData: { name: string; email: string }
  ) => {
    const messId = 'mess-' + Date.now();
    const adminId = 'admin-' + Date.now();
    const now = new Date().toISOString();

    const newMess: Mess = {
      ...messData,
      id: messId,
      activeStudentCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    const newAdmin: MessAdminProfile = {
      uid: adminId,
      messId: messId,
      name: adminData.name,
      email: adminData.email.toLowerCase(),
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    };

    // Also seed a default today menu for this new mess
    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();
    const initialMenus: DailyMenu[] = [
      {
        id: `${messId}_${today}`,
        messId,
        date: today,
        breakfast: ['Poha / Upma', 'Boiled Eggs', 'Tea/Coffee'],
        lunch: ['Dal Makhani', 'Seasonal Veg', 'Rice', 'Roti', 'Salad'],
        snacks: ['Veg Cutlet', 'Chai'],
        dinner: ['Paneer Dish', 'Mixed Veg', 'Pulao', 'Roti', 'Sweet'],
        specialNotice: 'Welcome to our digital mess headcount system!',
        published: true,
        updatedAt: now,
      },
      {
        id: `${messId}_${tomorrow}`,
        messId,
        date: tomorrow,
        breakfast: ['Idli Sambar', 'Chutney', 'Tea'],
        lunch: ['Rajma Chawal', 'Roti', 'Salad'],
        snacks: ['Biscuits & Tea'],
        dinner: ['Egg Curry / Kadai Paneer', 'Jeera Rice', 'Roti'],
        specialNotice: '',
        published: true,
        updatedAt: now,
      },
    ];

    const nextData: AppStateData = {
      ...data,
      messes: [newMess, ...data.messes],
      admins: [newAdmin, ...data.admins],
      menus: [...initialMenus, ...data.menus],
    };

    setData(nextData);
    saveStoredData(nextData);
    setCurrentAdminId(adminId);
    setUserRole('admin');

    return { success: true, messId };
  };

  const logout = () => {
    setUserRole(null);
    setCurrentStudentId(null);
    setCurrentAdminId(null);
    localStorage.removeItem('smartmess_saved_role');
    localStorage.removeItem('smartmess_saved_student_id');
    localStorage.removeItem('smartmess_saved_admin_id');
  };

  const quickDemoLogin = (role: UserRole, id?: string) => {
    if (role === 'student') {
      const student = id
        ? data.students.find((s) => s.uid === id) || data.students[0]
        : data.students[0];
      if (student) {
        setCurrentStudentId(student.uid);
        setUserRole('student');
      }
    } else {
      const admin = id
        ? data.admins.find((a) => a.uid === id) || data.admins[0]
        : data.admins[0];
      if (admin) {
        setCurrentAdminId(admin.uid);
        setUserRole('admin');
      }
    }
  };

  const requestJoinMess = (messId: string, enteredCode?: string) => {
    if (!currentStudent) return { success: false, message: 'Please log in as a student.' };

    const targetMess = data.messes.find((m) => m.id === messId);
    if (!targetMess) return { success: false, message: 'Mess not found.' };

    if (targetMess.joinMode === 'open') {
      // Instant Join!
      const updatedStudents = data.students.map((s) =>
        s.uid === currentStudent.uid
          ? { ...s, messId, joinStatus: 'joined' as const, updatedAt: new Date().toISOString() }
          : s
      );
      // Increment active count
      const updatedMesses = data.messes.map((m) =>
        m.id === messId ? { ...m, activeStudentCount: m.activeStudentCount + 1 } : m
      );

      const nextData: AppStateData = {
        ...data,
        students: updatedStudents,
        messes: updatedMesses,
      };
      setData(nextData);
      saveStoredData(nextData);
      return { success: true, message: `Successfully enrolled in ${targetMess.name}!` };
    }

    if (targetMess.joinMode === 'code') {
      if (!enteredCode) {
        return { success: false, message: 'Please enter the Mess Code provided by your hostel.' };
      }
      if (enteredCode.trim().toUpperCase() !== targetMess.messCode.toUpperCase()) {
        return { success: false, message: 'Invalid Mess Code. Please ask your mess warden/admin.' };
      }

      // Valid code -> instant join
      const updatedStudents = data.students.map((s) =>
        s.uid === currentStudent.uid
          ? { ...s, messId, joinStatus: 'joined' as const, updatedAt: new Date().toISOString() }
          : s
      );
      const updatedMesses = data.messes.map((m) =>
        m.id === messId ? { ...m, activeStudentCount: m.activeStudentCount + 1 } : m
      );

      const nextData: AppStateData = {
        ...data,
        students: updatedStudents,
        messes: updatedMesses,
      };
      setData(nextData);
      saveStoredData(nextData);
      return { success: true, message: `Code verified! Enrolled in ${targetMess.name}!` };
    }

    // Admin approval required
    const newReq: JoinRequest = {
      id: `req-${Date.now()}`,
      messId,
      studentUid: currentStudent.uid,
      studentName: currentStudent.name,
      studentRollNo: currentStudent.rollNo,
      studentEmail: currentStudent.email,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const updatedStudents = data.students.map((s) =>
      s.uid === currentStudent.uid
        ? { ...s, messId, joinStatus: 'pending' as const, updatedAt: new Date().toISOString() }
        : s
    );

    const nextData: AppStateData = {
      ...data,
      students: updatedStudents,
      joinRequests: [newReq, ...data.joinRequests],
    };
    setData(nextData);
    saveStoredData(nextData);
    return {
      success: true,
      message: `Join request sent to ${targetMess.name}. The mess admin will review and approve.`,
    };
  };

  const leaveOrChangeMess = () => {
    if (!currentStudent) return;
    const oldMessId = currentStudent.messId;
    const updatedStudents = data.students.map((s) =>
      s.uid === currentStudent.uid
        ? { ...s, messId: null, joinStatus: 'none' as const, updatedAt: new Date().toISOString() }
        : s
    );
    const updatedMesses = data.messes.map((m) =>
      m.id === oldMessId ? { ...m, activeStudentCount: Math.max(0, m.activeStudentCount - 1) } : m
    );

    const nextData: AppStateData = {
      ...data,
      students: updatedStudents,
      messes: updatedMesses,
    };
    setData(nextData);
    saveStoredData(nextData);
  };

  const submitStudentAttendance = async (
    date: string,
    meals: { breakfast: boolean; lunch: boolean; snacks: boolean; dinner: boolean }
  ) => {
    if (!currentStudent || !currentStudent.messId) {
      return { success: false, message: 'You must belong to a registered mess to check-in.' };
    }

    const messId = currentStudent.messId;
    const recId = `${messId}_${date}_${currentStudent.uid}`;
    const now = new Date().toISOString();

    // Check existing for audit comparison
    const existing = data.attendance.find((a) => a.id === recId);
    let auditDiff = 'Check-in submitted: ';
    if (existing) {
      const changes: string[] = [];
      if (existing.breakfast !== meals.breakfast) changes.push(`Breakfast: ${meals.breakfast ? 'IN' : 'OUT'}`);
      if (existing.lunch !== meals.lunch) changes.push(`Lunch: ${meals.lunch ? 'IN' : 'OUT'}`);
      if (existing.snacks !== meals.snacks) changes.push(`Snacks: ${meals.snacks ? 'IN' : 'OUT'}`);
      if (existing.dinner !== meals.dinner) changes.push(`Dinner: ${meals.dinner ? 'IN' : 'OUT'}`);
      auditDiff = changes.length > 0 ? `Updated (${changes.join(', ')})` : 'Confirmed current choices';
    } else {
      auditDiff = `Initial: B:${meals.breakfast ? 'IN' : 'OUT'} L:${meals.lunch ? 'IN' : 'OUT'} S:${meals.snacks ? 'IN' : 'OUT'} D:${meals.dinner ? 'IN' : 'OUT'}`;
    }

    const newRecord: AttendanceRecord = {
      id: recId,
      messId,
      date,
      studentUid: currentStudent.uid,
      studentName: currentStudent.name,
      studentRollNo: currentStudent.rollNo,
      breakfast: meals.breakfast,
      lunch: meals.lunch,
      snacks: meals.snacks,
      dinner: meals.dinner,
      lastSubmittedAt: now,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const auditLog: AttendanceAuditLog = {
      id: `log-${Date.now()}`,
      messId,
      date,
      studentUid: currentStudent.uid,
      studentName: currentStudent.name,
      action: existing ? 'Headcount Updated' : 'Headcount Registered',
      details: auditDiff,
      timestamp: now,
      updatedBy: `${currentStudent.name} (${currentStudent.rollNo})`,
    };

    const nextState = await saveAttendanceRecord(newRecord, auditLog, data);
    setData(nextState);

    return { success: true, message: 'Attendance saved successfully!' };
  };

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    if (!currentStudent) return;
    const updated = data.students.map((s) =>
      s.uid === currentStudent.uid
        ? { ...s, ...updates, updatedAt: new Date().toISOString() }
        : s
    );
    const nextData = { ...data, students: updated };
    setData(nextData);
    saveStoredData(nextData);
  };

  const updateMenu = (
    date: string,
    menu: {
      breakfast: string[];
      lunch: string[];
      snacks: string[];
      dinner: string[];
      specialNotice?: string;
    }
  ) => {
    if (!activeMess) return;
    const menuId = `${activeMess.id}_${date}`;
    const now = new Date().toISOString();

    const existingIdx = data.menus.findIndex((m) => m.id === menuId);
    const newMenu: DailyMenu = {
      id: menuId,
      messId: activeMess.id,
      date,
      breakfast: menu.breakfast,
      lunch: menu.lunch,
      snacks: menu.snacks,
      dinner: menu.dinner,
      specialNotice: menu.specialNotice || '',
      published: true,
      updatedAt: now,
    };

    const updatedMenus = [...data.menus];
    if (existingIdx >= 0) {
      updatedMenus[existingIdx] = newMenu;
    } else {
      updatedMenus.push(newMenu);
    }

    const nextData = { ...data, menus: updatedMenus };
    setData(nextData);
    saveStoredData(nextData);
  };

  const updateMessTimings = (timings: MessMealSchedule) => {
    if (!activeMess) return;
    const updatedMesses = data.messes.map((m) =>
      m.id === activeMess.id ? { ...m, mealTimings: timings, updatedAt: new Date().toISOString() } : m
    );
    const nextData = { ...data, messes: updatedMesses };
    setData(nextData);
    saveStoredData(nextData);
  };

  const approveJoinRequest = (requestId: string) => {
    const req = data.joinRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Set student status to joined
    const updatedStudents = data.students.map((s) =>
      s.uid === req.studentUid
        ? { ...s, messId: req.messId, joinStatus: 'joined' as const, updatedAt: new Date().toISOString() }
        : s
    );
    // Remove or mark request approved
    const updatedReqs = data.joinRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'approved' as const, resolvedAt: new Date().toISOString() } : r
    );
    // Increment count
    const updatedMesses = data.messes.map((m) =>
      m.id === req.messId ? { ...m, activeStudentCount: m.activeStudentCount + 1 } : m
    );

    const nextData = {
      ...data,
      students: updatedStudents,
      joinRequests: updatedReqs,
      messes: updatedMesses,
    };
    setData(nextData);
    saveStoredData(nextData);
  };

  const rejectJoinRequest = (requestId: string) => {
    const req = data.joinRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedStudents = data.students.map((s) =>
      s.uid === req.studentUid
        ? { ...s, messId: null, joinStatus: 'none' as const, updatedAt: new Date().toISOString() }
        : s
    );
    const updatedReqs = data.joinRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'rejected' as const, resolvedAt: new Date().toISOString() } : r
    );

    const nextData = {
      ...data,
      students: updatedStudents,
      joinRequests: updatedReqs,
    };
    setData(nextData);
    saveStoredData(nextData);
  };

  const removeStudentFromMess = (studentUid: string) => {
    if (!activeMess) return;
    const updatedStudents = data.students.map((s) =>
      s.uid === studentUid
        ? { ...s, messId: null, joinStatus: 'none' as const, updatedAt: new Date().toISOString() }
        : s
    );
    const updatedMesses = data.messes.map((m) =>
      m.id === activeMess.id ? { ...m, activeStudentCount: Math.max(0, m.activeStudentCount - 1) } : m
    );

    const nextData = {
      ...data,
      students: updatedStudents,
      messes: updatedMesses,
    };
    setData(nextData);
    saveStoredData(nextData);
  };

  const archiveAttendanceForDate = (date: string) => {
    if (!activeMess) return;
    // Archive attendance by marking them archived / resetting for this mess & date
    const remaining = data.attendance.filter(
      (a) => !(a.messId === activeMess.id && a.date === date)
    );
    const archiveLog: AttendanceAuditLog = {
      id: `log-archive-${Date.now()}`,
      messId: activeMess.id,
      date,
      studentUid: 'ADMIN',
      studentName: 'Kitchen Admin',
      action: 'Data Archived',
      details: `Headcount data for ${date} archived by Admin.`,
      timestamp: new Date().toISOString(),
      updatedBy: currentAdmin?.name || 'Admin',
    };

    const nextData = {
      ...data,
      attendance: remaining,
      auditLogs: [archiveLog, ...data.auditLogs],
    };
    setData(nextData);
    saveStoredData(nextData);
  };

  const getStudentAttendanceForDate = (studentUid: string, date: string) => {
    return data.attendance.find((a) => a.studentUid === studentUid && a.date === date);
  };

  const getMenuForDate = (date: string) => {
    if (!activeMess) return undefined;
    return data.menus.find((m) => m.messId === activeMess.id && m.date === date);
  };

  const checkCutoff = (meal: MealType, date: string) => {
    if (!activeMess) return { isLocked: false, reason: '' };
    return isMealCutoffPassed(meal, date, activeMess.mealTimings);
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const reset = loadStoredData();
    setData(reset);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        currentStudent,
        currentAdmin,
        activeMess,
        data,
        isOnline,
        selectedDate,
        setSelectedDate,
        selectRole,
        loginStudent,
        signupStudent,
        loginAdmin,
        registerMess,
        logout,
        quickDemoLogin,
        requestJoinMess,
        leaveOrChangeMess,
        submitStudentAttendance,
        updateStudentProfile,
        updateMenu,
        updateMessTimings,
        approveJoinRequest,
        rejectJoinRequest,
        removeStudentFromMess,
        archiveAttendanceForDate,
        getStudentAttendanceForDate,
        getMenuForDate,
        checkCutoff,
        resetAllDemoData,
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
