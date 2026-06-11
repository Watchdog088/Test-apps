@echo off
title LynkApp - Save All Work to GitHub
cd /d "%~dp0"
echo ============================================
echo  SAVE ALL WORK TO GITHUB
echo  Repo: Watchdog088/Test-apps
echo ============================================
echo.

echo Checking git status...
git status --short
echo.

echo Adding all files (secrets excluded by .gitignore)...
git add -A

echo.
echo Setting commit message...
set COMMIT_MSG=LynkApp beta plan: full UX/UI assessment, all bat files updated, Android+iOS+Web plan June 2026

echo Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

if %ERRORLEVEL% NEQ 0 (
  echo Nothing new to commit or commit failed.
) else (
  echo ✅ Committed successfully!
)

echo.
echo Pushing to GitHub (origin/main)...
git push origin main
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Push failed. Trying with --force-with-lease...
  git push origin main --force-with-lease
)

echo.
echo ============================================
echo  ✅ All work saved to GitHub!
echo  View at: https://github.com/Watchdog088/Test-apps
echo ============================================
pause
