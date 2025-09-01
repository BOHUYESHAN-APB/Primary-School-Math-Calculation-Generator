@echo off
chcp 65001 > nul
echo ================================
echo 数字芽算(MathBud) - 本地环境测试
echo ================================
echo.
echo 正在测试本地环境...
echo.

cd /d %~dp0

echo 1. 检查前端构建状态...
if exist "math-question-generator\dist\index.html" (
    echo    ✅ 前端已构建完成
) else (
    echo    ❌ 前端未构建，请运行: cd math-question-generator && npm run build
    pause
    exit /b 1
)

echo.
echo 2. 检查MCP服务器...
if exist "mcp-server\main.py" (
    echo    ✅ MCP服务器文件存在
) else (
    echo    ❌ MCP服务器文件缺失
    pause
    exit /b 1
)

echo.
echo 3. 检查配置文件...
if exist "config\app.yaml" (
    echo    ✅ 配置文件存在
) else (
    echo    ❌ 配置文件缺失
    pause
    exit /b 1
)

echo.
echo 4. 检查启动脚本...
if exist "启动MCP服务器.bat" (
    echo    ✅ MCP服务器启动脚本存在
) else (
    echo    ❌ MCP服务器启动脚本缺失
    pause
    exit /b 1
)

if exist "启动本地应用.bat" (
    echo    ✅ 本地应用启动脚本存在
) else (
    echo    ❌ 本地应用启动脚本缺失
    pause
    exit /b 1
)

echo.
echo ================================
echo 环境检查完成！
echo ================================
echo.
echo 使用说明：
echo 1. 运行"启动MCP服务器.bat"启动AI服务
echo 2. 运行"启动本地应用.bat"启动应用
echo.
echo 提示：请确保已安装Python环境和Node.js环境
echo.
pause