import { useState, useEffect } from 'react';
import { MathQuestionGenerator, GeneratorConfig, DEFAULT_CONFIG } from './lib/math-generator';
import QuestionConfigComponent from './components/question-config';
import QuestionConfigMobile from './components/question-config-mobile';
import QuickStart from './components/quick-start';
import QuestionPreview from './components/question-preview';
import { LanguageSelector } from './components/language-selector';
import { SettingsPage } from './components/settings-page';
import { AboutPage } from './components/about-page';
import { LicensesPage } from './components/licenses-page';
import { TitleBar } from './components/title-bar';
import { saveConfigToStorage, loadConfigFromStorage } from './lib/storage';
import { loadLanguageFromStorage, saveLanguageToStorage, detectBrowserLanguage } from './lib/i18n';
import { exportToHTML, exportToPDF } from './lib/export';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Download, RotateCcw, Zap, Settings, Home, Info, Scale } from 'lucide-react';
import { useMediaQuery } from './components/ui/use-media-query';

function App() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [currentLanguage, setCurrentLanguage] = useState<string>('zh-CN');
  const [educationSystem, setEducationSystem] = useState<'domestic' | 'international'>('domestic');
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(false);
  const [isQuickStartMode, setIsQuickStartMode] = useState<boolean>(true); // 默认快速开始模式
  const [currentPage, setCurrentPage] = useState<'generator' | 'settings' | 'about' | 'licenses'>('generator');
  const [theme, setTheme] = useState<string>('system');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // 加载保存的语言或检测浏览器语言
    const savedLanguage = loadLanguageFromStorage();
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      const browserLanguage = detectBrowserLanguage();
      setCurrentLanguage(browserLanguage);
    }

    // 加载保存的主题设置
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // 加载保存的配置
    const savedConfig = loadConfigFromStorage();
    if (savedConfig) {
      setConfig(savedConfig);
      setEducationSystem(savedConfig.educationSystem || 'domestic');
    }
  }, []);

  const handleConfigChange = (newConfig: GeneratorConfig) => {
    setConfig(newConfig);
  };

  const handleEducationSystemChange = (system: 'domestic' | 'international') => {
    setEducationSystem(system);
    
    // 更新配置中的教育体系
    const updatedConfig = { ...config, educationSystem: system };
    setConfig(updatedConfig);
    saveConfigToStorage(updatedConfig);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    saveLanguageToStorage(language);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const generateQuestions = () => {
    generateQuestionsWithConfig();
  };

  const handleExportToHTML = () => {
    exportToHTML(questions, currentLanguage, includeSolutions);
  };

  const handleExportToPDF = async () => {
    try {
      await exportToPDF(questions, currentLanguage, includeSolutions);
    } catch (error) {
      console.error('PDF导出失败:', error);
      // 这里可以添加用户友好的错误提示
      alert(currentLanguage === 'zh-CN' ? 'PDF导出失败，请重试' : 'Failed to export PDF, please try again');
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setEducationSystem('domestic');
    saveConfigToStorage(DEFAULT_CONFIG);
  };

  const handleQuickStartConfig = (presetConfig: GeneratorConfig) => {
    setConfig(presetConfig);
    setEducationSystem(presetConfig.educationSystem || 'domestic');
    saveConfigToStorage(presetConfig);
    // 自动生成题目
    setTimeout(() => {
      generateQuestionsWithConfig(presetConfig);
    }, 100);
  };

  const generateQuestionsWithConfig = (configToUse: GeneratorConfig = config) => {
    console.log('开始生成题目，当前配置:', configToUse);
    // 添加自动验证选项到配置
    const configWithAutoVerify = {
      ...configToUse,
      autoVerifyAnswers: configToUse.autoVerifyAnswers || false
    };
    const generator = new MathQuestionGenerator(configWithAutoVerify);
    const generatedQuestions = generator.generateQuestions();
    console.log('生成的题目:', generatedQuestions);
    setQuestions(generatedQuestions);
  };

  return (
    // 优化整体布局，减少内边距
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 自定义标题栏（仅在 Electron 中显示） */}
      <TitleBar title={`数字芽算（MathBud） - ${currentPage === 'generator' ? '题目生成' : currentPage === 'settings' ? '设置' : currentPage === 'about' ? '关于' : '开源协议'}`} />
      
      {/* 减少内边距，使界面更紧凑 */}
      <div className="flex-1 p-2 sm:p-3 lg:p-4">
        <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          <div className="flex flex-col space-y-3">
            {/* 主标题行 - 减少间距 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
                {currentLanguage === 'zh-CN' ? '小学数学计算题生成器' : 'Primary School Math Question Generator'}
              </h1>
              {/* 语言选择器 - 移动端在标题下方，桌面端在右侧 */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <LanguageSelector 
                  currentLanguage={currentLanguage} 
                  onLanguageChange={handleLanguageChange} 
                />
              </div>
            </div>

            {/* 导航菜单 - 更紧凑的设计 */}
            <nav className="border-b border-gray-200 pb-2">
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={currentPage === 'generator' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage('generator')}
                  className="flex items-center gap-1 h-8 px-2 text-xs sm:text-sm"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{currentLanguage === 'zh-CN' ? '题目生成' : 'Generator'}</span>
                </Button>
                
                <Button
                  variant={currentPage === 'settings' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage('settings')}
                  className="flex items-center gap-1 h-8 px-2 text-xs sm:text-sm"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{currentLanguage === 'zh-CN' ? '设置' : 'Settings'}</span>
                </Button>
                
                <Button
                  variant={currentPage === 'about' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage('about')}
                  className="flex items-center gap-1 h-8 px-2 text-xs sm:text-sm"
                >
                  <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{currentLanguage === 'zh-CN' ? '关于' : 'About'}</span>
                </Button>
                
                <Button
                  variant={currentPage === 'licenses' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage('licenses')}
                  className="flex items-center gap-1 h-8 px-2 text-xs sm:text-sm"
                >
                  <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{currentLanguage === 'zh-CN' ? '开源协议' : 'Licenses'}</span>
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* 根据当前页面显示不同内容 */}
        {currentPage === 'generator' && (
          // 优化网格布局间距
          <main className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
            <div className="space-y-3">
              {/* 模式切换和配置区域 - 合并到一个卡片中 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex gap-1">
                    <Button 
                      variant={isQuickStartMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsQuickStartMode(true)}
                      className="flex-1 h-8 px-2"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      <span className="hidden xs:inline">{currentLanguage === 'zh-CN' ? '快速开始' : 'Quick Start'}</span>
                    </Button>
                    <Button 
                      variant={!isQuickStartMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsQuickStartMode(false)}
                      className="flex-1 h-8 px-2"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      <span className="hidden xs:inline">{currentLanguage === 'zh-CN' ? '自定义设置' : 'Custom Settings'}</span>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* 根据模式显示不同的配置界面 */}
                  {isQuickStartMode ? (
                    <QuickStart
                      onConfigSelect={handleQuickStartConfig}
                      onCustomMode={() => setIsQuickStartMode(false)}
                      currentLanguage={currentLanguage}
                    />
                  ) : (
                    <div className="space-y-3">
                      {isMobile ? (
                        <QuestionConfigMobile 
                          onConfigChange={handleConfigChange}
                          currentLanguage={currentLanguage}
                          educationSystem={educationSystem}
                          onEducationSystemChange={handleEducationSystemChange}
                        />
                      ) : (
                        <QuestionConfigComponent 
                          onConfigChange={handleConfigChange}
                          currentLanguage={currentLanguage}
                          educationSystem={educationSystem}
                          onEducationSystemChange={handleEducationSystemChange}
                        />
                      )}
                      
                      {/* 操作按钮 - 紧凑布局 */}
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                        <Button onClick={generateQuestions} size="sm" className="h-8 px-3 text-sm">
                          <Zap className="w-3 h-3 mr-1" />
                          {currentLanguage === 'zh-CN' ? '生成题目' : 'Generate'}
                        </Button>
                        <Button variant="outline" onClick={resetConfig} size="sm" className="h-8 px-2 text-sm">
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        
                        <div className="flex items-center space-x-2 ml-auto">
                          <input
                            type="checkbox"
                            id="autoVerify"
                            checked={config.autoVerifyAnswers || false}
                            onChange={(e) => {
                              const updatedConfig = { ...config, autoVerifyAnswers: e.target.checked };
                              setConfig(updatedConfig);
                              saveConfigToStorage(updatedConfig);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <label htmlFor="autoVerify" className="text-xs text-gray-600">
                            {currentLanguage === 'zh-CN' ? '自动验证' : 'Auto Verify'}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 导出控制 - 仅在有题目时显示 */}
              {questions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {currentLanguage === 'zh-CN' ? '导出选项' : 'Export Options'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includeSolutions"
                          checked={includeSolutions}
                          onChange={(e) => setIncludeSolutions(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <label htmlFor="includeSolutions" className="text-xs font-medium text-gray-700">
                          {currentLanguage === 'zh-CN' ? '包含答案与解析' : 'Include Solutions'}
                        </label>
                      </div>
                      <div className="flex gap-1">
                        <Button onClick={handleExportToHTML} variant="outline" size="sm" className="flex-1 h-8 text-sm">
                          HTML
                        </Button>
                        <Button onClick={handleExportToPDF} variant="outline" size="sm" className="flex-1 h-8 text-sm">
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* 题目预览区域 - 优化高度和滚动 */}
            <div className="xl:max-h-[calc(100vh-10rem)] xl:overflow-auto">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {currentLanguage === 'zh-CN' ? '题目预览' : 'Question Preview'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs defaultValue="questions">
                    <TabsList className="grid w-full grid-cols-2 mb-3">
                      <TabsTrigger value="questions" className="text-xs">
                        {currentLanguage === 'zh-CN' ? '题目' : 'Questions'}
                      </TabsTrigger>
                      <TabsTrigger value="answers" className="text-xs">
                        {currentLanguage === 'zh-CN' ? '答案' : 'Answers'}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="questions" className="mt-0">
                      <QuestionPreview 
                        questions={questions} 
                        showAnswers={false} 
                        currentLanguage={currentLanguage}
                      />
                    </TabsContent>
                    <TabsContent value="answers" className="mt-0">
                      <QuestionPreview 
                        questions={questions} 
                        showAnswers={true} 
                        currentLanguage={currentLanguage}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        )}

        {/* 设置页面 */}
        {currentPage === 'settings' && (
          <SettingsPage 
            language={currentLanguage}
            onLanguageChange={handleLanguageChange}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        )}

        {/* 关于页面 */}
        {currentPage === 'about' && (
          <AboutPage language={currentLanguage} />
        )}

        {/* 许可证页面 */}
        {currentPage === 'licenses' && (
          <LicensesPage language={currentLanguage} />
        )}
        </div>
      </div>
    </div>
  );
}

export default App;