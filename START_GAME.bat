@echo off
cd /d "%~dp0"
title Kenya Pool Club V5.1 - Demo Server
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js not found. Install Node.js LTS or restart Windows.
 pause
 exit /b 1
)
echo Starting V5.1. Keep this window open. Virtual credits only.
echo Open http://localhost:8080 in Chrome after the server starts.
node server.js
pause
