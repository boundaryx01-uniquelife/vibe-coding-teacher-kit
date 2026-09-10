@echo off
chcp 65001 > nul
title 바이브 코딩 연수 웹 서버 구동기
echo =========================================================
echo   🚀 바이브 코딩 학급운영 연수 Kit 웹 서버를 시작합니다...
echo =========================================================
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [경고] 파이썬(Python)이 설치되어 있지 않거나 실행할 수 없습니다.
    echo 윈도우 기본 웹 서버 또는 index.html 더블클릭으로 바로 실행해 주세요.
    pause
)
