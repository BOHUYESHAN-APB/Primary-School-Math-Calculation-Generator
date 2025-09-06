import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Minus, X, Maximize2, Minimize2, Languages } from 'lucide-react';
import { getSupportedLanguages } from '@/lib/i18n';

interface TitleBarProps {
  title?: string;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export function TitleBar({ 
  title = "数字芽算（MathBud）",
  currentLanguage = 'zh-CN',
  onLanguageChange 
}: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // 检测是否在 Electron 环境中
    setIsElectron(typeof window !== 'undefined' && 'electronAPI' in window);
    
    // 检查初始最大化状态
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
    }
  }, []);

  const handleMinimize = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (isElectron && window.electronAPI) {
      if (isMaximized) {
        window.electronAPI.unmaximize();
      } else {
        window.electronAPI.maximize();
      }
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const handleLanguageToggle = () => {
    if (onLanguageChange) {
      // 获取支持的语言列表
      const supportedLanguages = getSupportedLanguages();
      const currentIndex = supportedLanguages.findIndex(lang => lang.code === currentLanguage);
      const nextIndex = (currentIndex + 1) % supportedLanguages.length;
      const newLanguage = supportedLanguages[nextIndex].code;
      onLanguageChange(newLanguage);
    }
  };

  // 如果不在 Electron 环境中，不显示标题栏
  if (!isElectron) {
    return null;
  }

  return (
    // 修改这里：将整个标题栏设为可拖动区域
    <div className="h-12 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between select-none app-drag-region">
      {/* 左侧：应用标题 - 添加可拖动区域 */}
      <div className="flex items-center gap-3 px-4 min-w-0 flex-1 app-drag-region">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center shadow-sm app-drag-region">
          <span className="text-white text-xs font-bold app-drag-region">数</span>
        </div>
        <span className="text-sm font-medium text-gray-700 truncate app-drag-region">{title}</span>
      </div>

      {/* 中间：语言切换按钮 */}
      <div className="absolute left-1/2 transform -translate-x-1/2 app-no-drag">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100/70 rounded-full transition-colors"
          onClick={handleLanguageToggle}
          title={currentLanguage === 'zh-CN' ? '切换到 English' : 'Switch to 中文'}
        >
          <Languages className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

      {/* 右侧：窗口控制按钮 - 设置为不可拖动 */}
      <div className="flex items-center app-no-drag">
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 hover:bg-gray-100/70 rounded-none border-r border-gray-200/50 transition-colors"
          onClick={handleMinimize}
          title="最小化"
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 hover:bg-gray-100/70 rounded-none border-r border-gray-200/50 transition-colors"
          onClick={handleMaximize}
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <Minimize2 className="h-4 w-4 text-gray-600" />
          ) : (
            <Maximize2 className="h-4 w-4 text-gray-600" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 hover:bg-red-500 hover:text-white rounded-none transition-colors"
          onClick={handleClose}
          title="关闭"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// 全局 window.electronAPI 类型已在统一的 [electron-api.d.ts](math-question-generator/src/types/electron-api.d.ts) 中定义，此处移除重复声明以避免 TS2717 冲突