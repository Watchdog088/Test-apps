@echo off
setlocal enabledelayedexpansion
echo ================================================
echo  LynkApp - Save ALL Work to GitHub
echo  (user-testing fixes + bat file updates)
echo ================================================
echo.

cd /d "%~dp0"

REM ── Step 1: Show current status ─────────────────────────────────────
echo [1/4] Checking git status...
git status --short
echo.

REM ── Step 2: Stage EVERYTHING changed ────────────────────────────────
echo [2/4] Staging all changed files...
git add -A
echo   Staged:
echo     LynkApp-Production-App/js/user-testing-fixes.js  (7 bug fixes v3)
echo     ConnectHub-Frontend/src/js/user-testing-fixes.js
echo     save-user-testing-fixes.bat                       (this script)
echo     update-lynkapp-FINAL.bat                          (S3 sync script)
echo     deploy-lynkapp-FINAL.bat                          (full deploy)
echo     LynkApp-Production-App/index.html                 (if changed)
echo     + any other modified files
echo.

REM ── Step 3: Commit ──────────────────────────────────────────────────
echo [3/4] Committing...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo   [INFO] Nothing new to commit - working tree already clean.
    echo   Latest commit:
    git log -1 --oneline
    goto :push
)

git commit -m "fix: user-testing bugs v3 - 7 fixes + bat file updates

User-Testing Bug Fixes (v3 - final):
- Fix 1: handleRegister() now hooked - triggers 2-step profile wizard
         (name/username/bio/photo on step 1, interests/DOB/style step 2)
         Also hooks handleAuthSubmit + click listener on Create Account btn
- Fix 2: submitActualPost() defined globally right away so HTML onclick
         works even before wirePostButton() fires on first modal open;
         duplicate-listener bug fixed (utWired flag on button, no reset)
- Fix 3: 'Add Location' text input + confirm button injected into
         selectLocationModal; Enter key also triggers confirm
- Fix 4: Search box + 'Done - Add People' confirm button injected into
         tagPeopleModal; selected names shown as badge in create-post form
- Fix 5: submitComment() wires up existing #commentInputField; comments
         appended to modal list; send button styled to 42px round circle
- Fix 6: sharePost() opens sharePostModal (or fallback sheet with social
         options: WhatsApp/Twitter/Facebook/Email + copy-link)
- Fix 7: openStoryCamera() uses getUserMedia with live preview + capture/
         flip camera; openStoryGallery() opens real file picker

Bat file updates:
- save-user-testing-fixes.bat: uses git add -A, updated commit message
- update-lynkapp-FINAL.bat: explicit user-testing-fixes.js no-cache upload"

:push
REM ── Step 4: Push ────────────────────────────────────────────────────
echo.
echo [4/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo   Push to main failed, trying master...
    git push origin master
)

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo   SUCCESS! All work saved to GitHub.
    echo ================================================
    echo.
    echo   Repo: https://github.com/Watchdog088/Test-apps
    echo   Branch: main
    echo.
    echo   Latest commits:
    git log -3 --oneline
) else (
    echo.
    echo [ERROR] Push failed. Check your network / credentials.
)

echo.
pause
