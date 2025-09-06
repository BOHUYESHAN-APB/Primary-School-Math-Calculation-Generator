import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { SemanticIcon } from '@/components/semantic-icon';
import { getTranslation } from '@/lib/i18n';
import { MathQuestion } from '@/lib/math-generator';

interface ExportOptions {
  layout: 'side-by-side' | 'question-first' | 'answer-first';
  includeSteps: boolean;
  showQuestionNumbers: boolean;
  title: string;
  subject: string;
}

interface HTMLExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: MathQuestion[];
  originalCount?: number;
  selectedCount?: number;
  language: string;
}

function replaceParams(str: string, params: Record<string, string | number>) {
  return Object.keys(params).reduce(
    (acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k])),
    str
  );
}

export function HTMLExportDialog({ open, onOpenChange, questions, originalCount, selectedCount, language }: HTMLExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    layout: 'side-by-side',
    includeSteps: true,
    showQuestionNumbers: true,
    title: getTranslation('defaultHTMLTitle', language),
    subject: getTranslation('defaultSubjectTitle', language)
  });

  const t = (k: string) => getTranslation(k, language);

  const buildRangeDescription = () => {
    if (originalCount !== undefined && selectedCount !== undefined) {
      if (selectedCount > 0) {
        return replaceParams(t('exportSelectedRange'), { selected: selectedCount, total: originalCount });
      }
      return replaceParams(t('exportAllRange'), { total: originalCount });
    }
    return replaceParams(t('exportTotalCount'), { count: questions.length });
  };
  const rangeDescription = buildRangeDescription();

  const handleExport = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${options.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .questions { margin-bottom: 40px; }
          .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .answer { background-color: #f9f9f9; padding: 15px; border-radius: 8px; }
          .steps { margin-top: 10px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${options.title}</h1>
            <h2>${options.subject}</h2>
          </div>
          
          <div class="questions">
            ${questions
              .map(
                (question, index) => `
              <div class="question">
                ${options.showQuestionNumbers ? `<strong>${index + 1}.</strong> ` : ''}
                ${question.expression}
              </div>
              <div class="answer">
                <strong>${t('answer')}:</strong> ${question.answer}
                ${
                  options.includeSteps && question.steps
                    ? `
                  <div class="steps">
                    <strong>${t('steps')}:</strong>
                    <ol>
                      ${question.steps.map((step: string) => `<li>${step}</li>`).join('')}
                    </ol>
                  </div>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SemanticIcon name="export" className="w-5 h-5" />
            {t('htmlExportSettings')}
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div>{t('htmlExportCustomize')}</div>
            <div className="text-xs font-medium text-blue-600">{rangeDescription}</div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t('documentTitle')}</Label>
            <Input
              id="title"
              value={options.title}
              onChange={(e) => setOptions({ ...options, title: e.target.value })}
              placeholder={t('documentTitlePlaceholder')}
            />
          </div>

            <div className="grid gap-2">
            <Label htmlFor="subject">{t('subjectName')}</Label>
            <Input
              id="subject"
              value={options.subject}
              onChange={(e) => setOptions({ ...options, subject: e.target.value })}
              placeholder={t('subjectNamePlaceholder')}
            />
          </div>

          <div className="grid gap-2">
            <Label>{t('qaLayout')}</Label>
            <RadioGroup
              value={options.layout}
              onValueChange={(value: ExportOptions['layout']) =>
                setOptions({ ...options, layout: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side-by-side" id="side-by-side" />
                <Label htmlFor="side-by-side" className="cursor-pointer">
                  {t('layoutSideBySide')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question-first" id="question-first" />
                <Label htmlFor="question-first" className="cursor-pointer">
                  {t('layoutQuestionFirst')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="answer-first" id="answer-first" />
                <Label htmlFor="answer-first" className="cursor-pointer">
                  {t('layoutAnswerFirst')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-numbers" className="cursor-pointer">
                {t('showQuestionNumbers')}
              </Label>
              <Switch
                id="show-numbers"
                checked={options.showQuestionNumbers}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, showQuestionNumbers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-steps" className="cursor-pointer">
                {t('includeSolutionSteps')}
              </Label>
              <Switch
                id="include-steps"
                checked={options.includeSteps}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeSteps: checked })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleExport}>
            <SemanticIcon name="export" className="h-4 w-4 mr-2" />
            {t('generateHTMLDoc')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}