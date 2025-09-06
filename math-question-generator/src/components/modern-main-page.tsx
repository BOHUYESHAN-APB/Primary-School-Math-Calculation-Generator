import { useState } from 'react';
import { MathQuestionGenerator, GeneratorConfig, DEFAULT_CONFIG, MathQuestion } from '../lib/math-generator';
import QuestionConfigComponent from './question-config';
import QuickStart from './quick-start';
import QuestionPreview from './question-preview';
import AdvancedSettings from './advanced-settings';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getTranslation } from '../lib/i18n';
import { HTMLExportDialog } from './html-export-dialog';
import { PDFExportDialog } from './pdf-export-dialog';
import { WordExportDialog } from './word-export-dialog';
import { SemanticIcon } from './semantic-icon';
import { validateGeneratorConfig } from '@/lib/validation';
import { notifyWarning, notifyError } from '@/lib/notify';

interface ModernMainPageProps {
  language: string;
  educationSystem: 'domestic' | 'international';
  onEducationSystemChange: (system: 'domestic' | 'international') => void;
  theme: string;
}


export function ModernMainPage({ language, educationSystem, onEducationSystemChange, theme }: ModernMainPageProps) {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'advanced'>('config');
  const [isGenerating, setIsGenerating] = useState(false);
  // 默认显示快速开始，让一般用户一打开就是快速开始体验
  const [showQuickStart, setShowQuickStart] = useState(true);
  
  // 导出对话框状态
  const [showHTMLExport, setShowHTMLExport] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showWordExport, setShowWordExport] = useState(false);

  const t = {
    questionSettings: getTranslation('questionSettings', language),
    questionPreview: getTranslation('questionPreview', language),
    generateQuestions: getTranslation('generateQuestions', language),
    resetConfig: getTranslation('resetConfig', language),
    configureAndGenerate: getTranslation('configureAndGenerate', language),
    noQuestionsGenerated: getTranslation('noQuestionsGenerated', language),
  };
  
  // theme is passed from App but not yet used in this component; reference it to satisfy the type-checker
  void theme;


  const handleGenerate = () => {
    // 统一校验
    const result = validateGeneratorConfig(config);
    if (!result.valid) {
      const first = getTranslation(result.errors[0], language);
      notifyError('validationFailed', language, {
        description: first + (result.errors.length > 1 ? ` (+${result.errors.length - 1})` : '')
      });
      return;
    }
    if (result.warnings.length > 0) {
      notifyWarning('validationWarning', language, { descriptionKey: result.warnings[0] });
    }

    setIsGenerating(true);
    try {
      const generator = new MathQuestionGenerator(config);
      const generatedQuestions = generator.generateQuestions();
      setQuestions(generatedQuestions);
      setActiveTab('preview');
    } catch (error) {
      console.error('生成题目失败:', error);
      notifyError('generationFailed', language, { descriptionKey: 'configInvalid' });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    // 重置时回到快速开始视图
    setShowQuickStart(true);
  };

  // 导出为HTML
  const handleExportHTML = () => {
    setShowHTMLExport(true);
  };

  // 导出为PDF
  const handleExportPDF = () => {
    setShowPDFExport(true);
  };

  // 导出为Word
  const handleExportWord = () => {
    setShowWordExport(true);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧边栏 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">数字芽算</h2>
          <p className="text-sm text-gray-500">MathBud</p>
        </div>
        
        <nav className="flex-1 p-2">
          <Button
            variant={activeTab === 'config' ? 'default' : 'ghost'}
            className="w-full justify-start mb-1"
            onClick={() => setActiveTab('config')}
          >
            <SemanticIcon name="settings" className="h-4 w-4 mr-2" />
            题目配置
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            className="w-full justify-start mb-1"
            onClick={() => setActiveTab('preview')}
          >
            <SemanticIcon name="preview" className="h-4 w-4 mr-2" />
            题目预览
          </Button>
          <Button
            variant={activeTab === 'advanced' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('advanced')}
          >
            <SemanticIcon name="settings" className="h-4 w-4 mr-2" />
            高级设置
          </Button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={resetConfig}
            variant="outline"
            className="w-full mb-2"
          >
            <SemanticIcon name="reset" className="h-4 w-4 mr-2" />
            {t.resetConfig}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mb-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                生成中...
              </>
            ) : (
              <>
                <SemanticIcon name="generate" className="h-4 w-4 mr-2" />
                {t.generateQuestions}
              </>
            )}
          </Button>
          
          {/* 导出按钮 */}
          {questions.length > 0 && activeTab === 'preview' && (
            <div className="space-y-2">
              <Button
                onClick={handleExportHTML}
                variant="outline"
                className="w-full"
              >
                <SemanticIcon name="export" className="h-4 w-4 mr-2" />
                导出HTML
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="w-full"
              >
                <SemanticIcon name="export" className="h-4 w-4 mr-2" />
                导出PDF
              </Button>
              <Button
                onClick={handleExportWord}
                variant="outline"
                className="w-full"
              >
                <SemanticIcon name="export" className="h-4 w-4 mr-2" />
                导出Word
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'config' && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SemanticIcon name="settings" className="h-5 w-5 mr-2" />
                  {t.questionSettings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showQuickStart ? (
                  <QuickStart
                    currentLanguage={language}
                    onConfigSelect={(cfg: GeneratorConfig) => {
                      setConfig(cfg);
                      const validation = validateGeneratorConfig(cfg);
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
                      try {
                        const generator = new MathQuestionGenerator(cfg);
                        const generatedQuestions = generator.generateQuestions();
                        setQuestions(generatedQuestions);
                        setActiveTab('preview');
                      } catch (error) {
                        console.error('生成题目失败:', error);
                        notifyError('generationFailed', language, { descriptionKey: 'configInvalid' });
                      }
                    }}
                    onCustomMode={() => setActiveTab('advanced')}
                  />
                ) : (
                  <QuestionConfigComponent
                    config={config}
                    currentLanguage={language}
                    educationSystem={educationSystem}
                    onConfigChange={(newCfg: GeneratorConfig) => { setConfig(newCfg); setShowQuickStart(false); }}
                    onEducationSystemChange={onEducationSystemChange}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'preview' && (
            <Card className="max-w-4xl mx-auto h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SemanticIcon name="preview" className="h-5 w-5 mr-2" />
                  {t.questionPreview}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {questions.length > 0 ? (
                  <QuestionPreview
                    questions={questions}
                    currentLanguage={language}
                    showAnswers={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <SemanticIcon name="generate" className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg">{t.noQuestionsGenerated}</p>
                    <p className="text-sm mt-2">{t.configureAndGenerate}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'advanced' && (
            <div className="w-full max-w-6xl mx-auto">
              <AdvancedSettings
                language={language}
                educationSystem={educationSystem}
                onEducationSystemChange={onEducationSystemChange}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 导出对话框 */}
      <HTMLExportDialog
        open={showHTMLExport}
        onOpenChange={setShowHTMLExport}
        questions={questions}
        language={language}
      />
      <PDFExportDialog
        open={showPDFExport}
        onOpenChange={setShowPDFExport}
        questions={questions}
        language={language}
      />
      <WordExportDialog
        open={showWordExport}
        onOpenChange={setShowWordExport}
        questions={questions}
        language={language}
      />
    </div>
  );
}