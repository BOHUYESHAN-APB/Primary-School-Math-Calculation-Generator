import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Bot, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { MathQuestion } from '../lib/math-generator';
import { AIAnalysis, aiService } from '../lib/ai-service';
import { Alert, AlertDescription } from './ui/alert';

interface AIAnalysisComponentProps {
  question: MathQuestion;
  language: string;
}

export function AIAnalysisComponent({ question, language }: AIAnalysisComponentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!question || !question.expression) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      // 提交AI分析请求
      const result = await aiService.submitAnalysis({
        question,
        language,
        detail_level: 'standard'
      });

      // 轮询获取结果
      const analysisResult = await aiService.pollAnalysisResult(result.task_id);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('AI分析失败:', error);
      setError(error instanceof Error ? error.message : 'AI分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = () => {
    if (isAnalyzing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (analysis) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    return <Bot className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isAnalyzing) return language === 'zh-CN' ? 'AI分析中...' : 'AI Analyzing...';
    if (analysis) return language === 'zh-CN' ? 'AI分析完成' : 'AI Analysis Complete';
    if (error) return language === 'zh-CN' ? 'AI分析失败' : 'AI Analysis Failed';
    return language === 'zh-CN' ? 'AI智能解答' : 'AI Smart Solution';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </CardTitle>
        <CardDescription>
          {language === 'zh-CN' 
            ? '使用AI分析数学题目，提供详细的解题步骤和指导' 
            : 'Use AI to analyze math problems and provide detailed solution steps and guidance'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 题目信息 */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="font-medium text-lg">{question.expression}</div>
          {question.answer !== undefined && (
            <div className="text-sm text-muted-foreground mt-1">
              {language === 'zh-CN' ? '答案' : 'Answer'}: {question.answer}
            </div>
          )}
        </div>

        {/* AI分析按钮 */}
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !question.expression}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'zh-CN' ? '分析中...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              {language === 'zh-CN' ? '开始AI分析' : 'Start AI Analysis'}
            </>
          )}
        </Button>

        {/* 错误信息 */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* AI分析结果 */}
        {analysis && (
          <ScrollArea className="h-96 w-full">
            <div className="space-y-4">
              {/* 题目理解 */}
              {analysis.problem_understanding && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">{language === 'zh-CN' ? '题目理解' : 'Problem Understanding'}</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.problem_understanding}</p>
                </div>
              )}

              {/* 解题思路 */}
              {analysis.solution_approach && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">{language === 'zh-CN' ? '解题思路' : 'Solution Approach'}</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.solution_approach}</p>
                </div>
              )}

              <Separator />

              {/* 解题步骤 */}
              {analysis.solution_steps && analysis.solution_steps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge>{language === 'zh-CN' ? '解题步骤' : 'Solution Steps'}</Badge>
                  </h4>
                  <div className="space-y-3">
                    {analysis.solution_steps.map((step, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="font-medium text-sm mb-1">
                          {language === 'zh-CN' ? `步骤 ${step.step_number}` : `Step ${step.step_number}`}
                        </div>
                        <div className="text-sm">{step.description}</div>
                        {step.explanation && (
                          <div className="text-xs text-muted-foreground mt-2">{step.explanation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* 关键概念 */}
              {analysis.key_concepts && analysis.key_concepts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{language === 'zh-CN' ? '关键概念' : 'Key Concepts'}</Badge>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_concepts.map((concept, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 常见错误 */}
              {analysis.common_mistakes && analysis.common_mistakes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="destructive">{language === 'zh-CN' ? '常见错误' : 'Common Mistakes'}</Badge>
                  </h4>
                  <ul className="text-sm space-y-1">
                    {analysis.common_mistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 解题技巧 */}
              {analysis.tips && analysis.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{language === 'zh-CN' ? '解题技巧' : 'Solving Tips'}</Badge>
                  </h4>
                  <ul className="text-sm space-y-1">
                    {analysis.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 难度分析 */}
              {analysis.difficulty_analysis && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">{language === 'zh-CN' ? '难度分析' : 'Difficulty Analysis'}</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.difficulty_analysis}</p>
                </div>
              )}

              {/* 其他解法 */}
              {analysis.alternative_methods && analysis.alternative_methods.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">{language === 'zh-CN' ? '其他解法' : 'Alternative Methods'}</Badge>
                  </h4>
                  <ul className="text-sm space-y-1">
                    {analysis.alternative_methods.map((method, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">→</span>
                        <span>{method}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}