import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Minus, X, Maximize2, Minimize2 } from 'lucide-react';

interface TitleBarProps {
  title?: string;
}

export function TitleBar({ title = "数字芽算（MathBud）" }: TitleBarProps) {
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

// 类型定义扩展
declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      unmaximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
    };
  }
}