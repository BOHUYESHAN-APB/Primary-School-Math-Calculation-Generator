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