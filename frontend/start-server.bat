@echo off
title Bhasha_AI Backend Server (Port 8000)
cd /d "%~dp0"
echo =======================================================================
echo   Starting Bhasha_AI Backend Server on port 8000...
echo   Supports Local and Multi-Device LAN Access (0.0.0.0:8000)
echo =======================================================================
python backend\run.py
pause

