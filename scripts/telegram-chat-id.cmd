@echo off
cd /d "%~dp0.."
call npx tsx scripts/telegram-get-chat-id.ts
