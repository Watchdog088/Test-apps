@echo off
REM ===================================================================
REM Test NewsAPI Integration
REM ===================================================================

echo.
echo ===================================================================
echo   Testing NewsAPI Integration
echo ===================================================================
echo.

set API_KEY=fda0b285fdbb4d27890b48951ad2d0c3

echo [STEP 1] Testing NewsAPI connection...
echo.
echo Fetching top headlines from US...
echo.

curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=%API_KEY%"

echo.
echo.
echo ===================================================================
echo   Test Complete!
echo ===================================================================
echo.
echo If you see JSON data above with "status":"ok", your API is working! ✅
echo.
echo Next steps:
echo 1. Integrate this into your trending section
echo 2. Parse the JSON to extract articles
echo 3. Display in your app
echo.
echo API Key saved in: ConnectHub-Backend/.env
echo.
pause
