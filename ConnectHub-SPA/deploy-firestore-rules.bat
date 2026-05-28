@echo off
echo ============================================
echo  LynkApp - Deploy Firestore Rules to Firebase
echo ============================================
echo.
echo Step 1: Login to Firebase (opens browser)
node "C:\Users\Jnewball\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js" login
echo.
echo Step 2: Deploy Firestore rules to lynkapp-c7db1
node "C:\Users\Jnewball\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js" deploy --only firestore:rules --project lynkapp-c7db1
echo.
echo Done! Rules are live.
pause
