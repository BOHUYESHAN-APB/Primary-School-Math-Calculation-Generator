import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { exportToPDF } from '../lib/pdf-exporter';
import { SemanticIcon } from './semantic-icon';
import { getTranslation } from '../lib/i18n';

import { MathQuestion } from '@/lib/math-generator';

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: MathQuestion[];
  originalCount?: number;
  selectedCount?: number;
  language: string;
}

function replaceParams(str: string | null | undefined, params: Record<string, string | number>) {
  const base = str ?? '';
  return Object.keys(params).reduce(
    (acc, k) => String(acc).replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k])),
    base
  );
}

export function PDFExportDialog({
  open,
  onOpenChange,
  questions,
  originalCount,
  selectedCount,
  language
}: PDFExportDialogProps) {
  const t = (k: string) => getTranslation(k, language);
  const [isExporting, setIsExporting] = useState(false);
  const [title, setTitle] = useState(getTranslation('defaultPDFTitle', language));

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

  const summary = replaceParams(
    t('pdfExportSummary'),
    { count: questions.length }
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(questions, title);
    } catch (error) {
      console.error('PDF export failed:', error);
      // 仅记录日志，未来可加入 toast i18n 提示
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
            {t('exportPDFButton')}
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
                {t('exportPDFButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}