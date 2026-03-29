// Minimal type definitions for barangay-hub-main

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  address: string;
  gender?: string;
  civilStatus?: string;
  isPWD?: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  type: string;
  residentId?: string;
  issueDate: string;
  expiryDate?: string;
  content?: string;
  status: string;
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
  term?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlotterRecord {
  id: string;
  // ...add fields as needed
}

export interface Activity {
  id: string;
  // ...add fields as needed
}

export interface AdminRequest {
  id: string;
  // ...add fields as needed
}

export interface User {
  id: string;
  // ...add fields as needed
}

export interface Suggestion {
  id: string;
  // ...add fields as needed
}
