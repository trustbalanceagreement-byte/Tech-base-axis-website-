export type NavSection = 'home' | 'projects' | 'packages' | 'contact' | 'admin' | 'privacy' | 'terms';

export type MediaSourceType = 
  | 'uploaded_video'
  | 'uploaded_photo'
  | 'instagram_embed'
  | 'youtube_embed'
  | 'external_video';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'Full-Stack SaaS' | 'AI & Intelligence' | 'Cloud & Infra' | 'Fintech & Web3';
  description: string;
  fullOverview: string;
  architectureHighlights: string[];
  techStack: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  featured: boolean;
  year: string;
  demoUrl?: string;
  githubUrl?: string;
  status: 'Production' | 'Active Deployment' | 'Enterprise Client' | 'Draft';
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'instagram' | 'both';
  mediaSource?: MediaSourceType;
  storagePath?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  sortOrder?: number;
}

export interface PackageFeature {
  text: string;
  included: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  badge: string;
  price: number;
  period?: string;
  cycle?: 'monthly' | 'milestone' | 'maintenance' | 'subscription';
  theme?: 'green' | 'blue' | 'amber' | 'red';
  description: string;
  turnaround?: string;
  idealFor?: string;
  features: (string | PackageFeature)[];
  deliverables?: string[];
  techStack?: string[];
  popular?: boolean;
}

export interface ClientInquiry {
  id: string;
  clientName: string;
  email: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  details: string;
  selectedPackage?: string;
  createdAt: string;
  status: 'New' | 'Reviewing' | 'Proposal Sent' | 'In Development' | 'Completed';
  priority: 'Normal' | 'High' | 'Critical';
  notes?: string;
  eventType?: 'package_booking' | 'appointment' | 'quote_request' | 'contact_enquiry' | 'payment_success' | 'proposal_accepted' | 'revision_request' | 'support_request' | 'inquiry_message';
  phone?: string;
  websiteType?: string;
  selectedFeatures?: string[];
  appointmentDate?: string;
  appointmentTime?: string;
  addOns?: string[];
  basePrice?: number;
  totalPrice?: number;
  paymentId?: string;
  orderId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  utrNumber?: string;
  verifiedAt?: string;
  revisionId?: string;
  ticketId?: string;
}

export interface ArchitectureSkill {
  category: string;
  iconName: string;
  skills: {
    name: string;
    level: string;
    description: string;
  }[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  description: string;
  honors?: string;
  location: string;
}
