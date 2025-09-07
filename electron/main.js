const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');
const fs = require('fs');

 // 保持对窗口对象的全局引用
let mainWindow;
// 终端进程管理
const terminals = new Map();

/**
 * 检查本地 Python 环境和 uvicorn 模块是否可用
 * 返回 { available: boolean, pythonPath?: string, version?: string, uvicornAvailable?: boolean, error?: string }
 */
async function checkPythonEnvironment() {
  try {
    const pythonCommands = ['python', 'python3', 'py'];
    for (const cmd of pythonCommands) {
      try {
        const result = await new Promise((resolve) => {
          exec(`${cmd} --version`, (error, stdout, stderr) => {
            if (!error) {
              resolve({ available: true, pythonPath: cmd, version: (stdout || stderr).trim() });
            } else {
              resolve({ available: false, error: (stderr || '').trim() });
            }
          });
        });

        if (result.available) {
          // 检查 uvicorn 模块
          const uvicornCheck = await new Promise((resolve) => {
            exec(`${cmd} -c "import uvicorn; print('uvicorn available')"`, (error) => {
              resolve(!error);
            });
          });

          if (uvicornCheck) {
            return { ...result, uvicornAvailable: true };
          } else {
            return { available: false, error: 'uvicorn 模块未安装', pythonPath: cmd, version: result.version };
          }
        }
      } catch (e) {
        // 继续尝试下一个命令
        continue;
      }
    }

    return { available: false, error: '未找到可用的 Python 解释器' };
  } catch (error) {
    return { available: false, error: error.message || String(error) };
  }
}

