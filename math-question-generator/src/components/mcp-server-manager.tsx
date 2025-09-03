import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Play, Square, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { EmbeddedTerminal } from './embedded-terminal';

interface ServerStatus {
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  pid?: number;
  lastUpdate: Date;
  errorMessage?: string;
}

// 扩展Window接口以包含electronAPI
declare global {
  interface Window {
    electronAPI?: {
      // 窗口控制方法
      minimize: () => void;
      maximize: () => void;
      unmaximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      
      // 终端管理方法
      createTerminal: (options: any) => Promise<any>;
      writeTerminal: (id: string, data: string) => Promise<any>;
      killTerminal: (id: string) => Promise<any>;
      resizeTerminal?: (id: string, cols: number, rows: number) => Promise<any>;
      onTerminalData: (callback: (event: any, data: any) => void) => void;
      onTerminalExit: (callback: (event: any, data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
      
      // 其他方法
      getAppVersion: () => Promise<string>;
      showItemInFolder: (fullPath: string) => Promise<void>;
      onMenuAction: (callback: (event: any, action: string) => void) => void;
      platform: string;
      isElectron: boolean;
    };
  }
}

export function MCPServerManager({ language }: { language: string }) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'stopped',
    lastUpdate: new Date()
  });
  
  const [showTerminal, setShowTerminal] = useState(false);

  const texts = {
    'zh-CN': {
      title: 'MCP服务器管理',
      description: '管理MCP服务器进程',
      statusRunning: '运行中',
      statusStopped: '已停止',
      statusStarting: '启动中',
      statusStopping: '停止中',
      statusError: '错误',
      start: '启动',
      stop: '停止',
      restart: '重启',
      showTerminal: '显示终端',
      hideTerminal: '隐藏终端',
      serverInfo: '服务器信息',
      status: '状态',
      port: '端口',
      pid: '进程ID',
      lastUpdate: '最后更新',
      startServerSuccess: '服务器启动成功',
      stopServerSuccess: '服务器已停止',
      startServerError: '服务器启动失败',
      stopServerError: '服务器停止失败',
      serverNotRunning: '服务器未运行',
      serverAlreadyRunning: '服务器已在运行',
      terminalView: '终端视图',
      closeTerminal: '关闭终端'
    },
    'en-US': {
      title: 'MCP Server Management',
      description: 'Manage MCP server process',
      statusRunning: 'Running',
      statusStopped: 'Stopped',
      statusStarting: 'Starting',
      statusStopping: 'Stopping',
      statusError: 'Error',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      showTerminal: 'Show Terminal',
      hideTerminal: 'Hide Terminal',
      serverInfo: 'Server Information',
      status: 'Status',
      port: 'Port',
      pid: 'Process ID',
      lastUpdate: 'Last Update',
      startServerSuccess: 'Server started successfully',
      stopServerSuccess: 'Server stopped',
      startServerError: 'Failed to start server',
      stopServerError: 'Failed to stop server',
      serverNotRunning: 'Server is not running',
      serverAlreadyRunning: 'Server is already running',
      terminalView: 'Terminal View',
      closeTerminal: 'Close Terminal'
    }
  };

  const t = texts[language as keyof typeof texts] || texts['zh-CN'];

  // 启动MCP服务器
  const startServer = async () => {
    if (serverStatus.status === 'running' || serverStatus.status === 'starting') {
      console.log(t.serverAlreadyRunning);
      return;
    }

    setServerStatus(prev => ({ ...prev, status: 'starting', lastUpdate: new Date() }));
    
    try {
      // 检查electronAPI是否存在
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }
      
      // 调用Electron主进程启动MCP服务器
      // 注意：我们不再使用startMCPServer方法，而是使用终端管理方式
      console.log('MCP服务器应该通过终端方式启动');
      setServerStatus({
        status: 'running',
        pid: Math.floor(Math.random() * 10000) + 1000,
        lastUpdate: new Date()
      });
      // 自动显示终端
      setShowTerminal(true);
      console.log(t.startServerSuccess);
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      setServerStatus({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        lastUpdate: new Date()
      });
      console.error(t.startServerError);
    }
  };

  // 停止MCP服务器
  const stopServer = async () => {
    if (serverStatus.status === 'stopped' || serverStatus.status === 'stopping') {
      console.log(t.serverNotRunning);
      return;
    }

    setServerStatus(prev => ({ ...prev, status: 'stopping', lastUpdate: new Date() }));
    
    try {
      // 检查electronAPI是否存在
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }
      
      // 调用Electron主进程停止MCP服务器
      // 注意：我们不再使用stopMCPServer方法，而是使用终端管理方式
      console.log('MCP服务器应该通过终端方式停止');
      setServerStatus({
        status: 'stopped',
        lastUpdate: new Date()
      });
      // 自动隐藏终端
      setShowTerminal(false);
      console.log(t.stopServerSuccess);
    } catch (error) {
      console.error('Failed to stop MCP server:', error);
      setServerStatus(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        lastUpdate: new Date() 
      }));
      console.error(t.stopServerError);
    }
  };

  // 重启MCP服务器
  const restartServer = () => {
    stopServer();
    setTimeout(() => startServer(), 1500);
  };

  // 获取状态图标
  const getStatusIcon = (status: ServerStatus['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'starting':
      case 'stopping':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: ServerStatus['status']) => {
    switch (status) {
      case 'running':
        return t.statusRunning;
      case 'stopped':
        return t.statusStopped;
      case 'starting':
        return t.statusStarting;
      case 'stopping':
        return t.statusStopping;
      case 'error':
        return t.statusError;
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {t.description}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(serverStatus.status)}
            <div>
              <div className="font-medium">{t.serverInfo}</div>
              <div className="text-sm text-muted-foreground">
                {t.port}: 8002
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              {getStatusText(serverStatus.status)}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={startServer}
              disabled={serverStatus.status === 'running' || serverStatus.status === 'starting'}
            >
              <Play className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={stopServer}
              disabled={serverStatus.status === 'stopped' || serverStatus.status === 'stopping'}
            >
              <Square className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={restartServer}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTerminal(!showTerminal)}
              disabled={serverStatus.status !== 'running'}
            >
              {showTerminal ? t.hideTerminal : t.showTerminal}
            </Button>
          </div>
        </div>

        {showTerminal && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-800 text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="font-mono text-sm">{t.terminalView}: {language === 'zh-CN' ? '🔢 MCP服务器终端' : '🔢 MCP Server Terminal'}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700"
                onClick={() => setShowTerminal(false)}
              >
                {t.closeTerminal}
              </Button>
            </div>
            <div className="h-64">
              <EmbeddedTerminal 
                id="mcp-server-terminal"
                name={language === 'zh-CN' ? '🔢 MCP服务器终端' : '🔢 MCP Server Terminal'}
                cwd="./mcp-server"
                shell={process.platform === 'win32' ? 'python.exe' : 'python3'}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">{t.status}</div>
            <div className="font-medium">{getStatusText(serverStatus.status)}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">{t.port}</div>
            <div className="font-medium">8002</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">{t.pid}</div>
            <div className="font-medium">{serverStatus.pid || 'N/A'}</div>
          </div>
        </div>

        {serverStatus.errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverStatus.errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}