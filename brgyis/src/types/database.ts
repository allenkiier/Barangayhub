// Database type definitions for Barangay Hub

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  address: string;
  gender?: 'male' | 'female' | 'other';
  civilStatus?: 'single' | 'married' | 'widowed' | 'divorced' | 'separated';
  isPWD?: boolean;
  status: 'active' | 'inactive' | 'moved';
  createdAt: string;
  updatedAt: string;
}

export interface Official {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  email?: string;
  phone?: string;
  term: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  type: string; // e.g., 'barangay-clearance', 'certificate-of-residency', etc.
  residentId: string;
  issueDate: string;
  expiryDate?: string;
  content: string;
  status: 'issued' | 'pending' | 'expired' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface BlotterRecord {
  id: string;
  reporterName: string;
  reporterContact: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'closed' | 'open';
  remarks?: string;
  summonDate?: string;
  summonTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: string; // e.g., 'resident-added', 'document-issued', etc.
  description: string;
  userId?: string;
  targetId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRequest {
  id: string;
  residentId: string;
  residentName: string;
  email: string;
  phone?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Suggestion {
  id: string;
  type: 'suggestion' | 'complaint';
  name: string;
  email?: string;
  phone?: string;
  message: string;
  status: 'pending' | 'reviewed' | 'addressed';
  response?: string;
  createdAt: string;
  updatedAt: string;
}
