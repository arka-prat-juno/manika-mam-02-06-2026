@echo off

cd /d D:\your-project-folder

:loop

node live-price-updater.js

timeout /t 2 /nobreak > nul

goto loop