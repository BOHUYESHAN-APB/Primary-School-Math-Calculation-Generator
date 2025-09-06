import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SemanticIcon } from '@/components/semantic-icon';
import { getTranslation } from '@/lib/i18n';
import { GeneratorConfig } from '@/lib/math-generator';
import { getGradePreset, getDifficultyModes, getSupportedGrades, DifficultyMode } from '@/lib/grade-presets';
interface QuickStartProps {
  onConfigSelect: (config: GeneratorConfig) => void;
  onCustomMode: () => void;
  currentLanguage: string;
}

const QuickStart: React.FC<QuickStartProps> = ({ onConfigSelect, onCustomMode, currentLanguage }) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyMode | null>(null);
  const [educationSystem, setEducationSystem] = useState<'domestic' | 'international'>('domestic');
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [decimalQuestionCount, setDecimalQuestionCount] = useState<number>(0);
  const [fractionQuestionCount, setFractionQuestionCount] = useState<number>(0);
  const [autoVerifyAnswers, setAutoVerifyAnswers] = useState<boolean>(true); // 默认开启答案自检

  // 校验与提示
  const [validationMsg, setValidationMsg] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    const totalSpecial = decimalQuestionCount + fractionQuestionCount;
    if (totalSpecial > questionCount) {
      setIsValid(false);
      setValidationMsg(
        currentLanguage === 'zh-CN'
          ? '❌ 小数题数 + 分数题数 不能超过总题数'
          : '❌ Decimal + Fraction counts cannot exceed total questions'
      );
    } else {
      setIsValid(true);
      const remaining = questionCount - totalSpecial;
      setValidationMsg(
        currentLanguage === 'zh-CN'
          ? `✅ 剩余 ${remaining} 道普通题目`
          : `✅ ${remaining} regular questions remaining`
      );
    }
  }, [questionCount, decimalQuestionCount, fractionQuestionCount, currentLanguage]);

  const supportedGrades = getSupportedGrades();
  const difficultyModes = getDifficultyModes().filter(mode => mode !== 'custom');

  const getDifficultyIcon = (difficulty: DifficultyMode) => {
    switch (difficulty) {
      case 'easy':
        return <SemanticIcon name="difficultyEasy" className="w-4 h-4" />;
      case 'normal':
        return <SemanticIcon name="difficultyNormal" className="w-4 h-4" />;
      case 'hard':
        return <SemanticIcon name="difficultyHard" className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: DifficultyMode, isSelected: boolean) => {
    // 增加按下动画与过渡，提供即时反馈
    const baseClasses = "cursor-pointer active:scale-95 transition-transform duration-150 min-h-[60px] flex items-center justify-center gap-2";
    
    if (!isSelected) {
      switch (difficulty) {
        case 'easy':
          return `${baseClasses} border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50`;
        case 'normal':
          return `${baseClasses} border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50`;
        case 'hard':
          return `${baseClasses} border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50`;
        default:
          return baseClasses;
      }
    } else {
      switch (difficulty) {
        case 'easy':
          return `${baseClasses} border-green-500 bg-green-100 text-green-800`;
        case 'normal':
          return `${baseClasses} border-blue-500 bg-blue-100 text-blue-800`;
        case 'hard':
          return `${baseClasses} border-red-500 bg-red-100 text-red-800`;
        default:
          return baseClasses;
      }
    }
  };

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
    setSelectedDifficulty(null); // 重置难度选择
  };

  const handleDifficultySelect = (difficulty: DifficultyMode) => {
    setSelectedDifficulty(difficulty);
  };

  const handleStartGeneration = () => {
    if (!isValid) return;
    if (selectedGrade && selectedDifficulty) {
      const baseConfig = getGradePreset(selectedGrade, selectedDifficulty);
      if (baseConfig) {
        const customizedConfig: GeneratorConfig = {
          ...baseConfig,
          educationSystem,
            questionCount,
          autoVerifyAnswers,
          includeDecimals: decimalQuestionCount > 0 || baseConfig.includeDecimals,
          decimalPlaces: baseConfig.decimalPlaces ?? 2,
          includeFractions: fractionQuestionCount > 0 || baseConfig.includeFractions,
          fractionQuestionCount
        };
        onConfigSelect(customizedConfig);
      }
    }
  };

  const startDisabled = !selectedGrade || !selectedDifficulty || !isValid;
  const startButtonText = (() => {
    if (!selectedGrade || !selectedDifficulty) {
      return currentLanguage === 'zh-CN' ? '请选择年级与难度' : 'Select grade & difficulty';
    }
    if (!isValid) {
      return currentLanguage === 'zh-CN' ? '修正上方输入' : 'Fix input above';
    }
    return currentLanguage === 'zh-CN' ? '开始生成题目' : 'Start Generating Questions';
  })();

  const getGradeDescription = (grade: number) => {
    const descriptions = {
      1: currentLanguage === 'zh-CN' ? '20以内加减法' : '1-20 Addition & Subtraction',
      2: currentLanguage === 'zh-CN' ? '乘法口诀，两位数运算' : 'Multiplication Tables, 2-digit Operations',
      3: currentLanguage === 'zh-CN' ? '三位数运算，分数初步' : '3-digit Operations, Basic Fractions',
      4: currentLanguage === 'zh-CN' ? '小数运算，四则混合' : 'Decimal Operations, Mixed Calculations',
      5: currentLanguage === 'zh-CN' ? '分数小数，百分数' : 'Fractions, Decimals & Percentages',
      6: currentLanguage === 'zh-CN' ? '综合运算，代数基础' : 'Advanced Operations, Basic Algebra',
    };
    return descriptions[grade as keyof typeof descriptions] || '';
  };

  return (
    <Card className="w-full shadow-md border border-blue-100">
      <CardHeader className="text-center bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-blue-700">
          <SemanticIcon name="quickStart" className="w-6 h-6 text-blue-600" />
          {getTranslation('quickStart', currentLanguage)}
        </CardTitle>
        <p className="text-sm text-blue-600 mt-2">
          {currentLanguage === 'zh-CN'
            ? '选择年级与难度，一键生成适配练习'
            : 'Choose grade & difficulty, generate instantly'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* 教育体系选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SemanticIcon name="educationSystem" className="w-4 h-4" />
            <h3 className="font-medium text-base">
              {getTranslation('educationSystem', currentLanguage)}
            </h3>
          </div>
          <Select value={educationSystem} onValueChange={(value: 'domestic' | 'international') => setEducationSystem(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic">
                {getTranslation('domesticSystem', currentLanguage)}
              </SelectItem>
              <SelectItem value="international">
                {getTranslation('internationalSystem', currentLanguage)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />
        
        {/* 题目数量设定 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SemanticIcon name="questionCount" className="w-4 h-4" />
            <Label className="font-medium text-base">
              {getTranslation('questionCount', currentLanguage)}: {questionCount}
            </Label>
          </div>
          <Slider
            value={[questionCount]}
            onValueChange={(value) => setQuestionCount(value[0])}
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5 {currentLanguage === 'zh-CN' ? '道' : 'questions'}</span>
            <span>50 {currentLanguage === 'zh-CN' ? '道' : 'questions'}</span>
          </div>

          {/* 快速设置：在总题数内分配的小数与分数题数（其余为普通题目） */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">{currentLanguage === 'zh-CN' ? '小数题数' : 'Decimal count'}</Label>
              <input
                type="number"
                min={0}
                max={questionCount}
                value={decimalQuestionCount}
                onChange={(e) => setDecimalQuestionCount(Math.max(0, Math.min(questionCount, parseInt(e.target.value || '0'))))}
                className={`w-full px-2 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${!isValid ? 'border-red-300' : 'border-gray-300'}`}
              />
              <p className="text-xs text-gray-500">{currentLanguage === 'zh-CN' ? '总题数中的小数题' : 'Decimal questions within total'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">{currentLanguage === 'zh-CN' ? '分数题数' : 'Fraction count'}</Label>
              <input
                type="number"
                min={0}
                max={questionCount}
                value={fractionQuestionCount}
                onChange={(e) => setFractionQuestionCount(Math.max(0, Math.min(questionCount, parseInt(e.target.value || '0'))))}
                className={`w-full px-2 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${!isValid ? 'border-red-300' : 'border-gray-300'}`}
              />
              <p className="text-xs text-gray-500">{currentLanguage === 'zh-CN' ? '总题数中的分数题' : 'Fraction questions within total'}</p>
            </div>
          </div>
          <div className="mt-1 text-xs font-medium">
            <span className={`${isValid ? 'text-green-600' : 'text-red-600'}`}>{validationMsg}</span>
          </div>
        </div>

        <Separator />
        
        {/* 答案自检功能 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SemanticIcon name="autoVerify" className="w-4 h-4" />
              <Label className="font-medium text-base">
                {currentLanguage === 'zh-CN' ? '答案自动验证' : 'Auto Verify Answers'}
              </Label>
            </div>
            <Switch
              checked={autoVerifyAnswers}
              onCheckedChange={setAutoVerifyAnswers}
            />
          </div>
          <p className="text-xs text-gray-600">
            {currentLanguage === 'zh-CN'
              ? '开启后将自动检查题目答案的正确性，确保题目质量'
              : 'Enable automatic verification of answer accuracy to ensure question quality'}
          </p>
        </div>

        <Separator />
        {/* 年级选择 */}
        <div className="space-y-3">
          <h3 className="font-medium text-base">
            {currentLanguage === 'zh-CN' ? '选择年级' : 'Select Grade'}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {supportedGrades.map(grade => (
              <div
                key={grade}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  selectedGrade === grade
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleGradeSelect(grade)}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {currentLanguage === 'zh-CN' ? `${grade}年级` : `Grade ${grade}`}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getGradeDescription(grade)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedGrade && (
          <>
            <Separator />
            
            {/* 难度选择 */}
            <div className="space-y-3">
              <h3 className="font-medium text-base">
                {currentLanguage === 'zh-CN' ? '选择难度' : 'Select Difficulty'}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {difficultyModes.map(difficulty => (
                  <Badge
                    key={difficulty}
                    variant="outline"
                    className={getDifficultyColor(difficulty, selectedDifficulty === difficulty)}
                    onClick={() => handleDifficultySelect(difficulty)}
                  >
                    {getDifficultyIcon(difficulty)}
                    <span className="font-medium">
                      {getTranslation(`${difficulty}Mode`, currentLanguage)}
                    </span>
                    <span className="text-xs ml-2">
                      {difficulty === 'easy' && (currentLanguage === 'zh-CN' ? '基础练习' : 'Basic Practice')}
                      {difficulty === 'normal' && (currentLanguage === 'zh-CN' ? '标准练习' : 'Standard Practice')}
                      {difficulty === 'hard' && (currentLanguage === 'zh-CN' ? '提高练习' : 'Advanced Practice')}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedGrade && selectedDifficulty && (
          <>
            <Separator />
            
            {/* 开始按钮 */}
            <div className="space-y-3">
              <Button
                onClick={handleStartGeneration}
                disabled={startDisabled}
                className={`w-full h-12 text-base font-medium relative overflow-hidden
                  ${startDisabled
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-transform'}`
                }
              >
                <SemanticIcon name="generate" className="w-5 h-5 mr-2" />
                {startButtonText}
              </Button>
              
              <Button
                variant="outline"
                onClick={onCustomMode}
                className="w-full h-10 text-sm"
              >
                <SemanticIcon name="settings" className="w-4 h-4 mr-2" />
                {getTranslation('customMode', currentLanguage)}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickStart;