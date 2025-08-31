import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf-exporter';

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

export function PDFExportDialog({ open, onOpenChange, content }: PDFExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(content);
    } catch (error) {
      console.error('PDF导出失败:', error);
    } finally {
      setIsExporting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>导出为PDF</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-sm text-slate-600">
          即将生成包含所有题目的PDF文件
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            取消
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在导出...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                导出PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}