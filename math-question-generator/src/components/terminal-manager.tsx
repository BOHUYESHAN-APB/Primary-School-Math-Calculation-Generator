import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Terminal, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { EmbeddedTerminal } from './embedded-terminal';

interface TerminalStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  port: number;
  pid?: number;
  lastUpdate: Date;
}

export function TerminalManager({ language }: { language: string }) {
  const [terminals, setTerminals] = useState<TerminalStatus[]>([
    {
      id: 'mcp-server',
      name: language === 'zh-CN' ? '🔢 MCP服务器' : '🔢 MCP Server',
      status: 'stopped',
      port: 8002,
      lastUpdate: new Date()
    },
    {
      id: 'electron-app',
      name: language === 'zh-CN' ? '🖥️ 应用主程序' : '🖥️ Application Main',
      status: 'stopped',
      port: 0, // Electron应用不使用固定端口
      lastUpdate: new Date()
    }
  ]);

  const [visibleTerminals, setVisibleTerminals] = useState<Record<string, boolean>>({});

  const texts = {
    'zh-CN': {
      title: '终端管理',
      description: '查看和管理应用程序的后台终端进程',
      mcpServer: 'MCP服务器',
      electronApp: '应用主程序',
      statusRunning: '运行中',
      statusStopped: '已停止',
      statusStarting: '启动中',
      statusStopping: '停止中',
      statusError: '错误',
      start: '启动',
      stop: '停止',
      restart: '重启',
      refresh: '刷新状态',
      port: '端口',
      pid: '进程ID',
      lastUpdate: '最后更新',
      noPid: '无进程ID',
      showTerminal: '显示终端',
      hideTerminal: '隐藏终端',
      terminalNotSupported: '当前环境不支持终端功能',
      terminalView: '终端视图',
      closeTerminal: '关闭终端'
    },
    'en-US': {
      title: 'Terminal Management',
      description: 'View and manage background terminal processes of the application',
      mcpServer: 'MCP Server',
      electronApp: 'Application Main',
      statusRunning: 'Running',
      statusStopped: 'Stopped',
      statusStarting: 'Starting',
      statusStopping: 'Stopping',
      statusError: 'Error',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      refresh: 'Refresh Status',
      port: 'Port',
      pid: 'Process ID',
      lastUpdate: 'Last Update',
      noPid: 'No Process ID',
      showTerminal: 'Show Terminal',
      hideTerminal: 'Hide Terminal',
      terminalNotSupported: 'Terminal functionality not supported in current environment',
      terminalView: 'Terminal View',
      closeTerminal: 'Close Terminal'
    }
  };

  const t = texts[language as keyof typeof texts] || texts['zh-CN'];

  // 检查终端状态
  const checkTerminalStatus = async () => {
    // 在实际应用中，这里会检查真实的进程状态
    // 目前我们只是模拟状态更新
    setTerminals(prev => prev.map(terminal => ({
      ...terminal,
      lastUpdate: new Date()
    })));
  };

  // 启动终端
  const startTerminal = (id: string) => {
    setTerminals(prev => prev.map(terminal => 
      terminal.id === id 
        ? { ...terminal, status: 'starting' } 
        : terminal
    ));

    // 模拟启动过程
    setTimeout(() => {
      setTerminals(prev => prev.map(terminal => 
        terminal.id === id 
          ? { ...terminal, status: 'running', pid: Math.floor(Math.random() * 10000) + 1000 } 
          : terminal
      ));
      
      // 启动后自动显示终端
      setVisibleTerminals(prev => ({
        ...prev,
        [id]: true
      }));
    }, 1000);
  };

  // 停止终端
  const stopTerminal = (id: string) => {
    setTerminals(prev => prev.map(terminal => 
      terminal.id === id 
        ? { ...terminal, status: 'stopping' } 
        : terminal
    ));

    // 模拟停止过程
    setTimeout(() => {
      setTerminals(prev => prev.map(terminal => 
        terminal.id === id 
          ? { ...terminal, status: 'stopped', pid: undefined } 
          : terminal
      ));
      
      // 停止后自动隐藏终端
      setVisibleTerminals(prev => ({
        ...prev,
        [id]: false
      }));
    }, 1000);
  };

  // 重启终端
  const restartTerminal = (id: string) => {
    stopTerminal(id);
    setTimeout(() => startTerminal(id), 1500);
  };

  // 切换终端显示状态
  const toggleTerminalVisibility = (id: string) => {
    setVisibleTerminals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 关闭终端视图
  const closeTerminalView = (id: string) => {
    setVisibleTerminals(prev => ({
      ...prev,
      [id]: false
    }));
  };

  // 获取状态图标
  const getStatusIcon = (status: TerminalStatus['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'starting':
      case 'stopping':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: TerminalStatus['status']) => {
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
          <Terminal className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {t.description}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {language === 'zh-CN' 
              ? '注意：终端管理功能现在支持在应用内部直接嵌入终端窗口。' 
              : 'Note: Terminal management functionality now supports embedding terminal windows directly within the application.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {terminals.map((terminal) => (
            <div 
              key={terminal.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(terminal.status)}
                <div>
                  <div className="font-medium">{terminal.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{t.port}: {terminal.port || 'N/A'}</span>
                    {terminal.pid && (
                      <>
                        <span>•</span>
                        <span>{t.pid}: {terminal.pid}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground mr-2">
                  {getStatusText(terminal.status)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startTerminal(terminal.id)}
                  disabled={terminal.status === 'running' || terminal.status === 'starting'}
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => stopTerminal(terminal.id)}
                  disabled={terminal.status === 'stopped' || terminal.status === 'stopping'}
                >
                  <Square className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restartTerminal(terminal.id)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTerminalVisibility(terminal.id)}
                >
                  {visibleTerminals[terminal.id] ? t.hideTerminal : t.showTerminal}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 独立显示每个终端 */}
        {terminals.map((terminal) => (
          visibleTerminals[terminal.id] && (
            <div key={`terminal-${terminal.id}`} className="mt-4 border rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono text-sm">{t.terminalView}: {terminal.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-700"
                  onClick={() => closeTerminalView(terminal.id)}
                >
                  {t.closeTerminal}
                </Button>
              </div>
              <div className="h-64">
                <EmbeddedTerminal 
                  id={`${terminal.id}-terminal`}
                  name={terminal.name}
                  cwd={terminal.id === 'mcp-server' ? './mcp-server' : undefined}
                />
              </div>
            </div>
          )
        ))}

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={checkTerminalStatus}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t.refresh}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}