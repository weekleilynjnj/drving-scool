@echo off
chcp 65001 >nul
title 顺通驾校 - 手机访问服务
cd /d "%~dp0"

rem 优先使用自带的 Python，找不到就用系统里的 python
set "PY=C:\Users\15519\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
if not exist "%PY%" set "PY=python"
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

echo.
echo   正在启动服务，请稍等 2 秒...
echo.
"%PY%" "%~dp0serve.py"

echo.
echo   服务已结束。
pause
