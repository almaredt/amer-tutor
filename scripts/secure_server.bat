@echo off
rem Double-click once to make SSH login key-only, with automatic security updates and fail2ban.
cd /d "%~dp0"
python secure_server.py
