import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { exportToWord } from '@/lib/word-exporter';
import { SemanticIcon } from '@/components/semantic-icon';
import { getTranslation } from '@/lib/i18n';
import { MathQuestion } from '@/lib/math-generator';

interface WordExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: MathQuestion[];
  originalCount?: number;
  selectedCount?: number;
  language: string;
}

function replaceParams(str: string, params: Record<string, string | number>) {
  return Object.keys(params).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key])),
    str
  );
}

export function WordExportDialog({
  open,
  onOpenChange,
  questions,
  originalCount,
  selectedCount,
  language
}: WordExportDialogProps) {
  const t = (k: string) => getTranslation(k, language);
  const [isExporting, setIsExporting] = useState(false);
  const [title, setTitle] = useState(getTranslation('defaultWordTitle', language));

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

  const summary = replaceParams(t('wordExportSummary'), { count: questions.length });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToWord(questions, title);
    } catch (error) {
      console.error('Word export failed:', error);
      // TODO: 未来加入 toast 错误提示并 i18n
    } finally {
      setIsExporting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SemanticIcon name="export" className="w-5 h-5" />
            {t('exportWordButton')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="text-xs font-medium text-blue-600 px-1">
            {rangeDescription}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t('documentTitle')}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder={t('documentTitlePlaceholder')}
            />
          </div>
          <div className="text-sm text-slate-600">
            {summary}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('exporting')}
              </>
            ) : (
              <>
                <SemanticIcon name="export" className="mr-2 h-4 w-4" />
                {t('exportWordButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}