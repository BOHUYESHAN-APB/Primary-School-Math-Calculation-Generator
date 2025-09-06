import React, { useState } from 'react';
import QuestionConfigComponent from './question-config';
import QuestionPreview from './question-preview';
import { MathQuestionGenerator, GeneratorConfig, DEFAULT_CONFIG, MathQuestion } from '@/lib/math-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HTMLExportDialog } from './html-export-dialog';
import { PDFExportDialog } from './pdf-export-dialog';
import { WordExportDialog } from './word-export-dialog';
import { getTranslation } from '@/lib/i18n';
import { SemanticIcon } from '@/components/semantic-icon';
import { validateGeneratorConfig } from '@/lib/validation';
import { notifySuccess, notifyWarning, notifyError } from '@/lib/notify';

interface AdvancedSettingsProps {
  language: string;
  educationSystem: 'domestic' | 'international';
  onEducationSystemChange: (system: 'domestic' | 'international') => void;
}


const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ language, educationSystem, onEducationSystemChange }) => {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showHTMLExport, setShowHTMLExport] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showWordExport, setShowWordExport] = useState(false);

  const handleConfigChange = (newCfg: GeneratorConfig) => {
    setConfig(newCfg);
  };

  const handleGenerate = () => {
    // 统一配置校验
    const validation = validateGeneratorConfig(config);
    if (!validation.valid) {
      const first = getTranslation(validation.errors[0], language);
      notifyError('validationFailed', language, {
        description: first + (validation.errors.length > 1 ? ` (+${validation.errors.length - 1})` : '')
      });
      return;
    }
    if (validation.warnings.length > 0) {
      notifyWarning('validationWarning', language, { descriptionKey: validation.warnings[0] });
    }
 
    setIsGenerating(true);
    try {
      const generator = new MathQuestionGenerator(config);
      const generatedQuestions = generator.generateQuestions();
      setQuestions(generatedQuestions);
      setSelectedIds([]);
      notifySuccess('generateQuestions', language, {
        description: `${generatedQuestions.length} ${language === 'zh-CN' ? '题目已生成' : 'questions generated'}`
      });
    } catch (error) {
      console.error('生成题目失败:', error);
      notifyError('generationFailed', language, { descriptionKey: 'configInvalid' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const getExportList = () => {
    if (selectedIds && selectedIds.length > 0) {
      return questions.filter(q => selectedIds.includes(q.id));
    }
    return questions;
  };

  const openHTMLExport = () => setShowHTMLExport(true);
  const openPDFExport = () => setShowPDFExport(true);
  const openWordExport = () => setShowWordExport(true);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <SemanticIcon name="settings" className="w-5 h-5" />
              {getTranslation('advancedSettings', language) || (language === 'zh-CN' ? '高级设置' : 'Advanced Settings')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { setConfig(DEFAULT_CONFIG); setQuestions([]); setSelectedIds([]); }}>
                <SemanticIcon name="reset" className="w-4 h-4 mr-1" />
                {language === 'zh-CN' ? '重置为默认' : 'Reset to Defaults'}
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                <SemanticIcon name="generate" className="w-4 h-4 mr-1" />
                {isGenerating ? (language === 'zh-CN' ? '生成中...' : 'Generating...') : (language === 'zh-CN' ? '生成题目' : 'Generate')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {/* QuestionConfigComponent 作为高级设置表单 */}
            <QuestionConfigComponent
              config={config}
              currentLanguage={language}
              educationSystem={educationSystem}
              onEducationSystemChange={onEducationSystemChange}
              onConfigChange={(newCfg: GeneratorConfig) => handleConfigChange(newCfg)}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="text-sm text-gray-600 flex-1 min-w-[200px]">
                {getTranslation('previewAndSelect', language) || (language === 'zh-CN' ? '预览并选择要导出的题目' : 'Preview and select questions to export')}
                <div className="mt-1 text-xs font-medium">
                  {questions.length > 0 ? (
                    selectedIds.length > 0 ? (
                      language === 'zh-CN'
                        ? `已选 ${selectedIds.length} / ${questions.length} 题，将仅导出所选题目`
                        : `Selected ${selectedIds.length}/${questions.length}, only selected will be exported`
                    ) : (
                      language === 'zh-CN'
                        ? `未选择题目，将导出全部 (${questions.length})`
                        : `No selection, exporting all (${questions.length})`
                    )
                  ) : (
                    language === 'zh-CN' ? '尚未生成题目' : 'No questions yet'
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" onClick={() => { setSelectedIds([]); }} disabled={selectedIds.length === 0}>
                  <SemanticIcon name="reset" className="w-4 h-4 mr-1" />
                  {language === 'zh-CN' ? '清除选择' : 'Clear Selection'}
                </Button>
                <Button onClick={openHTMLExport} disabled={questions.length === 0}>
                  <SemanticIcon name="export" className="w-4 h-4 mr-1" />
                  {language === 'zh-CN' ? '导出HTML' : 'Export HTML'}
                </Button>
                <Button variant="outline" onClick={openPDFExport} disabled={questions.length === 0}>
                  <SemanticIcon name="export" className="w-4 h-4 mr-1" />
                  {language === 'zh-CN' ? '导出PDF' : 'Export PDF'}
                </Button>
                <Button variant="outline" onClick={openWordExport} disabled={questions.length === 0}>
                  <SemanticIcon name="export" className="w-4 h-4 mr-1" />
                  {language === 'zh-CN' ? '导出Word' : 'Export DOCX'}
                </Button>
              </div>
            </div>
 
            <div>
              <QuestionPreview
                questions={questions}
                currentLanguage={language}
                showAnswers={false}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 导出对话框：传入已选题目或全部 */}
      <HTMLExportDialog
        open={showHTMLExport}
        onOpenChange={setShowHTMLExport}
        questions={getExportList()}
        originalCount={questions.length}
        selectedCount={selectedIds.length}
        language={language}
      />
      <PDFExportDialog
        open={showPDFExport}
        onOpenChange={setShowPDFExport}
        questions={getExportList()}
        originalCount={questions.length}
        selectedCount={selectedIds.length}
        language={language}
      />
      <WordExportDialog
        open={showWordExport}
        onOpenChange={setShowWordExport}
        questions={getExportList()}
        originalCount={questions.length}
        selectedCount={selectedIds.length}
        language={language}
      />
    </div>
  );
};

export default AdvancedSettings;