
# MCP服务器集成详细设计

## 问题分析与当前状态

### 当前问题
1. **MCP服务器启动后立即退出**：Python进程启动但无法保持运行
2. **前端配置加载失败**：持续重试导致界面闪烁
3. **进程生命周期管理不稳定**：子进程托管机制需要优化

### 根本原因分析
- MCP服务器使用 `uvicorn.run(app)` 方式启动，这种方式在主进程环境中可能不稳定
- 子进程输出和错误信息没有充分捕获和日志记录
- 缺乏完善的进程健康检查和重启机制

## 解决方案设计

### 1. 改进的MCP进程启动器

**修改 `startMCPProcess` 函数** (`electron/main.js`):

```javascript
async function startMCPProcess() {
  try {
    // 详细的Python环境检查
    const pythonCheck = await checkPythonEnvironment();
    if (!pythonCheck.available) {
      return { 
        success: false, 
        error: `Python环境不可用: ${pythonCheck.error}` 
      };
    }

    // 检查MCP服务器文件
    const serverPath = path.join(__dirname, '../mcp-server/main.py');
    if (!fs.existsSync(serverPath)) {
      return { success: false, error: 'MCP服务器文件未找到' };
    }

    // 创建日志文件用于记录MCP输出
    const logDir = path.join(os.tmpdir(), 'mathbud-mcp-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, `mcp-${Date.now()}.log`);
    
    // 使用更稳定的uvicorn命令方式启动
    const mcpProcess = spawn(pythonCheck.pythonPath, [
      '-m', 'uvicorn', 
      'mcp-server.main:app',
      '--host', '0.0.0.0',
      '--port', '8002',
      '--log-level', 'info'
    ], {
      cwd: path.join(__dirname, '..'), // 在项目根目录运行
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
      stdio: ['pipe', 'pipe', 'pipe'] // 捕获所有输出
    });

    // 设置超时检查
    const startupTimeout = setTimeout(() => {
      if (mcpProcess && !mcpProcessStarted) {
        console.error('MCP服务器启动超时');
        mcpProcess.kill();
      }
    }, 10000);

    let mcpProcessStarted = false;
    let stderrData = '';

    // 捕获标准输出
    mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('MCP stdout:', output);
      
      // 记录到文件
      fs.appendFileSync(logFile, `[STDOUT] ${output}\n`);
      
      // 检查启动成功标志
      if (output.includes('Uvicorn running on')) {
        mcpProcessStarted = true;
        clearTimeout(startupTimeout);
        console.log('MCP服务器启动成功');
      }
      
      // 转发到渲染器
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:output', { 
          data: output,
          type: 'stdout'
        });
      }
    });

    // 捕获标准错误
    mcpProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error('MCP stderr:', errorOutput);
      stderrData += errorOutput;
      
      // 记录到文件
      fs.appendFileSync(logFile, `[STDERR] ${errorOutput}\n`);
      
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:output', { 
          data: errorOutput,
          type: 'stderr'
        });
      }
    });

    // 进程退出处理
    mcpProcess.on('exit', (code, signal) => {
      clearTimeout(startupTimeout);
      console.log(`MCP进程退出，代码: ${code}, 信号: ${signal}`);
      
      // 记录退出信息
      const exitInfo = `进程退出: code=${code}, signal=${signal}\nStderr: ${stderrData}`;
      fs.appendFileSync(logFile, `[EXIT] ${exitInfo}\n`);
      
      if (mainWindow) {
        mainWindow.webContents.send('mcp-server:exit', { 
          exitCode: code,
          signal: signal,
          stderr: stderrData
        });
      }
      
      terminals.delete('mcp-server');
    });

    mcpProcess.on('error', (error) => {
      console.error('MCP进程错误:', error);
      fs.appendFileSync(logFile, `[ERROR] ${error.message}\n`);
    });

    // 存储进程引用
    terminals.set('mcp-server', {
      process: mcpProcess,
      logFile: logFile,
      startTime: Date.now()
    });

    return { 
      success: true, 
      pid: mcpProcess.pid,
      logFile: logFile,
      message: 'MCP服务器启动中...'
    };

  } catch (error) {
    console.error('启动MCP服务器失败:', error);
    return { 
      success: false, 
      error: `启动失败: ${error.message}` 
    };
  }
}

// Python环境检查函数
async function checkPythonEnvironment() {
  try {
    // 尝试多种Python命令
    const pythonCommands = ['python', 'python3', 'py'];
    
    for (const cmd of pythonCommands) {
      try {
        const result = await new Promise((resolve) => {
          exec(`${cmd} --version`, (error, stdout, stderr) => {
            if (!error) {
              resolve({ available: true, pythonPath: cmd, version: stdout.trim() });
            } else {
              resolve({ available: false, error: stderr });
            }
          });
        });
        
        if (result.available) {
          // 检查uvicorn模块
          const uvicornCheck = await new Promise((resolve) => {
            exec(`${cmd} -c "import uvicorn; print('uvicorn available')"`, (error) => {
              resolve(!error);
            });
          });
          
          if (uvicornCheck) {
            return { ...result, uvicornAvailable: true };
          } else {
            return { 
              available: false, 
              error: 'uvicorn模块未安装',
              pythonPath: cmd,
              version: result.version
            };
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return { available: false, error: '未找到可用的Python解释器' };
  } catch (error) {
    return { available: false, error: error.message };
  }
}
```

