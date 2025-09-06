import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Play, Square, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ServerStatus {
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  pid?: number;
  lastUpdate: Date;
  errorMessage?: string;
}

/* 全局类型已在全局类型声明文件中提供，此处不再重复声明，以避免重复合并冲突 */

export function MCPServerManager({ language }: { language: string }) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'stopped',
    lastUpdate: new Date()
  });

  const [showTerminal, setShowTerminal] = useState(false);
  const [serverOutput, setServerOutput] = useState<string[]>([]);

  // 监听主进程输出与退出
  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const outputHandler = (_e: unknown, payload: { data: string }) => {
      if (payload && typeof payload.data === 'string') {
        const line = payload.data;
        setServerOutput(prev => {
          const next = [...prev, line];
          return next.length > 500 ? next.slice(-500) : next;
        });
      }
    };

    const exitHandler = () => {
      setServerStatus(s => ({
        ...s,
        status: 'stopped',
        lastUpdate: new Date()
      }));
    };

    api.onMCPServerOutput?.(outputHandler);
    api.onMCPServerExit?.(exitHandler);

    return () => {
      api?.removeAllListeners?.('mcp-server:output');
      api?.removeAllListeners?.('mcp-server:exit');
    };
  }, []);

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

  // 启动MCP服务器（真实调用 IPC）
  const startServer = async () => {
    if (serverStatus.status === 'running' || serverStatus.status === 'starting') {
      console.log(t.serverAlreadyRunning);
      return;
    }
    const api = window.electronAPI;
    if (!api?.startMCPServer) {
      setServerStatus({
        status: 'error',
        lastUpdate: new Date(),
        errorMessage: 'Electron API 不可用'
      });
      return;
    }

    setServerStatus({ status: 'starting', lastUpdate: new Date() });

    try {
      const res = await api.startMCPServer();
      if (res?.success) {
        setServerStatus({ status: 'running', lastUpdate: new Date() });
        setShowTerminal(true);
      } else {
        setServerStatus({
          status: 'error',
          lastUpdate: new Date(),
          errorMessage: res?.error || t.startServerError
        });
      }
    } catch (e: unknown) {
      setServerStatus({
        status: 'error',
        lastUpdate: new Date(),
        errorMessage: (e as Error).message || t.startServerError
      });
    }
  };

  // 停止MCP服务器（真实调用 IPC）
  const stopServer = async () => {
    if (serverStatus.status === 'stopped' || serverStatus.status === 'stopping') {
      console.log(t.serverNotRunning);
      return;
    }
    const api = window.electronAPI;
    if (!api?.stopMCPServer) {
      setServerStatus({
        status: 'error',
        lastUpdate: new Date(),
        errorMessage: 'Electron API 不可用'
      });
      return;
    }

    setServerStatus({ status: 'stopping', lastUpdate: new Date() });

    try {
      const res = await api.stopMCPServer();
      if (res?.success) {
        setServerStatus({ status: 'stopped', lastUpdate: new Date(), pid: undefined });
        setShowTerminal(false);
      } else {
        setServerStatus({
          status: 'error',
          lastUpdate: new Date(),
          errorMessage: res?.error || t.stopServerError
        });
      }
    } catch (e: unknown) {
      setServerStatus({
        status: 'error',
        lastUpdate: new Date(),
        errorMessage: (e as Error).message || t.stopServerError
      });
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
                <span className="font-mono text-sm">
                  {t.terminalView}: {language === 'zh-CN' ? '🔢 MCP服务器日志' : '🔢 MCP Server Log'}
                </span>
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
            <div className="h-64 bg-black text-white font-mono text-xs p-2 overflow-auto whitespace-pre-wrap">
              {serverOutput.length === 0 ? (
                <div className="text-gray-400">
                  {language === 'zh-CN' ? '暂无输出' : 'No output yet'}
                </div>
              ) : (
                serverOutput.map((line, i) => <div key={i}>{line}</div>)
              )}
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