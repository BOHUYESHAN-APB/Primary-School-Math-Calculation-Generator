@echo off
chcp 65001 > nul
echo ================================
echo 数字芽算(MathBud) - 构建并测试
echo ================================
echo.

cd /d %~dp0

echo 1. 构建前端应用...
cd math-question-generator
if exist "dist" (
    echo    清理旧的构建文件...
    rd /s /q dist > nul 2>&1
)
echo    正在构建前端应用...
npm run build
if %errorlevel% neq 0 (
    echo    ❌ 前端构建失败
    cd ..
    pause
    exit /b %errorlevel%
)
echo    ✅ 前端构建完成
cd ..

echo.
echo 2. 检查必要文件...
if exist "math-question-generator\dist\index.html" (
    echo    ✅ 前端文件存在
) else (
    echo    ❌ 前端文件缺失
    pause
    exit /b 1
)

if exist "mcp-server\main.py" (
    echo    ✅ MCP服务器文件存在
) else (
    echo    ❌ MCP服务器文件缺失
    pause
    exit /b 1
)

if exist "config\app.yaml" (
    echo    ✅ 配置文件存在
) else (
    echo    ❌ 配置文件缺失
    pause
    exit /b 1
)

echo.
echo 3. 检查Python环境...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Python环境未安装或未添加到PATH
    echo    请安装Python 3.8或更高版本并添加到系统PATH
    pause
    exit /b 1
)
echo    ✅ Python环境可用

echo.
echo 4. 检查Python依赖...
cd mcp-server
python -c "import fastapi" > nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️  FastAPI未安装，正在安装依赖...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo    ❌ 依赖安装失败
        cd ..
        pause
        exit /b %errorlevel%
    )
    echo    ✅ 依赖安装完成
) else (
    echo    ✅ Python依赖已安装
)
cd ..

echo.
echo 5. 构建Electron应用...
npm run electron:build
if %errorlevel% neq 0 (
    echo    ❌ Electron应用构建失败
    pause
    exit /b %errorlevel%
)
echo    ✅ Electron应用构建完成

echo.
echo ================================
echo 构建完成！
echo ================================
echo.
echo 启动应用后，MCP服务器将自动启动
echo 请启动生成的exe文件进行测试
echo.
pause