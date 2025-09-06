@echo off
chcp 65001 > nul
echo ================================
echo 数字芽算(MathBud) - AI配置修复工具
echo ================================
echo.

cd /d %~dp0

echo 正在检查并修复AI配置...
echo.

echo 1. 检查配置文件...
if exist "config\app.yaml" (
    echo    ✅ 配置文件存在
) else (
    echo    ❌ 配置文件缺失
    pause
    exit /b 1
)

echo.
echo 2. 检查MCP服务器配置...
findstr /C:"port: 8002" "config\app.yaml" > nul
if %errorlevel% equ 0 (
    echo    ✅ MCP服务器端口配置正确 (8002)
) else (
    echo    ⚠️  MCP服务器端口配置可能不正确
    echo    请确保配置文件中mcp_server.port设置为8002
)

echo.
echo 3. 检查AI服务配置...
findstr /C:"baseUrl: string = 'http://localhost:8002'" "math-question-generator\src\lib\ai-service.ts" > nul
if %errorlevel% equ 0 (
    echo    ✅ AI服务端口配置正确 (8002)
) else (
    echo    ⚠️  AI服务端口配置可能不正确
    echo    请确保AI服务默认URL使用端口8002
)

echo.
echo 4. 检查MCP服务器启动配置...
findstr /C:"port=8002" "mcp-server\main.py" > nul
if %errorlevel% equ 0 (
    echo    ✅ MCP服务器启动端口正确 (8002)
) else (
    echo    ⚠️  MCP服务器启动端口可能不正确
    echo    请确保MCP服务器启动时使用端口8002
)

echo.
echo ================================
echo 配置检查完成！
echo ================================
echo.
echo 请确保：
echo 1. MCP服务器配置端口为8002
echo 2. AI服务默认URL使用端口8002
echo 3. MCP服务器启动时使用端口8002
echo.
pause