const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// 保持对窗口对象的全局引用
let mainWindow;
// 终端进程管理
const terminals = new Map();

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden', // 隐藏默认标题栏
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#000000',
      height: 40
    },
    frame: false, // 隐藏窗口边框
    show: false,
    backgroundColor: '#ffffff', // 设置背景色
    vibrancy: 'under-window', // macOS 毛玉效果
    transparent: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true
  });

  // 设置安全策略以避免安全警告
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' localhost:* 127.0.0.1:*"
        ]
      }
    });
  });

  // 加载应用
  const isDev = process.env.NODE_ENV === 'development';
  
  // 检测应用加载路径
  let appPath;
  if (isDev) {
    // 开发模式：使用开发服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：尝试多个可能的路径
    const possiblePaths = [
      path.join(__dirname, 'index.html'), // 当前目录（独立运行模式）
      path.join(__dirname, '../math-question-generator/dist/index.html'), // 项目结构模式
      path.join(process.resourcesPath, 'app/index.html') // 打包后模式
    ];
    
    for (const testPath of possiblePaths) {
      if (require('fs').existsSync(testPath)) {
        appPath = testPath;
        break;
      }
    }
    
    if (appPath) {
      console.log('✅ 加载应用:', appPath);
      mainWindow.loadFile(appPath);
    } else {
      console.error('❌ 找不到应用文件');
      // 创建错误页面
      mainWindow.loadURL('data:text/html,<h1>应用文件未找到</h1><p>请检查应用构建是否完成</p>');
    }
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 用户需要手动运行 "启动MCP服务器.bat" 来启动服务器
    console.log('ℹ️ 请手动运行"启动MCP服务器.bat"来启动AI服务');
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
    // 停止所有终端进程
    terminals.forEach((ptyProcess, id) => {
      try {
        if (ptyProcess && typeof ptyProcess.kill === 'function') {
          ptyProcess.kill();
        }
      } catch (e) {
        console.error(`Failed to kill terminal ${id}:`, e);
      }
    });
    terminals.clear();
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 创建菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建题目',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-questions');
          }
        },
        {
          label: '导出PDF',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-pdf');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forcereload', label: '强制重新加载' },
        { role: 'toggledevtools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetzoom', label: '实际大小' },
        { role: 'zoomin', label: '放大' },
        { role: 'zoomout', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            mainWindow.webContents.send('menu-about');
          }
        },
        {
          label: '访问官网',
          click: () => {
            shell.openExternal('https://github.com/astra-synergy/primary-school-math-generator');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Electron 初始化完成
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全性：阻止新窗口创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-item-in-folder', (event, fullPath) => {
  shell.showItemInFolder(fullPath);
});

// 窗口控制IPC处理
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-unmaximize', () => {
  if (mainWindow) {
    mainWindow.unmaximize();
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  if (mainWindow) {
    return mainWindow.isMaximized();
  }
  return false;
});

// 终端相关IPC处理
ipcMain.handle('terminal:create', async (event, options) => {
  try {
    // 确定要使用的shell
    let shellCommand = options.shell;
    if (!shellCommand) {
      if (process.platform === 'win32') {
        shellCommand = 'powershell.exe';
      } else {
        shellCommand = process.env.SHELL || '/bin/bash';
      }
    }
    
    // 创建子进程
    const childProcess = spawn(shellCommand, [], {
      cwd: options.cwd || process.cwd(),
      env: process.env,
      shell: true
    });
    
    // 生成唯一ID
    const id = `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 存储终端进程
    terminals.set(id, childProcess);
    
    // 监听数据输出
    childProcess.stdout.on('data', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('terminal:data', { id, data: data.toString() });
      }
    });
    
    childProcess.stderr.on('data', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('terminal:data', { id, data: data.toString() });
      }
    });
    
    // 监听进程退出
    childProcess.on('exit', (code) => {
      if (mainWindow) {
        mainWindow.webContents.send('terminal:exit', { id, exitCode: code });
      }
      terminals.delete(id);
    });
    
    // 监听进程错误
    childProcess.on('error', (error) => {
      console.error(`Terminal process error for ${id}:`, error);
      if (mainWindow) {
        mainWindow.webContents.send('terminal:data', { id, data: `Error: ${error.message}\r\n` });
      }
    });
    
    return { id, success: true };
  } catch (error) {
    console.error('Failed to create terminal:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('terminal:write', (event, id, data) => {
  const childProcess = terminals.get(id);
  if (childProcess) {
    try {
      childProcess.stdin.write(data);
      return { success: true };
    } catch (error) {
      console.error(`Failed to write to terminal ${id}:`, error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Terminal not found' };
});

ipcMain.handle('terminal:kill', (event, id) => {
  const childProcess = terminals.get(id);
  if (childProcess) {
    try {
      childProcess.kill();
      terminals.delete(id);
      return { success: true };
    } catch (error) {
      console.error(`Failed to kill terminal ${id}:`, error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Terminal not found' };
});

// 添加MCP服务器管理功能
ipcMain.handle('mcp-server:start', async () => {
  try {
    // 检查Python环境
    const pythonCheck = await new Promise((resolve) => {
      exec('python --version', (error, stdout, stderr) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    
    if (!pythonCheck) {
      return { success: false, error: 'Python environment not found' };
    }
    
    // 检查MCP服务器文件是否存在
    const serverPath = path.join(__dirname, '../mcp-server/main.py');
    if (!fs.existsSync(serverPath)) {
      return { success: false, error: 'MCP server file not found' };
    }
    
    // 启动MCP服务器
    const mcpProcess = spawn('python', [serverPath], {
      cwd: path.join(__dirname, '../mcp-server'),
      env: process.env
    });
    
    // 存储MCP服务器进程
    terminals.set('mcp-server', mcpProcess);
    
    // 监听输出
    mcpProcess.stdout.on('data', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:output', { data: data.toString() });
      }
    });
    
    mcpProcess.stderr.on('data', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:output', { data: data.toString() });
      }
    });
    
    // 监听进程退出
    mcpProcess.on('exit', (code) => {
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:exit', { exitCode: code });
      }
      terminals.delete('mcp-server');
    });
    
    // 监听进程错误
    mcpProcess.on('error', (error) => {
      console.error('MCP server process error:', error);
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:output', { data: `Error: ${error.message}\r\n` });
      }
    });
    
    return { success: true, message: 'MCP server started successfully' };
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-server:stop', () => {
  const mcpProcess = terminals.get('mcp-server');
  if (mcpProcess) {
    try {
      mcpProcess.kill();
      terminals.delete('mcp-server');
      return { success: true, message: 'MCP server stopped successfully' };
    } catch (error) {
      console.error('Failed to stop MCP server:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'MCP server not running' };
});