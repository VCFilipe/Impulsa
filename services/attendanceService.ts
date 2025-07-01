
import { Attendance, AttendanceType } from '../types';

const LOCAL_STORAGE_KEY = 'corporateEventAttendances';
const MOCK_USER_ID = 'currentUser123'; // Static user ID for now

// Helper to get all attendances from localStorage
const getAllStoredAttendances = (): { [eventId: string]: Attendance[] } => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Basic validation could be added here if necessary
      return parsed;
    } catch (e) {
      console.error("Failed to parse attendances from localStorage", e);
    }
  }
  return {};
};

// Helper to save all attendances to localStorage
const saveAllStoredAttendances = (allAttendances: { [eventId: string]: Attendance[] }): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allAttendances));
};

export const addAttendance = (attendanceData: {
  eventId: string;
  userId?: string; // Optional, defaults to mock
  type: AttendanceType;
  timestamp?: string; // Optional, defaults to now
}): Attendance => {
  const allAttendances = getAllStoredAttendances();
  const eventId = attendanceData.eventId;

  const newAttendance: Attendance = {
    eventId: eventId,
    userId: attendanceData.userId || MOCK_USER_ID,
    type: attendanceData.type,
    timestamp: attendanceData.timestamp || new Date().toISOString(),
  };

  if (!allAttendances[eventId]) {
    allAttendances[eventId] = [];
  }

  // Remove previous attendance by the same user for the same event, if any
  allAttendances[eventId] = allAttendances[eventId].filter(att => att.userId !== newAttendance.userId);
  allAttendances[eventId].push(newAttendance);
  
  saveAllStoredAttendances(allAttendances);
  return newAttendance;
};

export const getAttendancesForEvent = (eventId: string): Attendance[] => {
  const allAttendances = getAllStoredAttendances();
  return allAttendances[eventId] || [];
};

export const getAttendanceSummaryForEvent = (eventId: string): { presencialCount: number; homeOfficeCount: number } => {
  const eventAttendances = getAttendancesForEvent(eventId);
  let presencialCount = 0;
  let homeOfficeCount = 0;

  eventAttendances.forEach(att => {
    if (att.type === AttendanceType.PRESENCIAL) {
      presencialCount++;
    } else if (att.type === AttendanceType.HOME_OFFICE) {
      homeOfficeCount++;
    }
  });
  return { presencialCount, homeOfficeCount };
};

export const deleteAttendancesForEvent = (eventId: string): void => {
  const allAttendances = getAllStoredAttendances();
  if (allAttendances[eventId]) {
    delete allAttendances[eventId];
    saveAllStoredAttendances(allAttendances);
  }
};

// For potential future use, if needed to list all attendances across events
export const getAllAttendances = (): Attendance[] => {
  const allStored = getAllStoredAttendances();
  return Object.values(allStored).flat();
}; // Added semicolon
