import { useState, useEffect } from 'react';
import { ModernMainPage } from './components/modern-main-page';
import { SettingsPage } from './components/settings-page';
import { TitleBar } from './components/title-bar';
import { Tabs, TabsContent } from './components/ui/tabs';
import { Toaster } from './components/ui/toaster';
import { getTranslation } from './lib/i18n';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('zh-CN');
  const [educationSystem, setEducationSystem] = useState<'domestic' | 'international'>('domestic');
  const [currentPage, setCurrentPage] = useState<'main' | 'settings' | 'server'>('main');
  const [theme, setTheme] = useState<string>('system');

  useEffect(() => {
    // 加载保存的语言或检测浏览器语言
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      const browserLanguage = navigator.language.includes('zh') ? 'zh-CN' : 'en-US';
      setCurrentLanguage(browserLanguage);
    }

    // 加载保存的主题设置
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
  }, []);

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 修复Tabs onValueChange的类型问题
  function isTabValue(v: string): v is 'main' | 'settings' | 'server' {
    return ['main', 'settings', 'server'].includes(v);
  }
  const handleTabChange = (value: string) => {
    if (isTabValue(value)) {
      setCurrentPage(value);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TitleBar 
        title={getTranslation('appTitle', currentLanguage)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={currentPage} onValueChange={handleTabChange} className="h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <TabsContent value="main" className="h-full m-0">
              <ModernMainPage
                language={currentLanguage}
                educationSystem={educationSystem}
                onEducationSystemChange={setEducationSystem}
                theme={theme}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="h-full m-0">
              <SettingsPage 
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                theme={theme}
                onThemeChange={handleThemeChange}
              />
            </TabsContent>
            
            <TabsContent value="server" className="h-full m-0">
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-2xl font-bold mb-6">服务器管理</h1>
                  <p className="text-gray-600">服务器管理功能将在后续版本中实现。</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;