
export enum DealStage {
  LEAD = 'LEAD',
  CONTACTADO = 'CONTACTADO',
  PROPUESTA = 'PROPUESTA',
  NEGOCIACION = 'NEGOCIACION',
  CERRADO_GANADO = 'CERRADO_GANADO',
  CERRADO_PERDIDO = 'CERRADO_PERDIDO'
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  lastContact: string;
  notes: string;
  // Apollo-like fields
  linkedIn?: string;
  technologies?: string[]; // e.g. ["React", "AWS", "HubSpot"]
  location?: string;
  enrichmentStatus?: 'pending' | 'enriched';
  activeSequenceId?: string; // ID of the sequence they are enrolled in
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: DealStage;
  contactId: string;
  probability: number; // 0-100
  expectedCloseDate: string;
  aiAnalysis?: string; 
  observations?: string; 
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string; 
  observations?: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; 
  time: string;
  endTime?: string; 
  description: string;
  contactId?: string;
  type: 'meeting' | 'call' | 'demo';
  // Google Calendar style fields
  location?: string;
  meetLink?: string;
  guests?: string[]; // Contact IDs
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Ventas';
  status: 'active' | 'away' | 'inactive';
  avatar: string;
}

export interface BillingInfo {
  last4: string;
  brand: string; // 'Mastercard', 'Visa', etc.
  expiry: string;
  cardHolder: string;
}

export interface SystemSettings {
  notifications: {
    deals: boolean;
    tasks: boolean;
  };
  apiKey?: string;
  billing: BillingInfo;
}

export interface DashboardMetrics {
  totalRevenue: number;
  activeDeals: number;
  conversionRate: number;
  openTasks: number;
}

export interface AILeadAnalysis {
  companyType: string; // Qué hacen
  strengths: string[];
  weaknesses: string[]; // Vulnerabilidades
  needs: string[]; // Necesidades detectadas
  salesPitch: string; // Cómo venderles
}

export interface AILead {
  companyName: string;
  website: string;
  description: string;
  potentialRole: string; 
  confidence: number;
  sourceUrl?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  // New Apollo fields
  technologies?: string[];
  intentSignal?: string; // "Hiring for Sales", "Expanding", etc.
  analysis?: AILeadAnalysis; // Deep dive data
}

export interface SequenceStep {
  id: string;
  day: number; // Day offset (Day 1, Day 3...)
  type: 'email' | 'call' | 'linkedin';
  content: string; // Email body or task instruction
  subject?: string; // Only for emails
}

export interface Sequence {
  id: string;
  name: string;
  targetAudience: string; // e.g. "CEOs in Tech"
  steps: SequenceStep[];
  enrolledCount: number;
}