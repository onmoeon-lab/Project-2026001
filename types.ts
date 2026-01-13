
export enum EnhancementType {
  CHILD_NARRATIVE = 'CHILD_NARRATIVE',
  TEACHER_EVALUATION = 'TEACHER_EVALUATION'
}

export interface PromptSetting {
  systemInstruction: string;
  promptTemplate: string;
}

export interface GlobalAIConfig {
  [EnhancementType.CHILD_NARRATIVE]: PromptSetting;
  [EnhancementType.TEACHER_EVALUATION]: PromptSetting;
}

export const DEFAULT_AI_CONFIG: GlobalAIConfig = {
  [EnhancementType.CHILD_NARRATIVE]: {
    systemInstruction: "You are a helpful assistant polishing text for a child's sponsorship report. You should adopt a simple  and positive tone suitable for a child when writing in first person, or a clear descriptive tone when describing surroundings.",
    promptTemplate: "Refine the following text. If the context implies a personal story or future aim, use the first person ('I am', 'I want'). If it is a description of a place (home, school), keep it descriptive. \n\nKeep the response strictly under 90 words. \nFormat as a single paragraph. \nReturn only the result.\n\nText: \"{{text}}\"\n\nContext: {{context}}"
  },
  [EnhancementType.TEACHER_EVALUATION]: {
    systemInstruction: "You are a school teacher writing a report card comment. Output ONLY the final text.",
    promptTemplate: "Rewrite the remarks to be professional, encouraging, and specific. Use standard educational phrasing. Keep the response strictly under 30 words. Format as a single paragraph. Return only the result.\n\nText: \"{{text}}\"\n\nContext: {{context}}"
  }
};

export interface DossierProfile {
  // Header Info
  schoolName: string;

  // Left Column Bio
  childName: string;
  dob: string;
  sponsorshipCategory: string;
  gender: string;
  height: string;
  personality: string;
  fathersName: string;
  fathersStatus: string;
  familyIncomeSource: string;

  // Right Column Bio
  aidNo: string;
  donorAgency: string;
  aimInLife: string;
  grade: string;
  weight: string;
  academicYear: string;
  mothersName: string;
  mothersStatus: string;
  monthlyIncome: string;

  // Descriptive Fields
  aboutSelfAndFuture: string;
  homeDescription: string;
  schoolDescription: string;
  interestingStory: string;
  teachersRemarks: string;

  // Footer
  preparedBy: string;
  preparedDate: string;
}

export const INITIAL_DOSSIER: DossierProfile = {
  schoolName: 'Tongi Children Education Program',
  childName: '',
  dob: '',
  sponsorshipCategory: 'Day',
  gender: '',
  height: '',
  personality: '',
  fathersName: '',
  fathersStatus: '',
  familyIncomeSource: '',
  aidNo: '',
  donorAgency: 'ADRA Czech',
  aimInLife: '',
  grade: '',
  weight: '',
  academicYear: '2025',
  mothersName: '',
  mothersStatus: '',
  monthlyIncome: '',
  aboutSelfAndFuture: '',
  homeDescription: '',
  schoolDescription: '',
  interestingStory: '',
  teachersRemarks: '',
  preparedBy: '',
  preparedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.') // Format DD.MM.YYYY
};

// --- Auth & Config Types ---

export type Role = 'ADMIN' | 'USER';

export interface User {
  username: string; // UserID
  password: string; // In a real app, hash this!
  role: Role;
  name: string; // Full Name for "Prepared By"
}

export interface AppSettings {
  aiConfig: GlobalAIConfig;
  defaultDossierValues: Partial<DossierProfile>;
  users: User[];
}

export const DEFAULT_USERS: User[] = [
  { username: 'admin', password: '123', role: 'ADMIN', name: 'System Administrator' },
  { username: 'user', password: '123', role: 'USER', name: 'General User' }
];
