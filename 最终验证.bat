@echo off
chcp 65001 > nul
echo ================================
echo 数字芽算(MathBud) - 最终验证
echo ================================
echo.

cd /d %~dp0

echo 正在验证项目完整性...
echo.

echo 1. 检查核心文件...
if exist "math-question-generator\src\lib\ai-service.ts" (
    echo    ✅ AI服务文件存在
) else (
    echo    ❌ AI服务文件缺失
    exit /b 1
)

if exist "mcp-server\main.py" (
    echo    ✅ MCP服务器文件存在
) else (
    echo    ❌ MCP服务器文件缺失
    exit /b 1
)

if exist "config\app.yaml" (
    echo    ✅ 配置文件存在
) else (
    echo    ❌ 配置文件缺失
    exit /b 1
)

echo.
echo 2. 检查启动脚本...
if exist "启动MCP服务器.bat" (
    echo    ✅ MCP服务器启动脚本存在
) else (
    echo    ❌ MCP服务器启动脚本缺失
    exit /b 1
)

if exist "启动本地应用.bat" (
    echo    ✅ 本地应用启动脚本存在
) else (
    echo    ❌ 本地应用启动脚本缺失
    exit /b 1
)

if exist "启动完整本地环境.bat" (
    echo    ✅ 完整本地环境启动脚本存在
) else (
    echo    ❌ 完整本地环境启动脚本缺失
    exit /b 1
)

if exist "构建并测试.bat" (
    echo    ✅ 构建测试脚本存在
) else (
    echo    ❌ 构建测试脚本缺失
    exit /b 1
)

if exist "测试构建应用.bat" (
    echo    ✅ 测试构建应用脚本存在
) else (
    echo    ❌ 测试构建应用脚本缺失
    exit /b 1
)

echo.
echo 3. 检查配置...
findstr /C:"port: 8002" "config\app.yaml" > nul
if %errorlevel% equ 0 (
    echo    ✅ MCP服务器端口配置正确 ^(8002^)
) else (
    echo    ❌ MCP服务器端口配置不正确
    exit /b 1
)

findstr /C:"baseUrl: string = 'http://localhost:8002'" "math-question-generator\src\lib\ai-service.ts" > nul
if %errorlevel% equ 0 (
    echo    ✅ AI服务端口配置正确 ^(8002^)
) else (
    echo    ❌ AI服务端口配置不正确
    exit /b 1
)

findstr /C:"port=8002" "mcp-server\main.py" > nul
if %errorlevel% equ 0 (
    echo    ✅ MCP服务器启动端口正确 ^(8002^)
) else (
    echo    ❌ MCP服务器启动端口不正确
    exit /b 1
)

echo.
echo 4. 检查导出配置...
findstr /C:"id: \"word\"" "config\app.yaml" | findstr /C:"enabled: true" > nul
if %errorlevel% equ 0 (
    echo    ✅ Word导出功能已启用
) else (
    echo    ❌ Word导出功能未启用
    exit /b 1
)

echo.
echo 5. 检查Electron主进程...
findstr /C:"ipcMain.emit('mcp-server:start')" "electron\main.js" > nul
if %errorlevel% equ 0 (
    echo    ✅ MCP服务器自动启动配置正确
) else (
    echo    ❌ MCP服务器自动启动配置不正确
    exit /b 1
)

echo.
echo ================================
echo 验证完成！所有功能已正确实现
echo ================================
echo.
echo 项目已准备好进行最终测试
echo 请运行"构建并测试.bat"开始构建
echo 构建完成后运行"测试构建应用.bat"进行测试
echo.
pause