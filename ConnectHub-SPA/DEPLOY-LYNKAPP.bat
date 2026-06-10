@echo off
REM ============================================================
REM LynkApp — MASTER DEPLOY SCRIPT
REM Updated: June 10, 2026 — Beta Launch Checklist Complete
REM ============================================================
REM USAGE:
REM   DEPLOY-LYNKAPP.bat           (default: build + deploy hosting)
REM   DEPLOY-LYNKAPP.bat full      (build + deploy all: hosting+rules+functions)
REM   DEPLOY-LYNKAPP.bat rules     (deploy Firestore/Storage rules only)
REM   DEPLOY-LYNKAPP.bat functions (deploy Cloud Functions only)
REM   DEPLOY-LYNKAPP.bat seed      (run admin + demo content seeders)
REM ============================================================
echo.
echo ============================================================
echo  LynkApp Master Deploy — %date% %time%
echo ============================================================
echo.

cd /d "%~dp0"

REM --- Determine deploy mode ---
set MODE=%1
if "%MODE%"=="" set MODE=hosting

echo Deploy mode: %MODE%
echo.

REM --- Verify Firebase login ---
echo Checking Firebase authentication...
firebase projects:list --json >nul 2>&1
if errorlevel 1 (
    echo Not logged into Firebase. Logging in...
    call firebase login
    if errorlevel 1 (
        echo ERROR: Firebase login failed.
        pause
        exit /b 1
    )
)
echo Firebase authenticated OK.

REM --- BUILD (always required for hosting modes) ---
if "%MODE%"=="rules" goto SKIP_BUILD
if "%MODE%"=="functions" goto SKIP_BUILD
if "%MODE%"=="seed" goto SKIP_BUILD

echo.
echo Building production bundle...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed! Deployment aborted.
    echo Check the error output above and fix before deploying.
    pause
    exit /b 1
)
echo Build successful.

:SKIP_BUILD

REM --- DEPLOY ---
echo.
if "%MODE%"=="hosting" (
    echo Deploying to Firebase Hosting...
    call firebase deploy --only hosting
) else if "%MODE%"=="full" (
    echo Deploying everything (hosting + Firestore rules + Storage rules + functions)...
    call firebase deploy
) else if "%MODE%"=="rules" (
    echo Deploying Firestore and Storage rules...
    call firebase deploy --only firestore:rules,storage:rules
) else if "%MODE%"=="functions" (
    echo Deploying Cloud Functions...
    call firebase deploy --only functions
) else if "%MODE%"=="seed" (
    goto RUN_SEED
) else (
    echo Unknown mode: %MODE%
    echo Valid modes: hosting, full, rules, functions, seed
    pause
    exit /b 1
)

if errorlevel 1 (
    echo.
    echo ERROR: Firebase deploy failed!
    echo Try: firebase login --reauth
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  DEPLOY COMPLETE!
echo  Live URL: https://lynkapp.com
echo  Firebase Console: https://console.firebase.google.com
echo ============================================================
goto END

:RUN_SEED
echo Running seed scripts...
echo.
echo [1/2] Setting up admin account...
if exist "%~dp0seed-ceo-admin.cjs" (
    call node seed-ceo-admin.cjs
    echo Admin OK.
) else (
    echo WARNING: seed-ceo-admin.cjs not found.
)
echo.
echo [2/2] Seeding demo content...
if exist "%~dp0seed-demo-content.cjs" (
    call node seed-demo-content.cjs
    echo Demo content seeded.
) else (
    echo WARNING: seed-demo-content.cjs not found.
)
echo.
echo Seed complete!

:END
echo.
pause
