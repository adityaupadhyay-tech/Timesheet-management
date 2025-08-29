export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  managerId?: string;
  avatar?: string;
}

export interface TimesheetEntry {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  project?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on-hold';
  color?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'vacation' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId?: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Timesheet {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  entries: TimeEntry[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface TimeTrackingState {
  isTracking: boolean;
  currentEntry?: TimeEntry;
  startTime?: Date;
  elapsedTime: number; // in seconds
}
