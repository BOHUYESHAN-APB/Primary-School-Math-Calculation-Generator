const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
// const { spawn } = require('child_process'); // 已移除MCP服务器自动启动功能

// 保持对窗口对象的全局引用
let mainWindow;
// let mcpServerProcess; // 已移除MCP服务器自动启动功能

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
    
    // 已移除MCP服务器自动启动功能
    // 用户需要手动运行 "启动MCP服务器.bat" 来启动服务器
    console.log('ℹ️ 请手动运行“启动MCP服务器.bat”来启动AI服务');
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
    // stopMCPServer(); // 已移除MCP服务器自动启动功能
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 以下函数已移除，MCP服务器现在由用户手动启动
// 用户可以运行项目根目录中的“启动MCP服务器.bat”文件

/*
function startMCPServer() {
  // 临时禁用MCP服务器启动，专注基础功能测试
  // TODO: 完善Python环境检测和MCP服务器配置后重新启用
  console.log('🔧 MCP服务器暂时禁用，专注基础功能测试');
  
  // 原MCP服务器启动代码 - 临时注释
  try {
    const serverPath = path.join(__dirname, '../mcp-server/main.py');
    const pythonPath = 'python'; // 可以配置为具体的Python路径
    
    mcpServerProcess = spawn(pythonPath, [serverPath], {
      cwd: path.join(__dirname, '../mcp-server'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    mcpServerProcess.stdout.on('data', (data) => {
      console.log(`MCP Server: ${data}`);
    });

    mcpServerProcess.stderr.on('data', (data) => {
      console.error(`MCP Server Error: ${data}`);
    });

    mcpServerProcess.on('close', (code) => {
      console.log(`MCP Server exited with code ${code}`);
    });
  } catch (error) {
    console.error('Failed to start MCP server:', error);
  }
}

function stopMCPServer() {
  if (mcpServerProcess) {
    mcpServerProcess.kill();
    mcpServerProcess = null;
  }
}
*/

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