// 启动 MCP 服务器的可复用函数（供 ready-to-show 和 IPC handler 调用）
async function startMCPProcess() {
  try {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    // 检查 Python 环境和 uvicorn
    const pythonCheck = await checkPythonEnvironment();
    if (!pythonCheck || !pythonCheck.available) {
      return { success: false, error: pythonCheck && pythonCheck.error ? pythonCheck.error : 'Python environment not found' };
    }
    const pythonPath = pythonCheck.pythonPath || 'python';

    // 检查 MCP 服务器文件
    const serverPath = path.join(__dirname, '../mcp-server/main.py');
    if (!fs.existsSync(serverPath)) {
      return { success: false, error: 'MCP server file not found' };
    }

    // 创建日志目录与文件
    const logDir = path.join(os.tmpdir(), 'mathbud-mcp-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, `mcp-${Date.now()}.log`);

    // 使用 python -m uvicorn mcp-server.main:app 启动，确保 uvicorn 在 Python 环境中运行
    const args = [
      '-m', 'uvicorn',
      'mcp-server.main:app',
      '--host', '0.0.0.0',
      '--port', '8002',
      '--log-level', 'info'
    ];

    const mcpProcess = spawn(pythonPath, args, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 启动超时检查，如果在10s内没有启动成功则视为启动失败
    let mcpProcessStarted = false;
    let stderrData = '';
    const startupTimeout = setTimeout(() => {
      if (!mcpProcessStarted) {
        try {
          mcpProcess.kill();
        } catch (e) {}
      }
    }, 10000);

    // 捕获 stdout
    mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      try { fs.appendFileSync(logFile, `[STDOUT] ${output}`); } catch (e) {}
      if (mainWindow) {
        try { mainWindow.webContents.send('mcp-server:output', { data: output, type: 'stdout' }); } catch(e){}
      }
      if (output.includes('Uvicorn running on') || output.includes('Started server process')) {
        mcpProcessStarted = true;
        clearTimeout(startupTimeout);
      }
    });

    // 捕获 stderr
    mcpProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderrData += output;
      try { fs.appendFileSync(logFile, `[STDERR] ${output}`); } catch (e) {}
      if (mainWindow) {
        try { mainWindow.webContents.send('mcp-server:output', { data: output, type: 'stderr' }); } catch(e){}
      }
    });

    mcpProcess.on('exit', (code, signal) => {
      clearTimeout(startupTimeout);
      try { fs.appendFileSync(logFile, `[EXIT] code=${code} signal=${signal} stderr=${stderrData}\n`); } catch(e){}
      if (mainWindow) {
        try { mainWindow.webContents.send('mcp-server:exit', { exitCode: code, signal, stderr: stderrData }); } catch(e){}
      }
      terminals.delete('mcp-server');
    });

    mcpProcess.on('error', (error) => {
      try { fs.appendFileSync(logFile, `[ERROR] ${error && error.message}\n`); } catch(e){}
    });

    // 存储引用与元信息
    terminals.set('mcp-server', {
      process: mcpProcess,
      logFile,
      startTime: Date.now()
    });

    // 发送 PID 事件（如果可用）
    if (mainWindow && mcpProcess && mcpProcess.pid) {
      try { mainWindow.webContents.send('mcp-server:pid', { pid: mcpProcess.pid }); } catch(e){}
    }

    return { success: true, pid: mcpProcess.pid, logFile, message: 'MCP server starting' };
  } catch (error) {
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
}

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
        // 放宽 connect-src，仅允许本地后端与 websocket 指向指定端口，避免使用非法或过宽的通配符（如 localhost:*）
        // 如需支持多个端口，可在这里添加对应 host 源（例如 http://localhost:8002）
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' http://localhost:8002 http://127.0.0.1:8002 ws://localhost:8002 ws://127.0.0.1:8002"
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
    console.log('ℹ️ 开发模式，加载 http://localhost:5173');
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
      try {
        mainWindow.loadFile(appPath);
        console.log('ℹ️ 已调用 loadFile');
      } catch (e) {
        console.error('loadFile 抛出异常:', e);
      }
    } else {
      console.error('❌ 找不到应用文件');
      // 创建错误页面
      mainWindow.loadURL('data:text/html,<h1>应用文件未找到</h1><p>请检查应用构建是否完成</p>');
    }

    // 监听渲染进程加载结果以便定位问题
    mainWindow.webContents.on('did-finish-load', () => {
      try {
        const url = mainWindow.webContents.getURL();
        console.log('✅ 渲染进程 did-finish-load, URL:', url);

        // 仅在显式启用诊断时注入诊断脚本，避免在生产中产生大量日志或竞争时序
        if (process.env.DEBUG_DIAG === '1') {
          try {
            mainWindow.webContents.executeJavaScript(`(function() {
              try {
                const root = document.getElementById('root');
                console.log('DIAG: ROOT_INNERHTML_START');
                console.log(root ? root.innerHTML : '<no-root>');
                console.log('DIAG: ROOT_INNERHTML_END');
                console.log('DIAG: ROOT_CHILD_COUNT', root ? root.childElementCount : 0);
                try {
                  console.log('DIAG: BODY_BG', getComputedStyle(document.body).backgroundColor);
                  console.log('DIAG: CSS_VAR_BACKGROUND', getComputedStyle(document.documentElement).getPropertyValue('--background'));
                } catch (styErr) {
                  console.log('DIAG: STYLE_ERROR', styErr && styErr.message);
                }

                // 可视性与覆盖层诊断
                (function(){
                  try{
                    const pick = (el) => {
                      const s = getComputedStyle(el);
                      const r = el.getBoundingClientRect ? el.getBoundingClientRect() : { x:0,y:0,width:0,height:0 };
                      return {
                        tag: el.tagName.toLowerCase(),
                        id: el.id || null,
                        classes: el.className || null,
                        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
                        display: s.display, visibility: s.visibility, opacity: s.opacity, zIndex: s.zIndex, bg: s.backgroundColor
                      };
                    };

                    const overlays = Array.from(document.querySelectorAll('div, section, main')).filter(el=>{
                      try{
                        const s = getComputedStyle(el);
                        if(s.position && (s.position==='fixed' || s.position==='absolute' || s.position==='sticky')){
                          const r = el.getBoundingClientRect();
                          return r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2;
                        }
                        return false;
                      }catch(e){ return false; }
                    }).map(pick);

                    console.log('DIAG: OVERLAYS', overlays);

                    const tops = Array.from(document.body.children).slice(0,10).map(pick);
                    console.log('DIAG: TOP_CHILDREN', tops);

                  }catch(e){
                    console.log('DIAG: VIS_ERR', e && e.message);
                  }
                })();

                window.addEventListener('error', e => {
                  const err = { message: e.message, stack: e.error && e.error.stack ? e.error.stack : (e.filename + ':' + e.lineno + ':' + e.colno) };
                  console.error('DIAG: CLIENT_ERROR', err);
                });
                window.addEventListener('unhandledrejection', ev => {
                  console.error('DIAG: UNHANDLED_REJECTION', ev.reason);
                });
                return true;
              } catch (e) {
                return { execError: e && e.message };
              }
            })();`).then(r => {
              console.log('DIAG: executeJavaScript result', r);
            }).catch(e => {
              console.error('DIAG: executeJavaScript failed', e);
            });
          } catch (e) {
            console.error('DIAG: inject failed', e);
          }
        } else {
          console.log('DIAG: disabled (process.env.DEBUG_DIAG !== 1)');
        }
      } catch (e) {
        console.error('获取 URL 失败:', e);
      }
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('❌ 渲染进程 did-fail-load', { errorCode, errorDescription, validatedURL });
    });

    // 如果 ready-to-show 没有触发，3 秒后强制显示窗口以便观察错误
    setTimeout(() => {
      try {
        if (mainWindow && !mainWindow.isVisible()) {
          console.warn('⚠️ 窗口仍不可见，3s 后强制显示窗口以便调试');
          mainWindow.show();
        }
      } catch (e) {
        console.error('强制显示窗口失败:', e);
      }
    }, 3000);
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // 打开开发者工具以便调试渲染进程（临时）
    try {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } catch (e) {
      console.error('无法打开 DevTools:', e);
    }
    // 自动启动MCP服务器：直接调用 startMCPProcess 以确保子进程被主进程托管并保持运行
    console.log('ℹ️ 正在启动MCP服务器...');
    startMCPProcess().then(res => {
      if (!res || !res.success) {
        console.warn('MCP: auto start failed', res && res.error);
      } else {
        console.log('MCP: auto started, pid=', res.pid);
      }
    }).catch(err => {
      console.error('MCP: auto start exception', err);
    });

    // 自动发送一次 menu-open-settings 仅在显式启用诊断时执行（避免竞态与误报）
    if (process.env.DEBUG_DIAG === '1') {
      try {
        setTimeout(() => {
          try {
            console.log('MENU: auto-requesting menu-open-settings (startup test)');
            if (mainWindow) {
              mainWindow.webContents.send('menu-open-settings');
              console.log('MENU: auto-sent menu-open-settings');
            }
          } catch (e) {
            console.error('MENU: auto-send failed', e);
          }
        }, 500);
      } catch (e) {
        console.error('MENU: scheduling auto-send failed', e);
      }
    } else {
      console.log('MENU: auto-send disabled (process.env.DEBUG_DIAG !== 1)');
    }
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
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-open-settings');
          }
        },
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
          label: '开源许可证',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-open-licenses');
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

 // 渲染端诊断错误上报
 ipcMain.on('diag-client-error', (event, err) => {
   console.error('DIAG: RENDERER_ERROR', err);
 });
 
 // 用于诊断：当预加载请求时由主进程转发一次 menu-open-settings
 ipcMain.handle('menu-test-request', async () => {
   try {
     console.log('MENU: received menu-test-request from preload');
     if (mainWindow) {
       mainWindow.webContents.send('menu-open-settings');
       console.log('MENU: forwarded menu-open-settings (test)');
     } else {
       console.warn('MENU: menu-test-request received but mainWindow is not available');
     }
     return { ok: true };
   } catch (e) {
     console.error('MENU: menu-test failed', e);
     return { ok: false, error: e && e.message ? e.message : String(e) };
   }
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
   const res = await startMCPProcess();
   return res;
 } catch (e) {
   return { success: false, error: e && e.message ? e.message : String(e) };
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