### 2. 增强的进程管理API

**新增IPC处理器**:

```javascript
// 获取MCP服务器状态
ipcMain.handle('mcp-server:status', () => {
  const mcpProcess = terminals.get('mcp-server');
  if (!mcpProcess) {
    return { running: false, status: 'not_started' };
  }
  
  return {
    running: true,
    pid: mcpProcess.process.pid,
    startTime: mcpProcess.startTime,
    logFile: mcpProcess.logFile,
    status: 'running'
  };
});

// 获取MCP日志
ipcMain.handle('mcp-server:logs', async () => {
  const mcpProcess = terminals.get('mcp-server');
  if (!mcpProcess || !mcpProcess.logFile) {
    return { logs: '', error: 'No log file available' };
  }
  
  try {
    const logs = fs.readFileSync(mcpProcess.logFile, 'utf8');
    return { logs };
  } catch (error) {
    return { logs: '', error: error.message };
  }
});
```

### 3. 前端健康检查机制

**在React组件中添加**:

```typescript
// MCP服务器健康检查
useEffect(() => {
  const checkServerHealth = async () => {
    if (!window.electronAPI) return;
    
    try {
      // 检查MCP状态
      const status = await window.electronAPI.getMCPServerStatus();
      
      if (status.running) {
        // 尝试连接API
        const response = await fetch('http://localhost:8002/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          setServerStatus('healthy');
        } else {
          setServerStatus('unhealthy');
        }
      } else {
        setServerStatus('stopped');
      }
    } catch (error) {
      setServerStatus('error');
      console.error('Health check failed:', error);
    }
  };
  
  // 初始检查
  checkServerHealth();
  
  // 定期检查（每30秒）
  const interval = setInterval(checkServerHealth, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### 4. 依赖安装脚本

**创建安装脚本** (`scripts/install-dependencies.ps1`):

```powershell
# PowerShell脚本安装Python依赖
Write-Host "正在安装MCP服务器依赖..."

# 检查Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $python) {
    Write-Error "未找到Python，请先安装Python 3.8+"
    exit 1
}

Write-Host "使用Python: $($python.Source)"
Write-Host "Python版本: $(& $python.Source --version)"

# 安装依赖
try {
    & $python.Source -m pip install -r mcp-server/requirements.txt
    Write-Host "依赖安装成功!"
    
    # 验证安装
    & $python.Source -c "import fastapi, uvicorn, sympy; print('所有依赖验证通过')"
    Write-Host "依赖验证成功!"
}
catch {
    Write-Error "依赖安装失败: $($_.Exception.Message)"
    exit 1
}
```

### 5. 配置验证机制

**在MCP服务器启动前验证配置**:

```javascript
// 配置验证函数
async function validateMCPConfig() {
  try {
    // 检查配置文件是否存在
    const configPath = path.join(__dirname, '../config/app.yaml');
    if (!fs.existsSync(configPath)) {
      console.warn('配置文件不存在，使用默认配置');
      return { valid: true, hasConfig: false };
    }
    
    // 简单的YAML语法检查
    const configContent = fs.readFileSync(configPath, 'utf8');
    try {
      const yaml = require('js-yaml');
      yaml.load(configContent);
      return { valid: true, hasConfig: true };
    } catch (yamlError) {
      return { 
        valid: false, 
        error: `配置文件语法错误: ${yamlError.message}` 
      };
    }
  } catch (error) {
    return { 
      valid: false, 
      error: `配置验证失败: ${error.message}` 
    };
  }
}
```

## 实施步骤

### 第一阶段：基础设施改进
1. ✅ 创建详细的架构文档
2. 🔄 改进MCP进程启动器（当前进行中）
3. 🔄 添加完善的日志记录
4. 🔄 实现健康检查机制

### 第二阶段：稳定性增强
1. 🔄 添加依赖安装脚本
2. 🔄 实现配置验证
3. 🔄 添加自动重试机制
4. 🔄 完善错误处理

### 第三阶段：用户体验优化
1. 🔄 前端状态显示
2. 🔄 详细的错误信息展示
3. 🔄 一键修复功能
4. 🔄 性能监控

## 预期结果

通过这套改进方案，我们将实现：

1. **稳定的进程管理**：MCP服务器能够长期稳定运行
2. **完善的诊断能力**：详细的日志和错误信息
3. **良好的用户体验**：清晰的状态显示和错误处理
4. **易于维护**：模块化的设计和详细的文档

## 后续优化方向

1. **Docker容器化**：将MCP服务器容器化以获得更好的隔离性
2. **热重载支持**：开发时