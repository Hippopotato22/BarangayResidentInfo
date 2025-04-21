import { Timestamp } from 'firebase/firestore';

export interface Resident {
  id?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string; // Suffix is optional
  age: number; // Calculated from birthdate
  address: string;
  gender: string;
  civilStatus: string; // e.g., 'Single', 'Married', etc.
  birthdate: string; // Birthdate in YYYY-MM-DD format
  phone?: string; // Optional
  email?: string; // Optional
  profilePicture?: string; // URL to the profile picture (optional)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
