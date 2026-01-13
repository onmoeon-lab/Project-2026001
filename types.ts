export enum EnhancementType {
  GRAMMAR = 'GRAMMAR',
  CHILD_VOICE = 'CHILD_VOICE', // For "Write about yourself"
  DESCRIPTIVE = 'DESCRIPTIVE', // For "Home/School description"
  TEACHER_REMARK = 'TEACHER_REMARK' // For "Teacher's remarks"
}

export interface PromptSetting {
  systemInstruction: string;
  promptTemplate: string;
}

export interface GlobalAIConfig {
  [EnhancementType.GRAMMAR]: PromptSetting;
  [EnhancementType.CHILD_VOICE]: PromptSetting;
  [EnhancementType.DESCRIPTIVE]: PromptSetting;
  [EnhancementType.TEACHER_REMARK]: PromptSetting;
}

export const DEFAULT_AI_CONFIG: GlobalAIConfig = {
  [EnhancementType.GRAMMAR]: {
    systemInstruction: "You are a text editor for NGO reports. Output ONLY the rewritten text.",
    promptTemplate: "Correct the grammar and spelling. Keep it simple and clear. Keep the response strictly under 90 words. Format as a single paragraph. Return only the result.\n\nText: \"{{text}}\""
  },
  [EnhancementType.CHILD_VOICE]: {
    systemInstruction: "You are polishing a child's statement for a donor report. Output ONLY the final text.",
    promptTemplate: "Rewrite the following text in the first person (\"I am...\", \"I like...\"). Use simple, innocent, and positive language suitable for a child. Keep the response strictly under 90 words. Format as a single paragraph. Return only the result.\n\nText: \"{{text}}\"\n\nContext: {{context}}"
  },
  [EnhancementType.DESCRIPTIVE]: {
    systemInstruction: "You are a text editor for NGO reports. Output ONLY the rewritten text.",
    promptTemplate: "Polish the description of the village, home, or school. Make it vivid but realistic and positive. Keep the response strictly under 90 words. Format as a single paragraph. Return only the result.\n\nText: \"{{text}}\"\n\nContext: {{context}}"
  },
  [EnhancementType.TEACHER_REMARK]: {
    systemInstruction: "You are a school teacher writing a report card comment. Output ONLY the final text.",
    promptTemplate: "Rewrite the remarks to be professional, encouraging, and specific. Use standard educational phrasing. Keep the response strictly under 90 words. Format as a single paragraph. Return only the result.\n\nText: \"{{text}}\"\n\nContext: {{context}}"
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