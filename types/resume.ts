export interface Theme {
  fontFamily: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  border: string;
  radius: number;
  background?: string;
  padding?: number;
}

export interface PersonalInfo {
  name: string;
  headline: string;
  headlineAccent: string;
  description: string;
  photo: string;
  photoFit?: 'contain' | 'cover';
  photoShape?: 'rounded' | 'circle' | 'square';
  photoSize?: 'sm' | 'md' | 'lg';
  location: string;
  email: string;
  website: string;
  phone: string;
  linkedin?: string;
  github?: string;
  nationality?: string;
  birthDate?: string;
  drivingLicense?: string;
}

export interface SectionItem {
  id: string;
  [key: string]: any;
}

export interface Section {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications' | 'courses' | 'volunteering' | 'awards' | 'references' | 'hobbies' | 'custom';
  title: string;
  visible: boolean;
  order: number;
  items: SectionItem[];
  styleOverrides?: Record<string, any>;
}

export interface ResumeSettings {
  format: string;
  orientation: string;
  padding: number;
  background?: string;
  theme: Partial<Theme>;
}

export interface ResumeDocument {
  id: string;
  title: string;
  personalInfo: PersonalInfo;
  sections: Section[];
  settings: ResumeSettings;
  selectedTemplateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  isPremium: boolean;
  thumbnail: string;
  pageSettings: {
    format: string;
    orientation: string;
    background: string;
    padding: number;
  };
  theme: Theme;
  layout: {
    type: 'single-column' | 'two-column-left' | 'two-column-right';
    sidebarWidth?: string;
    hidePhoto?: boolean;
    regions: {
      main: string[];
      sidebar?: string[];
    };
  };
}
