import { useState, useEffect } from 'react';
import { getTranslation } from '@/lib/i18n';
import { MathQuestion } from '@/lib/math-generator';
import { AIAnalysisComponent } from './ai-analysis';
import { Button } from './ui/button';
import { Bot } from 'lucide-react';
import { Collapsible, CollapsibleContent } from './ui/collapsible';


interface QuestionPreviewProps {
  questions: MathQuestion[];
  showAnswers?: boolean;
  currentLanguage: string;
  onSelectionChange?: (selectedIds: string[]) => void;
}
 
const QuestionPreview = ({ questions, showAnswers = false, currentLanguage, onSelectionChange }: QuestionPreviewProps) => {
  const [showAIAnalysis, setShowAIAnalysis] = useState<{ [key: string]: boolean }>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
 
  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedIds);
  }, [selectedIds, onSelectionChange]);
 
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{getTranslation('noQuestionsGenerated', currentLanguage)}</p>
        <p className="text-sm mt-1">{getTranslation('configureAndGenerate', currentLanguage)}</p>
      </div>
    );
  }

  // 将下划线格式转换为驼峰命名格式
  const toCamelCase = (str: string) => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  // 根据难度等级获取颜色类
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'bg-green-100 text-green-800';
    if (difficulty <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // 根据难度等级获取翻译键
  const getDifficultyTranslationKey = (difficulty: number) => {
    if (difficulty >= 1 && difficulty <= 10) {
      return `difficultyLevel${difficulty}`;
    }
    return `difficultyLevel1`; // 默认返回最低难度
  };

  // 切换AI分析显示状态
  const toggleAIAnalysis = (questionId: string) => {
    setShowAIAnalysis(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(question.id)}
                    onChange={() => toggleSelect(question.id)}
                    className="h-4 w-4"
                    aria-label={`select-question-${question.id}`}
                  />
                  <span className="font-medium text-gray-700">{index + 1}. {question.expression} = </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {getTranslation('difficulty', currentLanguage)} {getTranslation(getDifficultyTranslationKey(question.difficulty), currentLanguage)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {getTranslation(toCamelCase(question.knowledgePoint), currentLanguage)}
                </span>
                {question.isVerified !== undefined && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${question.verificationResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {question.verificationResult
                      ? getTranslation('verifiedCorrect', currentLanguage)
                      : getTranslation('verifiedIncorrect', currentLanguage)}
                  </span>
                )}
              </div>
            </div>
            
            {showAnswers && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2 font-medium text-gray-700">
                  {getTranslation('answer', currentLanguage)}: {question.answer}
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">
                    {getTranslation('steps', currentLanguage)}:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 bg-white p-3 rounded border border-green-200">
                    {question.steps.map((step: string, stepIndex: number) => (
                      <li key={stepIndex} className="text-gray-600 text-sm">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
            
            {/* AI分析按钮 */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                onClick={() => toggleAIAnalysis(question.id)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Bot className="mr-2 h-4 w-4" />
                {showAIAnalysis[question.id] 
                  ? (currentLanguage === 'zh-CN' ? '隐藏AI分析' : 'Hide AI Analysis')
                  : (currentLanguage === 'zh-CN' ? '显示AI分析' : 'Show AI Analysis')
                }
              </Button>
              
              {/* AI分析组件 */}
              <Collapsible open={showAIAnalysis[question.id]}>
                <CollapsibleContent className="mt-3">
                  <AIAnalysisComponent 
                    question={question} 
                    language={currentLanguage} 
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPreview;