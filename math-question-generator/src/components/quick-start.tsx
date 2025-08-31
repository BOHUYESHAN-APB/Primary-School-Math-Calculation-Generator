import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Star, Zap, Settings, Globe, Hash, Shield } from 'lucide-react';
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
  const [autoVerifyAnswers, setAutoVerifyAnswers] = useState<boolean>(true); // 默认开启答案自检

  const supportedGrades = getSupportedGrades();
  const difficultyModes = getDifficultyModes().filter(mode => mode !== 'custom');

  const getDifficultyIcon = (difficulty: DifficultyMode) => {
    switch (difficulty) {
      case 'easy':
        return <Star className="w-4 h-4" />;
      case 'normal':
        return <BookOpen className="w-4 h-4" />;
      case 'hard':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: DifficultyMode, isSelected: boolean) => {
    const baseClasses = "cursor-pointer transition-all duration-200 min-h-[60px] flex items-center justify-center gap-2";
    
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
    if (selectedGrade && selectedDifficulty) {
      const baseConfig = getGradePreset(selectedGrade, selectedDifficulty);
      if (baseConfig) {
        // 应用用户自定义设置
        const customizedConfig: GeneratorConfig = {
          ...baseConfig,
          educationSystem,
          questionCount,
          autoVerifyAnswers
        };
        onConfigSelect(customizedConfig);
      }
    }
  };

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
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <BookOpen className="w-6 h-6" />
          {getTranslation('quickStart', currentLanguage)}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {currentLanguage === 'zh-CN' 
            ? '选择年级和难度，快速开始练习' 
            : 'Select grade and difficulty to start quickly'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 教育体系选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
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
            <Hash className="w-4 h-4" />
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
        </div>

        <Separator />
        
        {/* 答案自检功能 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
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
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {currentLanguage === 'zh-CN' ? '开始生成题目' : 'Start Generating Questions'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onCustomMode} 
                className="w-full h-10 text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
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