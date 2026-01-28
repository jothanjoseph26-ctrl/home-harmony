import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SurveyQuestion as QuestionType, SurveyOption } from '@/types/survey';
import { Check } from 'lucide-react';

interface SurveyQuestionProps {
  question: QuestionType;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

export function SurveyQuestion({ question, value, onChange }: SurveyQuestionProps) {
  const handleSingleSelect = (optionValue: string) => {
    onChange(optionValue);
  };

  const handleMultiSelect = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const isSelected = currentValues.includes(optionValue);
    
    if (isSelected) {
      onChange(currentValues.filter((v) => v !== optionValue));
    } else {
      if (question.maxSelections && currentValues.length >= question.maxSelections) {
        // Replace the first selected item
        const newValues = [...currentValues.slice(1), optionValue];
        onChange(newValues);
      } else {
        onChange([...currentValues, optionValue]);
      }
    }
  };

  const isOptionSelected = (optionValue: string) => {
    if (question.type === 'single') {
      return value === optionValue;
    }
    return Array.isArray(value) && value.includes(optionValue);
  };

  if (question.type === 'text') {
    return (
      <div className="space-y-3">
        <label className="block text-lg font-medium text-foreground">
          {question.question}
          {question.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <input
          type="text"
          placeholder={question.placeholder || 'Type your answer...'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-lg font-medium text-foreground">
          {question.question}
          {question.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        {question.type === 'multiple' && (
          <p className="text-sm text-muted-foreground">
            {question.maxSelections 
              ? `Select up to ${question.maxSelections} options`
              : 'Select all that apply'
            }
          </p>
        )}
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options?.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => 
              question.type === 'single' 
                ? handleSingleSelect(option.value)
                : handleMultiSelect(option.value)
            }
            className={cn(
              "relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
              isOptionSelected(option.value)
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <div className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              question.type === 'single' ? 'rounded-full' : 'rounded-md',
              isOptionSelected(option.value)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40"
            )}>
              {isOptionSelected(option.value) && (
                <Check className="h-3 w-3" />
              )}
            </div>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
