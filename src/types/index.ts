export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export type UserRole = 'student' | 'admin';

export type JoinMode = 'open' | 'code' | 'approval';

export type JoinStatus = 'none' | 'pending' | 'joined' | 'blocked';

export interface MealTimingInfo {
  label: string;
  start: string;  // e.g. "07:30"
  end: string;    // e.g. "09:30"
  cutoff: string; // e.g. "07:00"
}

export interface MessMealSchedule {
  breakfast: MealTimingInfo;
  lunch: MealTimingInfo;
  snacks: MealTimingInfo;
  dinner: MealTimingInfo;
}

export interface Mess {
  id: string;
  name: string;
  institution: string;
  city: string;
  contact: string;
  joinMode: JoinMode;
  messCode: string;
  mealTimings: MessMealSchedule;
  activeStudentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  uid: string;
  name: string;
  rollNo: string;
  email: string;
  messId: string | null;
  joinStatus: JoinStatus;
  dietaryPref: 'Veg' | 'Non-Veg' | 'Jain' | 'All';
  createdAt: string;
  updatedAt: string;
}

export interface MessAdminProfile {
  uid: string;
  messId: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string; // messId_date_studentUid
  messId: string;
  date: string; // YYYY-MM-DD
  studentUid: string;
  studentName: string;
  studentRollNo: string;
  breakfast: boolean; // true = IN, false = OUT
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
  lastSubmittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceAuditLog {
  id: string;
  messId: string;
  date: string;
  studentUid: string;
  studentName: string;
  action: string;
  details: string;
  timestamp: string;
  updatedBy: string;
}

export interface DailyMenu {
  id: string; // messId_date
  messId: string;
  date: string;
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
  specialNotice?: string;
  published: boolean;
  updatedAt: string;
}

export interface JoinRequest {
  id: string;
  messId: string;
  studentUid: string;
  studentName: string;
  studentRollNo: string;
  studentEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
}
