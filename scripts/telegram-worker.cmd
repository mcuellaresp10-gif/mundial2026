@echo off
cd /d "%~dp0.."
call npx tsx scripts/telegram-worker.ts
