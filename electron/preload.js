const { contextBridge, ipcRenderer } = require('electron');

// 诊断：预加载阶段全局监听菜单相关通道，记录是否有来自主进程的提前发送
const __DIAG_MENU_CHANNELS = ['menu-new-questions', 'menu-export-pdf', 'menu-about', 'menu-open-settings'];
__DIAG_MENU_CHANNELS.forEach((ch) => {
  try {
    ipcRenderer.on(ch, (event, ...args) => {
      try { console.log('PRELOAD: global listener received channel', ch, args); } catch(e){}
    });
  } catch(e){}
});

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
  onMCPServerPid: (callback) => ipcRenderer.on('mcp-server:pid', callback),
  // 获取 MCP 服务器运行状态与日志
  getMCPServerStatus: () => ipcRenderer.invoke('mcp-server:status'),
  getMCPServerLogs: () => ipcRenderer.invoke('mcp-server:logs'),
  
  // 监听菜单事件（callback 第一个参数为 action string）
  // 返回一个 unsubscribe 函数以便前端可以单独移除该回调，避免全局 removeAllListeners 带来的竞态或误删
  onMenuAction: (callback) => {
    console.log('PRELOAD: onMenuAction registered');
    const channels = ['menu-new-questions', 'menu-export-pdf', 'menu-about', 'menu-open-settings'];
    const registeredHandlers = [];
    channels.forEach((ch) => {
      const handler = (_event, ...args) => {
        try { console.log('PRELOAD: received menu channel', ch, args); } catch (e) {}
        try {
          callback(ch, ...args);
        } catch (e) {
          // swallow callback errors to avoid breaking IPC bridge
        }
      };
      ipcRenderer.on(ch, handler);
      registeredHandlers.push({ ch, handler });
    });

    // 请求主进程发送一次测试菜单事件（确保在注册完监听器后能收到）
    try {
      ipcRenderer.invoke('menu-test-request').catch(() => {});
    } catch (e) {
      // ignore
    }

    // 返回 unsubscribe，前端可在组件卸载时调用
    return () => {
      try {
        registeredHandlers.forEach(({ ch, handler }) => {
          try { ipcRenderer.removeListener(ch, handler); } catch (e) {}
        });
      } catch (e) {
        // ignore
      }
    };
  },
  
  // 移除监听器
  // 如果传入 channel，则仅移除该 channel 的所有监听器；不传则移除所有通道监听（慎用）
  removeAllListeners: (channel) => {
    try {
      if (channel) {
        ipcRenderer.removeAllListeners(channel);
      } else {
        ipcRenderer.removeAllListeners();
      }
    } catch (e) {
      // ignore
    }
  },
  
  // 平台检测
  platform: process.platform,
  
  // 是否为Electron环境
  isElectron: true
});