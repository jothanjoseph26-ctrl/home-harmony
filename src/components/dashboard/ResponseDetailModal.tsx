import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Users, Mail, Phone, MapPin, Calendar, CheckCircle, Clock } from 'lucide-react';
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

interface ResponseDetailModalProps {
  response: SurveyResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResponseDetailModal({ response, open, onOpenChange }: ResponseDetailModalProps) {
  if (!response) return null;

  const survey = response.survey_type === 'landlord' ? landlordSurvey : tenantSurvey;

  const getQuestionLabel = (questionId: string): string => {
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question.question;
    }
    return questionId;
  };

  const getAnswerLabel = (questionId: string, value: unknown): string => {
    if (value === null || value === undefined) return '-';
    
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question && question.options) {
        if (Array.isArray(value)) {
          return value
            .map(v => question.options?.find(o => o.value === v)?.label || v)
            .join(', ');
        }
        const option = question.options.find(o => o.value === value);
        if (option) return option.label;
      }
    }
    
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const responses = response.responses as Record<string, unknown>;

  // Group responses by section
  const groupedResponses: { sectionTitle: string; items: { question: string; answer: string }[] }[] = [];
  
  for (const section of survey.sections) {
    const sectionItems: { question: string; answer: string }[] = [];
    for (const question of section.questions) {
      if (responses[question.id] !== undefined) {
        sectionItems.push({
          question: question.question,
          answer: getAnswerLabel(question.id, responses[question.id]),
        });
      }
    }
    if (sectionItems.length > 0) {
      groupedResponses.push({
        sectionTitle: section.title,
        items: sectionItems,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {response.survey_type === 'landlord' ? (
              <Building2 className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-secondary" />
            )}
            <span className="capitalize">{response.survey_type} Survey Response</span>
            <Badge variant={response.completed ? 'default' : 'secondary'} className="ml-2">
              {response.completed ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Complete</>
              ) : (
                <><Clock className="h-3 w-3 mr-1" /> Partial</>
              )}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {/* Contact Info */}
          <div className="mb-6 p-4 rounded-lg bg-muted/50 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{response.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{response.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{response.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{response.location || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {new Date(response.created_at).toLocaleString()}
                </span>
              </div>
              {response.source && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Source:</span>
                  <Badge variant="outline">{response.source}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Survey Responses */}
          <div className="space-y-6">
            {groupedResponses.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wide mb-3 pb-2 border-b">
                  {section.sectionTitle}
                </h3>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="text-sm">
                      <p className="text-muted-foreground mb-1">{item.question}</p>
                      <p className="font-medium text-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {groupedResponses.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No responses recorded yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
