import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Download, FileText } from 'lucide-react';

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
  questions: any[];
}

export function HTMLExportDialog({ open, onOpenChange, questions }: HTMLExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    layout: 'side-by-side',
    includeSteps: true,
    showQuestionNumbers: true,
    title: '小学数学练习题',
    subject: '数学题目'
  });

  const handleExport = () => {
    // 简单的HTML导出实现
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
            ${questions.map((question, index) => `
              <div class="question">
                ${options.showQuestionNumbers ? `<strong>${index + 1}.</strong> ` : ''}
                ${question.expression}
              </div>
              <div class="answer">
                <strong>答案:</strong> ${question.answer}
                ${options.includeSteps && question.steps ? `
                  <div class="steps">
                    <strong>解题步骤:</strong>
                    <ol>
                      ${question.steps.map((step: string) => `<li>${step}</li>`).join('')}
                    </ol>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    // 创建下载链接
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
          <DialogTitle>HTML导出设置</DialogTitle>
          <DialogDescription>
            自定义HTML文档的格式和内容，共{questions.length}道题目
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 文档标题 */}
          <div className="grid gap-2">
            <Label htmlFor="title">文档标题</Label>
            <Input
              id="title"
              value={options.title}
              onChange={(e) => setOptions({ ...options, title: e.target.value })}
              placeholder="请输入文档标题"
            />
          </div>

          {/* 科目名称 */}
          <div className="grid gap-2">
            <Label htmlFor="subject">科目名称</Label>
            <Input
              id="subject"
              value={options.subject}
              onChange={(e) => setOptions({ ...options, subject: e.target.value })}
              placeholder="请输入科目名称"
            />
          </div>

          {/* 布局方式 */}
          <div className="grid gap-2">
            <Label>题目和答案布局</Label>
            <RadioGroup
              value={options.layout}
              onValueChange={(value: ExportOptions['layout']) => 
                setOptions({ ...options, layout: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side-by-side" id="side-by-side" />
                <Label htmlFor="side-by-side" className="cursor-pointer">
                  左右分栏（题目和答案并排显示）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question-first" id="question-first" />
                <Label htmlFor="question-first" className="cursor-pointer">
                  前题后答（先显示所有题目，再显示所有答案）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="answer-first" id="answer-first" />
                <Label htmlFor="answer-first" className="cursor-pointer">
                  前答后题（先显示所有答案，再显示所有题目）
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 其他选项 */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-numbers" className="cursor-pointer">
                显示题号
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
                包含解题步骤
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
            取消
          </Button>
          <Button onClick={handleExport}>
            <FileText className="h-4 w-4 mr-2" />
            生成HTML文档
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}