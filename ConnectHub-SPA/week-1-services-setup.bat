@echo off
REM ============================================================
REM LynkApp — WEEK 1 SERVICE KEYS SETUP
REM Beta Launch Checklist — Phase 2: Week 1
REM Services: OneSignal, Stripe, Mailgun, Stripe Webhook
REM Updated: June 10, 2026
REM ============================================================
echo.
echo ============================================================
echo  LynkApp WEEK 1 SERVICES SETUP
echo  OneSignal + Stripe + Mailgun
echo ============================================================
echo.

cd /d "%~dp0"

echo Checking service configurations...
echo.

REM --- OneSignal ---
echo [OneSignal Push Notifications]
findstr /C:"VITE_ONESIGNAL_APP_ID=your_" "%~dp0.env" >nul 2>&1
if not errorlevel 1 (
    echo STATUS: NOT CONFIGURED
    echo.
    echo TO FIX:
    echo  1. Go to: https://onesignal.com
    echo  2. Create free account - Create App "LynkApp"
    echo  3. Choose "Web Push" platform
    echo  4. Get your App ID from: Settings - Keys & IDs
    echo  5. Add to .env:
    echo     VITE_ONESIGNAL_APP_ID=your_real_app_id
    echo  6. Run: npm run build ^& firebase deploy --only hosting
    echo.
) else (
    echo STATUS: CONFIGURED OK
)

echo.
echo [Stripe Payments]
findstr /C:"VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR" "%~dp0.env" >nul 2>&1
if not errorlevel 1 (
    echo STATUS: NOT CONFIGURED (using placeholder key)
    echo.
    echo TO FIX:
    echo  1. Go to: https://dashboard.stripe.com/test/apikeys
    echo  2. Copy your TEST Publishable key (starts with pk_test_)
    echo  3. Add to ConnectHub-SPA/.env:
    echo     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_REAL_KEY
    echo  4. Add to ConnectHub-Backend/.env:
    echo     STRIPE_SECRET_KEY=sk_test_YOUR_REAL_KEY
    echo  5. Set up webhook: Stripe Dashboard - Webhooks
    echo     Endpoint: https://api.lynkapp.com/api/webhooks/stripe
    echo     Events: payment_intent.succeeded, payment_intent.failed
    echo.
    echo  NOTE: Keep TEST keys during beta. Switch to live keys only
    echo  when you are ready for real money transactions.
    echo.
) else (
    echo STATUS: CONFIGURED OK
)

echo.
echo [Mailgun Email (for backend)]
echo  NOTE: Mailgun keys go in ConnectHub-Backend/.env (NOT frontend)
echo.
echo  TO SET UP:
echo  1. Go to: https://mailgun.com (free: 1,000 emails/month)
echo  2. Add domain: mail.lynkapp.net (or use sandbox for testing)
echo  3. Add DNS records as instructed by Mailgun
echo  4. Add to ConnectHub-Backend/.env:
echo     MAILGUN_API_KEY=key-YOUR_REAL_KEY
echo     MAILGUN_DOMAIN=mail.lynkapp.net
echo     MAILGUN_FROM=noreply@lynkapp.net
echo  5. Wait up to 24h for DNS propagation
echo.

echo.
echo [Metered.ca TURN Server (for video calls on mobile data)]
findstr /C:"VITE_METERED_API_KEY=your_" "%~dp0.env" >nul 2>&1
if not errorlevel 1 (
    echo STATUS: NOT CONFIGURED
    echo.
    echo TO FIX:
    echo  1. Go to: https://dashboard.metered.ca
    echo  2. Create free account - Create App "LynkApp"
    echo  3. Click Credentials - Copy: API Key, Username, Credential
    echo  4. Add to .env:
    echo     VITE_METERED_API_KEY=your_api_key
    echo     VITE_TURN_USERNAME=your_username
    echo     VITE_TURN_PASSWORD=your_credential
    echo  5. Run: npm run build ^& firebase deploy --only hosting
    echo.
) else (
    echo STATUS: CONFIGURED OK
)

echo.
echo ============================================================
echo  After adding all keys to .env, rebuild and redeploy:
echo.
echo    npm run build
echo    firebase deploy --only hosting
echo.
echo  Then invite your first beta testers!
echo  Share invite link: https://lynkapp.com/invite
echo ============================================================
echo.
pause
