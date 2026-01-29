import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveyQuestion } from '@/components/SurveyQuestion';
import { ProgressBar } from '@/components/ProgressBar';
import { landlordSurvey } from '@/data/landlordSurvey';
import { tenantSurvey } from '@/data/tenantSurvey';
import { SurveyData, SurveyResponse } from '@/types/survey';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SurveyPage() {
  const { type } = useParams<{ type: 'landlord' | 'tenant' }>();
  const navigate = useNavigate();
  
  const survey: SurveyData = type === 'landlord' ? landlordSurvey : tenantSurvey;
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentSection = survey.sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === survey.sections.length - 1;

  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isCurrentSectionValid = () => {
    return currentSection.questions.every((question) => {
      if (!question.required) return true;
      const response = responses[question.id];
      if (Array.isArray(response)) return response.length > 0;
      return response && response.length > 0;
    });
  };

  const handleNext = () => {
    if (isLastSection) {
      handleSubmit();
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Extract contact info from responses
      const name = responses['pilot_name'] as string || responses['early_access_name'] as string || null;
      const email = responses['pilot_email'] as string || responses['early_access_email'] as string || null;
      const phone = responses['pilot_phone'] as string || responses['early_access_phone'] as string || null;
      const location = responses['property_location'] as string || responses['current_state'] as string || null;

      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_type: type,
          responses: responses,
          completed: true,
          name,
          email,
          phone,
          location,
          source: 'web',
        });

      if (error) {
        console.error('Error submitting survey:', error);
        toast.error('Failed to submit survey. Please try again.');
        setIsSubmitting(false);
        return;
      }

      toast.success('Survey submitted successfully!');
      setIsComplete(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="hero-gradient py-8">
          <div className="container">
            <nav className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-primary-foreground">TenantlyNG</span>
            </nav>
          </div>
        </div>
        
        <div className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Check className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h1 className="font-display text-4xl font-bold text-foreground">
              {survey.thankYouTitle}
            </h1>
            
            <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">
              {survey.thankYouMessage}
            </p>

            <div className="mt-10 rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Stay Connected
              </h3>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  @tenantlyng
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="mailto:hello@tenantlyng.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  hello@tenantlyng.com
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  www.tenantlyng.com
                </a>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="mt-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="hero-gradient py-8">
        <div className="container">
          <nav className="mb-6 flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Exit Survey</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <Building2 className="h-4 w-4 text-secondary-foreground" />
              </div>
              <span className="font-display font-semibold text-primary-foreground">TenantlyNG</span>
            </div>
          </nav>
          
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
              {survey.title}
            </h1>
            <p className="mt-2 text-primary-foreground/80">{survey.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm py-4">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <ProgressBar 
              current={currentSectionIndex + 1} 
              total={survey.sections.length} 
            />
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="container py-8 pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Section Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Section {currentSectionIndex + 1}
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
              {currentSection.title}
            </h2>
            {currentSection.description && (
              <p className="mt-2 text-muted-foreground">
                {currentSection.description}
              </p>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {currentSection.questions.map((question, index) => (
              <div 
                key={question.id}
                className={cn(
                  "rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in",
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SurveyQuestion
                  question={question}
                  value={responses[question.id]}
                  onChange={(value) => handleResponseChange(question.id, value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm py-4">
        <div className="container">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={isFirstSection}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              {survey.sections.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === currentSectionIndex
                      ? "w-6 bg-primary"
                      : index < currentSectionIndex
                      ? "bg-primary/50"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              variant="hero"
              disabled={!isCurrentSectionValid() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : isLastSection ? (
                <>
                  <span>Submit</span>
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
