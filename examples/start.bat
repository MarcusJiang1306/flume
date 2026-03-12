@echo off
echo ========================================
echo Flume 示例项目快速启动
echo ========================================
echo.

echo [1] 准备环境...
call npm run build >nul 2>&1
if errorlevel 1 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)
echo ✅ 构建完成

echo.
echo [2] 打包...
call npm pack >nul 2>&1
if errorlevel 1 (
    echo ❌ 打包失败，请检查错误信息
    pause
    exit /b 1
)
echo ✅ 打包完成

echo.
echo [3] 复制文件到示例目录...
copy dist\flume.es.js examples\ >nul 2>&1
copy dist\flume.css examples\ >nul 2>&1
echo ✅ 文件复制完成

echo.
echo ========================================
echo 示例项目已准备就绪！
echo ========================================
echo.
echo 请选择要运行的示例：
echo.
echo [1] CDN 示例（直接在浏览器中打开）
echo [2] Vue 项目示例（需要安装依赖）
echo.
set /p choice="请输入选项 (1 或 2): "

if "%choice%"=="1" (
    echo.
    echo 正在打开 CDN 示例...
    start examples\cdn-example.html
) else if "%choice%"=="2" (
    echo.
    echo 正在准备 Vue 项目示例...
    cd examples\vue-example
    
    echo 检查是否需要安装依赖...
    if not exist "node_modules" (
        echo 正在安装依赖...
        call npm install
    )
    
    echo 检查是否需要安装 flume...
    if not exist "node_modules\@soulglad" (
        echo 正在安装 flume...
        call npm install ..\..\soulglad-flume-0.0.1.tgz
    )
    
    echo.
    echo 正在启动开发服务器...
    call npm run dev
) else (
    echo.
    echo ❌ 无效的选项
    pause
)

pause