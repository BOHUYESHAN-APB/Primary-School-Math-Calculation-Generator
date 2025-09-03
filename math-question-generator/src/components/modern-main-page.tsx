import { useState } from 'react';
import { MathQuestionGenerator, GeneratorConfig, DEFAULT_CONFIG } from '../lib/math-generator';
import QuestionConfigComponent from './question-config';
import QuestionPreview from './question-preview';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RotateCcw, Play, Eye } from 'lucide-react';
import { getTranslation } from '../lib/i18n';

interface ModernMainPageProps {
  language: string;
  educationSystem: 'domestic' | 'international';
  onEducationSystemChange: (system: 'domestic' | 'international') => void;
  theme: string;
}

export function ModernMainPage({ language, educationSystem, onEducationSystemChange, theme }: ModernMainPageProps) {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [isGenerating, setIsGenerating] = useState(false);

  const t = {
    questionSettings: getTranslation('questionSettings', language),
    questionPreview: getTranslation('questionPreview', language),
    generateQuestions: getTranslation('generateQuestions', language),
    resetConfig: getTranslation('resetConfig', language),
    configureAndGenerate: getTranslation('configureAndGenerate', language),
    noQuestionsGenerated: getTranslation('noQuestionsGenerated', language),
  };

  const handleConfigChange = (newConfig: GeneratorConfig) => {
    setConfig(newConfig);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    try {
      const generator = new MathQuestionGenerator(config);
      const generatedQuestions = generator.generateQuestions();
      setQuestions(generatedQuestions);
      setActiveTab('preview');
    } catch (error) {
      console.error('生成题目失败:', error);
      alert(language === 'zh-CN' ? '生成题目失败，请检查配置' : 'Failed to generate questions, please check configuration');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
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
            <Play className="h-4 w-4 mr-2" />
            题目配置
          </Button>
          <Button 
            variant={activeTab === 'preview' ? 'default' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            题目预览
          </Button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button 
            onClick={resetConfig}
            variant="outline"
            className="w-full mb-2"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t.resetConfig}
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                生成中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t.generateQuestions}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'config' ? (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  {t.questionSettings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionConfigComponent
                  config={config}
                  currentLanguage={language}
                  educationSystem={educationSystem}
                  onConfigChange={handleConfigChange}
                  onEducationSystemChange={onEducationSystemChange}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-4xl mx-auto h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
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
                    <Play className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg">{t.noQuestionsGenerated}</p>
                    <p className="text-sm mt-2">{t.configureAndGenerate}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}