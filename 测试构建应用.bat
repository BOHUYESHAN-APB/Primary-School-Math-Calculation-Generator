@echo off
chcp 65001 > nul
echo ================================
echo 数字芽算(MathBud) - 测试构建应用
echo ================================
echo.

cd /d %~dp0

echo 1. 检查构建文件...
if exist "dist\win-unpacked\数字芽算（MathBud）.exe" (
    echo    ✅ 构建的应用文件存在
) else (
    echo    ❌ 构建的应用文件不存在
    echo    请先运行"构建并测试.bat"
    pause
    exit /b 1
)

echo.
echo 2. 启动应用...
echo    正在启动数字芽算(MathBud)应用...
echo    应用启动后将自动启动MCP服务器
echo    请在应用中测试以下功能：
echo    - 题目生成
echo    - AI分析功能
echo    - 导出功能（HTML、Word、PDF）
echo    - 多语言切换
echo.
start "" "dist\win-unpacked\数字芽算（MathBud）.exe"

echo ================================
echo 应用已启动！
echo ================================
echo.
echo 请在应用中测试各项功能
echo MCP服务器应已自动启动
echo.
pause