/* Electron API Window types */
interface TerminalDataEvent { id: string; data: string }
interface TerminalExitEvent { id: string; exitCode: number }

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  unmaximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;

  // 终端相关
  createTerminal: (options?: { shell?: string; cwd?: string; cols?: number; rows?: number }) => Promise<{ success: boolean; id?: string; error?: string }>;
  writeTerminal: (id: string, data: string) => Promise<void>;
  killTerminal: (id: string) => Promise<void>;
  resizeTerminal?: (id: string, cols: number, rows: number) => Promise<void>;
  onTerminalData: (callback: (event: unknown, data: TerminalDataEvent) => void) => void;
  onTerminalExit: (callback: (event: unknown, data: TerminalExitEvent) => void) => void;
  removeAllListeners: (channel: string) => void;

  // MCP 服务器管理
  startMCPServer: () => Promise<{ success: boolean; pid?: number; message?: string; error?: string }>;
  stopMCPServer: () => Promise<{ success: boolean; message?: string; error?: string }>;
  onMCPServerOutput: (callback: (event: unknown, data: { data: string }) => void) => void;
  onMCPServerExit: (callback: (event: unknown, data: { exitCode: number }) => void) => void;
  onMCPServerPid?: (callback: (event: unknown, data: { pid: number }) => void) => void;
  // 状态与日志
  getMCPServerStatus: () => Promise<{ running: boolean; pid?: number; startTime?: number; logFile?: string; status: string; error?: string }>;
  getMCPServerLogs: () => Promise<{ logs: string; error?: string }>;

  // 其他
  getAppVersion: () => Promise<string>;
  showItemInFolder: (fullPath: string) => Promise<void>;
  // 注册菜单回调，返回 unsubscribe 函数供前端在卸载时调用
  onMenuAction: (callback: (action: string, ...args: unknown[]) => void) => () => void;
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};