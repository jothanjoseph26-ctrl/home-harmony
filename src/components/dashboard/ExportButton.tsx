import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { landlordSurvey } from '@/data/landlordSurvey';
import { tenantSurvey } from '@/data/tenantSurvey';

interface SurveyResponse {
  id: string;
  survey_type: string;
  responses: Record<string, unknown>;
  created_at: string;
  completed: boolean;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  location: string | null;
}

interface ExportButtonProps {
  responses: SurveyResponse[];
  selectedType: 'all' | 'landlord' | 'tenant';
}

export function ExportButton({ responses, selectedType }: ExportButtonProps) {
  const getQuestionLabel = (surveyType: string, questionId: string): string => {
    const survey = surveyType === 'landlord' ? landlordSurvey : tenantSurvey;
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question.question;
    }
    return questionId;
  };

  const getAnswerLabel = (surveyType: string, questionId: string, value: unknown): string => {
    if (value === null || value === undefined) return '';
    
    const survey = surveyType === 'landlord' ? landlordSurvey : tenantSurvey;
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question && question.options) {
        if (Array.isArray(value)) {
          return value
            .map(v => question.options?.find(o => o.value === v)?.label || v)
            .join('; ');
        }
        const option = question.options.find(o => o.value === value);
        if (option) return option.label;
      }
    }
    
    if (Array.isArray(value)) return value.join('; ');
    return String(value);
  };

  const handleExport = () => {
    const filteredResponses = selectedType === 'all' 
      ? responses 
      : responses.filter(r => r.survey_type === selectedType);

    if (filteredResponses.length === 0) {
      return;
    }

    // Get all unique question IDs across all responses
    const allQuestionIds = new Set<string>();
    filteredResponses.forEach(r => {
      Object.keys(r.responses as Record<string, unknown>).forEach(key => {
        allQuestionIds.add(key);
      });
    });

    // Build CSV headers
    const baseHeaders = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Location', 'Source', 'Status', 'Submitted'];
    const questionHeaders = Array.from(allQuestionIds);
    const allHeaders = [...baseHeaders, ...questionHeaders];

    // Build CSV rows
    const rows = filteredResponses.map(r => {
      const responseData = r.responses as Record<string, unknown>;
      const baseData = [
        r.id,
        r.survey_type,
        r.name || '',
        r.email || '',
        r.phone || '',
        r.location || '',
        r.source || '',
        r.completed ? 'Complete' : 'Partial',
        new Date(r.created_at).toISOString(),
      ];

      const questionData = questionHeaders.map(qId => {
        const value = responseData[qId];
        return getAnswerLabel(r.survey_type, qId, value);
      });

      return [...baseData, ...questionData];
    });

    // Create question label headers for readability
    const firstResponse = filteredResponses[0];
    const labelHeaders = [
      ...baseHeaders,
      ...questionHeaders.map(qId => getQuestionLabel(firstResponse?.survey_type || 'tenant', qId)),
    ];

    // Escape CSV values
    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV content
    const csvContent = [
      labelHeaders.map(escapeCSV).join(','),
      ...rows.map(row => row.map(cell => escapeCSV(String(cell))).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `survey-responses-${selectedType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}
