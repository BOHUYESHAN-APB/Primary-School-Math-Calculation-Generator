import { useState, useEffect } from 'react';
import { ModernMainPage } from './components/modern-main-page';
import { SettingsPage } from './components/settings-page';
import { AboutPage } from './components/about-page';
import { LicensesPage } from './components/licenses-page';
import { TitleBar } from './components/title-bar';
import { Tabs, TabsContent } from './components/ui/tabs';
import { Toaster } from './components/ui/toaster';
import { getTranslation } from './lib/i18n';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('zh-CN');
  const [educationSystem, setEducationSystem] = useState<'domestic' | 'international'>('domestic');
  const [currentPage, setCurrentPage] = useState<'main' | 'settings' | 'server' | 'about' | 'licenses'>('main');
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
 
  // 监听来自原生菜单的操作（例如“设置”菜单）
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.electronAPI?.onMenuAction === 'function') {
      const api = window.electronAPI;
      const handler = (action: string, ..._args: unknown[]) => {
        if (action === 'menu-open-settings') {
          setCurrentPage('settings');
        } else if (action === 'menu-new-questions') {
          setCurrentPage('main');
        } else if (action === 'menu-export-pdf') {
          setCurrentPage('main');
        } else if (action === 'menu-about') {
          setCurrentPage('about');
        } else if (action === 'menu-open-licenses') {
          setCurrentPage('licenses');
        }
      };
      // 预加载现在返回 unsubscribe 函数，按新签名注册并在卸载时调用 unsubscribe 避免 removeAllListeners 的竞态
      type MenuActionFn = (cb: (action: string, ...args: unknown[]) => void) => () => void;
      const onMenuAction = api.onMenuAction as unknown as MenuActionFn;
      let unsubscribe: (() => void) | undefined;
      try {
        unsubscribe = onMenuAction(handler);
      } catch {
        // 在极端情况下回退到旧的 removeAllListeners 方式以保证兼容
        try {
          if (api.removeAllListeners) {
            api.removeAllListeners('menu-new-questions');
            api.removeAllListeners('menu-export-pdf');
            api.removeAllListeners('menu-about');
            api.removeAllListeners('menu-open-settings');
          }
        } catch {
          // ignore
        }
      }
  
      return () => {
        try {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch {
          // ignore
        }
      };
    }
  }, []);
  
  // MCP 服务器健康检查
  useEffect(() => {
    let mounted = true;
    const api = (typeof window !== 'undefined' ? window.electronAPI : undefined) as any;
    const checkServerHealth = async () => {
      if (!api || typeof api.getMCPServerStatus !== 'function') return;
      try {
        const status = await api.getMCPServerStatus();
        if (!mounted) return;
        if (status.running) {
          // 若正在运行，进一步检查 HTTP /health
          try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            const res = await fetch('http://localhost:8002/health', { signal: controller.signal });
            clearTimeout(id);
            if (!mounted) return;
            // 可根据需要更新状态或通知用户（此处仅打印）
            console.log('MCP health check OK', res.status);
          } catch (e) {
            console.warn('MCP health check failed', e);
          }
        } else {
          console.log('MCP not running');
        }
      } catch (e) {
        console.error('Failed to check MCP status', e);
      }
    };
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
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
  function isTabValue(v: string): v is 'main' | 'settings' | 'server' | 'about' | 'licenses' {
    return ['main', 'settings', 'server', 'about', 'licenses'].includes(v);
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

            <TabsContent value="about" className="h-full m-0">
              <AboutPage language={currentLanguage} />
            </TabsContent>

            <TabsContent value="licenses" className="h-full m-0">
              <LicensesPage language={currentLanguage} />
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