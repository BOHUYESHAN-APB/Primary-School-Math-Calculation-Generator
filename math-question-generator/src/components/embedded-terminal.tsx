import { useState, useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  id: string;
  name: string;
  shell?: string;
  cwd?: string;
  onReady?: (id: string) => void;
  onError?: (error: string) => void;
}

// 全局 electronAPI 类型集中于 [electron-api.d.ts](math-question-generator/src/types/electron-api.d.ts)，移除重复声明

export function EmbeddedTerminal({ id, name, shell, cwd, onReady, onError }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const terminalId = useRef<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // 初始化终端
    const initTerminal = async () => {
      try {
        // 清理之前的终端实例
        if (terminalInstance.current) {
          terminalInstance.current.dispose();
          terminalInstance.current = null;
        }
        
        // 创建XTerm实例
        terminalInstance.current = new XTerm({
          cursorBlink: true,
          fontSize: 14,
          theme: {
            background: '#000000',
            foreground: '#ffffff',
          },
        });

        // 添加fit插件
        fitAddon.current = new FitAddon();
        terminalInstance.current.loadAddon(fitAddon.current);

        // 打开终端
        if (terminalRef.current) {
          terminalInstance.current.open(terminalRef.current);
        }

        // 适配容器大小
        if (fitAddon.current) {
          fitAddon.current.fit();
        }

        // 监听终端输入
        terminalInstance.current.onData((data) => {
          if (terminalId.current && window.electronAPI) {
            window.electronAPI.writeTerminal(terminalId.current, data);
          }
        });

        // 检查electronAPI是否存在
        if (!window.electronAPI) {
          throw new Error('Electron API not available');
        }

        // 创建PTY终端进程
        const result = await window.electronAPI.createTerminal({
          shell,
          cwd,
          cols: terminalInstance.current.cols,
          rows: terminalInstance.current.rows,
        });
 
        if (result.success) {
          terminalId.current = result.id ?? null;
          setIsLoading(false);
          setError(null);
          if (onReady && result.id) onReady(result.id);
        } else {
          throw new Error(result.error || 'Failed to create terminal');
        }
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        setIsLoading(false);
        setError(error instanceof Error ? error.message : String(error));
        if (onError) onError(error instanceof Error ? error.message : String(error));
      }
    };

    initTerminal();

    // 监听窗口大小变化
    const handleResize = () => {
      if (fitAddon.current && terminalInstance.current) {
        try {
          fitAddon.current.fit();
          if (terminalId.current && window.electronAPI && window.electronAPI.resizeTerminal) {
            window.electronAPI.resizeTerminal(
              terminalId.current,
              terminalInstance.current.cols,
              terminalInstance.current.rows
            );
          }
        } catch (error) {
          console.error('Failed to resize terminal:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // 监听终端数据
    const handleTerminalData = (_event: unknown, data: { id: string; data: string }) => {
      if (data.id === terminalId.current && terminalInstance.current) {
        terminalInstance.current.write(data.data);
      }
    };

    // 监听终端退出
    const handleTerminalExit = (_event: unknown, data: { id: string; exitCode: number }) => {
      if (data.id === terminalId.current) {
        if (terminalInstance.current) {
          terminalInstance.current.write(`\r\n[Process exited with code ${data.exitCode}]\r\n`);
        }
      }
    };

    if (window.electronAPI) {
      window.electronAPI.onTerminalData(handleTerminalData);
      window.electronAPI.onTerminalExit(handleTerminalExit);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('terminal:data');
        window.electronAPI.removeAllListeners('terminal:exit');
      }
      
      // 清理终端资源
      if (terminalId.current && window.electronAPI) {
        window.electronAPI.killTerminal(terminalId.current);
      }
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };
  }, [id, shell, cwd, onReady, onError]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 font-mono text-sm">{name}</span>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-1 bg-black overflow-hidden"
        style={{ minHeight: '200px' }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white">正在启动终端...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-red-400 text-center p-4">
            <div className="font-bold mb-2">终端启动失败</div>
            <div className="text-sm">{error}</div>
            <div className="text-xs mt-2">请检查相关服务是否正常运行</div>
          </div>
        </div>
      )}
    </div>
  );
}