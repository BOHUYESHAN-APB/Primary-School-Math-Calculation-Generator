import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getTranslation } from '@/lib/i18n';
import { GeneratorConfig, DEFAULT_CONFIG } from '@/lib/math-generator';
import { saveConfigToStorage, loadConfigFromStorage } from '@/lib/storage';

interface QuestionConfigProps {
  onConfigChange: (config: GeneratorConfig) => void;
  currentLanguage: string;
  educationSystem: 'domestic' | 'international';
  onEducationSystemChange: (system: 'domestic' | 'international') => void;
}

const QuestionConfigComponent: React.FC<QuestionConfigProps> = ({ 
  onConfigChange, 
  currentLanguage,
  educationSystem,
  onEducationSystemChange
}) => {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  
  // 知识点选项
  const knowledgePointOptions = [
    { id: 'basic_arithmetic', label: getTranslation('basicArithmetic', currentLanguage) },
    { id: 'carry_addition', label: getTranslation('carryAddition', currentLanguage) },
    { id: 'borrow_subtraction', label: getTranslation('borrowSubtraction', currentLanguage) },
    { id: 'multiplication_table', label: getTranslation('multiplicationTable', currentLanguage) },
    { id: 'division_concept', label: getTranslation('divisionConcept', currentLanguage) },
    { id: 'fraction_operation', label: getTranslation('fractionOperation', currentLanguage) },
    { id: 'decimal_operation', label: getTranslation('decimalOperation', currentLanguage) },
    { id: 'percentage_calculation', label: getTranslation('percentageCalculation', currentLanguage) },
    { id: 'geometry_basics', label: getTranslation('geometryBasics', currentLanguage) },
    { id: 'measurement_units', label: getTranslation('measurementUnits', currentLanguage) },
    { id: 'time_calculation', label: getTranslation('timeCalculation', currentLanguage) },
    { id: 'money_calculation', label: getTranslation('moneyCalculation', currentLanguage) },
    { id: 'word_problems', label: getTranslation('wordProblems', currentLanguage) },
    { id: 'pattern_recognition', label: getTranslation('patternRecognition', currentLanguage) },
    { id: 'algebra_basics', label: getTranslation('algebraBasics', currentLanguage) },
    { id: 'comparison', label: getTranslation('comparison', currentLanguage) },
    { id: 'place_value', label: getTranslation('placeValue', currentLanguage) },
    { id: 'estimation', label: getTranslation('estimation', currentLanguage) },
    { id: 'mental_math', label: getTranslation('mentalMath', currentLanguage) },
    { id: 'data_analysis', label: getTranslation('dataAnalysis', currentLanguage) }
  ];
  
  // 运算类型选项
  const operationTypeOptions = [
    { id: 'addition', label: getTranslation('addition', currentLanguage) },
    { id: 'subtraction', label: getTranslation('subtraction', currentLanguage) },
    { id: 'multiplication', label: getTranslation('multiplication', currentLanguage) },
    { id: 'division', label: getTranslation('division', currentLanguage) },
    { id: 'mixed_operations', label: getTranslation('mixedOperations', currentLanguage) },
    { id: 'percentage', label: getTranslation('percentage', currentLanguage) },
    { id: 'square_root', label: getTranslation('squareRoot', currentLanguage) },
    { id: 'power', label: getTranslation('power', currentLanguage) }
  ];
  
  // 年级选项（移除，改为在快速开始模式中设置）
  // const gradeOptions = [
  //   { value: '1', label: getTranslation('grade1', currentLanguage) },
  //   { value: '2', label: getTranslation('grade2', currentLanguage) },
  //   { value: '3', label: getTranslation('grade3', currentLanguage) },
  //   { value: '4', label: getTranslation('grade4', currentLanguage) },
  //   { value: '5', label: getTranslation('grade5', currentLanguage) },
  //   { value: '6', label: getTranslation('grade6', currentLanguage) }
  // ];

  // 教育体系选项
  const educationSystemOptions = [
    { value: 'domestic', label: getTranslation('domesticSystem', currentLanguage) },
    { value: 'international', label: getTranslation('internationalSystem', currentLanguage) }
  ];
  
  useEffect(() => {
    const savedConfig = loadConfigFromStorage();
    if (savedConfig) {
      setConfig(savedConfig);
      onConfigChange(savedConfig);
    }
  }, [onConfigChange]);
  
  const handleDigitRangeChange = (value: [number, number]) => {
    const newConfig = { ...config, digitRange: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  const handleOperationTypeChange = (operationId: string) => {
    const newOperationTypes = config.operationTypes.includes(operationId)
      ? config.operationTypes.filter(id => id !== operationId)
      : [...config.operationTypes, operationId];
      
    const newConfig = { ...config, operationTypes: newOperationTypes };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  const handleKnowledgePointChange = (pointId: string) => {
    const newKnowledgePoints = config.knowledgePoints.includes(pointId)
      ? config.knowledgePoints.filter(id => id !== pointId)
      : [...config.knowledgePoints, pointId];
      
    const newConfig = { ...config, knowledgePoints: newKnowledgePoints };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  const handleQuestionCountChange = (value: number) => {
    const newConfig = { ...config, questionCount: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  // 保留接口兼容性，但已迁移到快速开始模式
  // const handleGradeLevelChange = (value: string) => {
  //   const gradeLevel = parseInt(value);
  //   const newConfig = { ...config, gradeLevel };
  //   setConfig(newConfig);
  //   onConfigChange(newConfig);
  //   saveConfigToStorage(newConfig);
  // };
  
  const handleIncludeDecimalsChange = (checked: boolean) => {
    const newConfig = { ...config, includeDecimals: checked };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };

  const handleIncludeFractionsChange = (checked: boolean) => {
    const newConfig = { ...config, includeFractions: checked };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  const handleDecimalPlacesChange = (value: number) => {
    const newConfig = { ...config, decimalPlaces: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  const handleFractionQuestionCountChange = (value: number) => {
    const newConfig = { ...config, fractionQuestionCount: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    saveConfigToStorage(newConfig);
  };
  
  // TODO: 将来实现重置功能
  // const handleResetConfig = () => {
  //   // TODO: 实现重置配置功能
  // };

  const handleEducationSystemChange = (value: string) => {
    const system = value as 'domestic' | 'international';
    onEducationSystemChange(system);
    
    // 如果切换到国际教育体系，自动调整配置
    if (system === 'international') {
      // 确保数字范围至少是3位数
      const newDigitRange: [number, number] = [
        Math.max(config.digitRange[0], 3),
        Math.max(config.digitRange[1], 3)
      ];
      
      // 默认开启小数
      const newConfig = { 
        ...config, 
        digitRange: newDigitRange,
        includeDecimals: true,
        educationSystem: system
      };
      
      setConfig(newConfig);
      onConfigChange(newConfig);
      saveConfigToStorage(newConfig);
    } else {
      // 切换到国内教育体系
      const newConfig = { ...config, educationSystem: system };
      setConfig(newConfig);
      onConfigChange(newConfig);
      saveConfigToStorage(newConfig);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTranslation('questionSettings', currentLanguage)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 教育体系选择 */}
        <div className="space-y-2">
          <Label>{getTranslation('educationSystem', currentLanguage)}</Label>
          <Select value={educationSystem} onValueChange={handleEducationSystemChange}>
            <SelectTrigger>
              <SelectValue placeholder={getTranslation('selectEducationSystem', currentLanguage)} />
            </SelectTrigger>
            <SelectContent>
              {educationSystemOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        {/* 数字位数范围 */}
        <div className="space-y-2">
          <Label>
            {getTranslation('digitRange', currentLanguage)}: {config.digitRange[0]} - {config.digitRange[1]} {getTranslation('digits', currentLanguage)}
          </Label>
          <Slider
            value={config.digitRange}
            onValueChange={(value) => handleDigitRangeChange(value as [number, number])}
            min={1}
            max={6}
            step={1}
            minStepsBetweenThumbs={0}
          />
        </div>
        
        <Separator />
        
        {/* 年级选择已移至快速开始模式 */}
        {/* <div className="space-y-2">
          <Label>{getTranslation('gradeLevel', currentLanguage)}</Label>
          <Select value={config.gradeLevel.toString()} onValueChange={handleGradeLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder={getTranslation('selectGrade', currentLanguage)} />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>{currentLanguage === 'zh-CN' ? '提示' : 'Note'}:</strong>{' '}
            {currentLanguage === 'zh-CN' 
              ? '年级选择已移至"快速开始"模式，此处为专业自定义配置。'
              : 'Grade selection has been moved to "Quick Start" mode. This is for professional custom configuration.'}
          </p>
        </div>
        
        <Separator />
        
        {/* 运算类型 */}
        <div className="space-y-2">
          <Label>{getTranslation('operationTypes', currentLanguage)}</Label>
          <div className="flex flex-wrap gap-2">
            {operationTypeOptions.map(option => (
              <Badge 
                key={option.id}
                variant={config.operationTypes.includes(option.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleOperationTypeChange(option.id)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* 知识点 */}
        <div className="space-y-2">
          <Label>{getTranslation('knowledgePoints', currentLanguage)}</Label>
          <div className="flex flex-wrap gap-2">
            {knowledgePointOptions.map(option => (
              <Badge 
                key={option.id}
                variant={config.knowledgePoints.includes(option.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleKnowledgePointChange(option.id)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <Separator />
          
          {/* 小数支持 */}
          <div className="flex items-center justify-between">
            <Label>{getTranslation('includeDecimals', currentLanguage)}</Label>
            <Switch
              checked={config.includeDecimals}
              onCheckedChange={handleIncludeDecimalsChange}
            />
          </div>
          
          {/* 小数位数设置 */}
          {config.includeDecimals && (
            <div className="flex items-center justify-between gap-4">
              <Label>{getTranslation('decimalPlaces', currentLanguage)}</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={config.decimalPlaces || 2}
                onChange={(e) => handleDecimalPlacesChange(parseInt(e.target.value) || 2)}
                className="w-20"
              />
            </div>
          )}
          
          <Separator />
          
          {/* 分数支持 */}
          <div className="flex items-center justify-between">
            <Label>{getTranslation('includeFractions', currentLanguage)}</Label>
            <Switch
              checked={config.includeFractions}
              onCheckedChange={handleIncludeFractionsChange}
            />
          </div>
          
          {/* 分数题目数量设置 */}
          {config.includeFractions && (
            <div className="flex items-center justify-between gap-4">
              <Label>{getTranslation('fractionQuestionCount', currentLanguage)}</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={config.fractionQuestionCount || 5}
                onChange={(e) => handleFractionQuestionCountChange(parseInt(e.target.value) || 5)}
                className="w-20"
              />
            </div>
          )}
        
        <Separator />
        
        {/* 题目数量 */}
        <div className="space-y-2">
          <Label>
            {getTranslation('questionCount', currentLanguage)}: {config.questionCount}
          </Label>
          <Slider
            value={[config.questionCount]}
            onValueChange={(value) => handleQuestionCountChange(value[0])}
            min={5}
            max={50}
            step={1}
          />
        </div>
        
        <Separator />
        
        {/* 自动验证答案 */}
        <div className="flex items-center justify-between">
          <Label>{currentLanguage === 'zh-CN' ? '自动验证答案' : 'Auto Verify Answers'}</Label>
          <Switch
            checked={config.autoVerifyAnswers || false}
            onCheckedChange={(checked) => {
              const newConfig = { ...config, autoVerifyAnswers: checked };
              setConfig(newConfig);
              onConfigChange(newConfig);
              saveConfigToStorage(newConfig);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionConfigComponent;