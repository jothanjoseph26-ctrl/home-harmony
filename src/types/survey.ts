export interface SurveyOption {
  id: string;
  label: string;
  value: string;
}

export interface SurveyQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text' | 'rating' | 'rank';
  question: string;
  options?: SurveyOption[];
  required?: boolean;
  placeholder?: string;
  maxSelections?: number;
  ratingLabels?: { min: string; max: string };
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

export interface SurveyData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  sections: SurveySection[];
  thankYouTitle: string;
  thankYouMessage: string;
  incentive: string;
}

export interface SurveyResponse {
  [questionId: string]: string | string[];
}
