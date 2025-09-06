const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 显示文件在文件夹中
  showItemInFolder: (fullPath) => ipcRenderer.invoke('show-item-in-folder', fullPath),
  
  // 窗口控制方法
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  unmaximize: () => ipcRenderer.invoke('window-unmaximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // 终端相关方法
  createTerminal: (options) => ipcRenderer.invoke('terminal:create', options),
  writeTerminal: (id, data) => ipcRenderer.invoke('terminal:write', id, data),
  killTerminal: (id) => ipcRenderer.invoke('terminal:kill', id),
  onTerminalData: (callback) => ipcRenderer.on('terminal:data', callback),
  onTerminalExit: (callback) => ipcRenderer.on('terminal:exit', callback),
  
  // MCP服务器管理方法
  startMCPServer: () => ipcRenderer.invoke('mcp-server:start'),
  stopMCPServer: () => ipcRenderer.invoke('mcp-server:stop'),
  onMCPServerOutput: (callback) => ipcRenderer.on('mcp-server:output', callback),
  onMCPServerExit: (callback) => ipcRenderer.on('mcp-server:exit', callback),
  
  // 监听菜单事件
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-questions', callback);
    ipcRenderer.on('menu-export-pdf', callback);
    ipcRenderer.on('menu-about', callback);
  },
  
  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // 平台检测
  platform: process.platform,
  
  // 是否为Electron环境
  isElectron: true
});