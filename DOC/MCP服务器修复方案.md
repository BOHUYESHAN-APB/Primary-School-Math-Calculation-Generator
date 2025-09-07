# MCP服务器修复方案

## 问题分析

### 当前问题
1. **MCP服务器启动后立即退出**：Python进程启动但无法保持运行
2. **根本原因**：MCP服务器使用 `uvicorn.run(app)` 方式启动，这种方式在子进程环境中会立即退出

### 技术细节
- `uvicorn.run(app)` 是阻塞调用，但在子进程环境中会立即返回
- 需要改为使用 `uvicorn.Server` 和 `asyncio` 事件循环来保持运行
- 需要添加适当的信号处理和优雅关闭机制

## 修复方案

### 1. 修改MCP服务器启动方式

**修改 `mcp-server/main.py` 的最后部分**：

```python
# 替换原有的 if __name__ == "__main__": 部分

if __name__ == "__main__":
    import uvicorn
    import asyncio
    import signal
    import sys
    
    # 创建配置
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=8002,
        log_level="info",
        access_log=True,
        timeout_keep_alive=30
    )
    
    # 创建服务器实例
    server = uvicorn.Server(config)
    
    # 信号处理函数
    def signal_handler(sig, frame):
        print(f"\n收到信号 {sig}，正在优雅关闭服务器...")
        asyncio.create_task(server.shutdown())
    
    # 注册信号处理器
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # 运行服务器（阻塞调用）
        print("MCP服务器启动中...")
        print(f"服务器地址: http://{config.host}:{config.port}")
        print("按 Ctrl+C 停止服务器")
        
        server.run()
        
    except KeyboardInterrupt:
        print("\n用户中断，正在关闭服务器...")
    except Exception as e:
        print(f"服务器运行错误: {e}")
        sys.exit(1)
    finally:
        print("MCP服务器已关闭")
```

### 2. 改进Electron主进程的MCP启动器

**修改 `electron/main.js` 中的 `startMCPProcess` 函数**：

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
```

### 3. 添加Python环境检查函数

**在 `electron/main.js` 中添加**：

```javascript
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

### 4. 创建依赖安装脚本

**创建 `scripts/install-dependencies.ps1`**：

```powershell
# PowerShell脚本安装MCP服务器依赖
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

## 实施步骤

### 第一阶段：立即修复（高优先级）
1. ✅ 修改MCP服务器启动方式（使用uvicorn.Server）
2. 🔄 改进Electron主进程的MCP启动器
3. 🔄 添加Python环境检查函数
4. 🔄 创建依赖安装脚本

### 第二阶段：稳定性增强（中优先级）
1. 🔄 添加详细的日志记录
2. 🔄 实现健康检查机制
3. 🔄 完善错误处理和用户反馈

### 第三阶段：用户体验优化（低优先级）
1. 🔄 前端状态显示
2. 🔄 一键修复功能
3. 🔄 性能监控

## 预期结果

通过这套修复方案，我们将实现：

1. **稳定的MCP服务器运行**：服务器能够长期稳定运行
2. **完善的错误诊断**：详细的日志和错误信息
3. **良好的用户体验**：清晰的状态显示和错误处理
4. **易于维护**：模块化的设计和详细的文档

## 测试验证

修复后需要进行以下测试：
1. 开发模式测试：`npm run dev`
2. 生产模式测试：`npm run build && npm start`
3. 打包应用测试：`npm run dist`
4. 依赖安装测试：运行安装脚本验证依赖

## 后续优化

1. **Docker容器化**：将MCP服务器容器化以获得更好的隔离性
2. **热重载支持**：开发时支持代码热重载
3. **性能监控**：添加性能指标和监控
4. **自动更新**：实现MCP服务器的自动更新机制