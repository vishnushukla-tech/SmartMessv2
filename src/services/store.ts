import {
  Mess,
  StudentProfile,
  MessAdminProfile,
  AttendanceRecord,
  AttendanceAuditLog,
  DailyMenu,
  JoinRequest,
  MealType,
} from '../types';
import {
  SEED_MESSES,
  SEED_ADMINS,
  SEED_STUDENTS,
  generateSeedAttendance,
  generateSeedMenus,
  getTodayDateString,
  getTomorrowDateString,
  getYesterdayDateString,
} from '../data/seedData';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export const STORAGE_KEY = 'smartmess_local_db_v1';

export interface AppStateData {
  messes: Mess[];
  admins: MessAdminProfile[];
  students: StudentProfile[];
  attendance: AttendanceRecord[];
  auditLogs: AttendanceAuditLog[];
  menus: DailyMenu[];
  joinRequests: JoinRequest[];
}

function initializeInitialState(): AppStateData {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const yesterday = getYesterdayDateString();

  return {
    messes: [...SEED_MESSES],
    admins: [...SEED_ADMINS],
    students: [...SEED_STUDENTS],
    attendance: generateSeedAttendance(today, tomorrow, yesterday),
    auditLogs: [
      {
        id: 'log-1',
        messId: 'mess-aryabhatta',
        date: today,
        studentUid: 'std-2',
        studentName: 'Priya Patel',
        action: 'Meal Updated',
        details: 'Lunch changed from IN to OUT',
        timestamp: `${today}T06:40:00Z`,
        updatedBy: 'Priya Patel (Student)',
      },
      {
        id: 'log-2',
        messId: 'mess-aryabhatta',
        date: today,
        studentUid: 'std-3',
        studentName: 'Amit Verma',
        action: 'Meal Updated',
        details: 'Snacks & Dinner marked OUT (field trip)',
        timestamp: `${today}T06:55:00Z`,
        updatedBy: 'Amit Verma (Student)',
      },
    ],
    menus: generateSeedMenus(today, tomorrow),
    joinRequests: [
      {
        id: 'req-1',
        messId: 'mess-kaveri',
        studentUid: 'std-demo-new',
        studentName: 'Manish Pandey',
        studentRollNo: 'CS22B199',
        studentEmail: 'manish.p@smartmess.edu',
        status: 'pending',
        requestedAt: `${today}T05:30:00Z`,
      },
    ],
  };
}

export function loadStoredData(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure essential arrays exist
      if (parsed.messes && parsed.students && parsed.menus) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached data, resetting to seed defaults:', e);
  }

  const initial = initializeInitialState();
  saveStoredData(initial);
  return initial;
}

export function saveStoredData(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// Background sync to Firestore to populate cloud collections
export async function syncToFirestore(data: AppStateData): Promise<void> {
  try {
    // Sync Messes
    for (const mess of data.messes) {
      await setDoc(doc(db, 'messes', mess.id), mess, { merge: true });
    }
    // Sync Menus
    for (const menu of data.menus) {
      await setDoc(doc(db, 'menus', menu.id), menu, { merge: true });
    }
    // Sync Attendance
    for (const att of data.attendance) {
      await setDoc(doc(db, 'attendance', att.id), att, { merge: true });
    }
  } catch (error) {
    // Non-blocking in case of offline / permission bootstrap
    console.warn('Firestore background sync notice:', error);
  }
}

// Fetch live attendance from Firestore with fallback to local store
export async function fetchLiveAttendance(
  messId: string,
  date: string,
  localFallback: AttendanceRecord[]
): Promise<AttendanceRecord[]> {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('messId', '==', messId),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const liveRecords: AttendanceRecord[] = [];
      snap.forEach((d) => liveRecords.push(d.data() as AttendanceRecord));
      return liveRecords;
    }
  } catch (err) {
    // Handled gracefully with fallback
  }
  return localFallback.filter((a) => a.messId === messId && a.date === date);
}

// Save attendance record to Firestore & Local Store
export async function saveAttendanceRecord(
  record: AttendanceRecord,
  auditLog: AttendanceAuditLog,
  currentState: AppStateData
): Promise<AppStateData> {
  // Update local
  const existingIdx = currentState.attendance.findIndex((a) => a.id === record.id);
  const updatedAttendance = [...currentState.attendance];
  if (existingIdx >= 0) {
    updatedAttendance[existingIdx] = record;
  } else {
    updatedAttendance.push(record);
  }

  const updatedLogs = [auditLog, ...currentState.auditLogs];

  const newState: AppStateData = {
    ...currentState,
    attendance: updatedAttendance,
    auditLogs: updatedLogs,
  };

  saveStoredData(newState);

  // Firestore write
  try {
    await setDoc(doc(db, 'attendance', record.id), record, { merge: true });
    await setDoc(doc(db, 'attendanceLog', auditLog.id), auditLog);
  } catch (error) {
    console.warn('Saved to local store; Firestore sync queued:', error);
  }

  return newState;
}

// Check if a meal is locked based on mess cutoff time
export function isMealCutoffPassed(
  meal: MealType,
  targetDate: string,
  mealSchedule: Mess['mealTimings']
): { isLocked: boolean; reason: string } {
  const today = getTodayDateString();

  // If date is in the past, it's always locked
  if (targetDate < today) {
    return { isLocked: true, reason: 'Past date - attendance closed' };
  }

  // If date is in the future (tomorrow or beyond), it's open
  if (targetDate > today) {
    return { isLocked: false, reason: 'Upcoming date - open for submission' };
  }

  // It's today! Compare current time against cutoff
  const timing = mealSchedule[meal];
  if (!timing || !timing.cutoff) {
    return { isLocked: false, reason: '' };
  }

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const [cutoffHours, cutoffMinutes] = timing.cutoff.split(':').map(Number);

  const currentTotal = currentHours * 60 + currentMinutes;
  const cutoffTotal = cutoffHours * 60 + cutoffMinutes;

  if (currentTotal >= cutoffTotal) {
    return {
      isLocked: true,
      reason: `Cut-off passed at ${timing.cutoff} (${timing.label})`,
    };
  }

  return {
    isLocked: false,
    reason: `Open until ${timing.cutoff}`,
  };
}
