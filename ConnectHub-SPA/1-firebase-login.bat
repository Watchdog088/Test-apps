@echo off
echo ============================================
echo  STEP 1 — Firebase Login
echo ============================================
echo.
echo A browser window will open.
echo Sign in with the Google account that OWNS
echo your Firebase project.
echo.
echo After signing in, come back here and press
echo any key to continue to the next step.
echo.
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" login
echo.
echo ============================================
echo  Login complete! 
echo  Now run:  2-deploy-rules-and-functions.bat
echo ============================================
pause
