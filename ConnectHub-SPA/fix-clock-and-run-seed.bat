@echo off
title LynkApp - Fix Service Key + Seed Demo Content
cd /d "%~dp0"
echo ============================================
echo  Fix serviceAccountKey.json + Seed Data
echo ============================================
echo.

echo [1/2] Repairing serviceAccountKey.json...
powershell -Command "$raw = [System.IO.File]::ReadAllText('serviceAccountKey.json', [System.Text.Encoding]::UTF8); try { $null = $raw | ConvertFrom-Json; Write-Host 'JSON valid - no repair needed' } catch { $fixed = [System.Text.RegularExpressions.Regex]::Replace($raw, '(?<=""private_key""\:\s*"")([\\s\\S]*?)(?="",)', { param($m) $m.Value -replace \""\`r\`n\"", '\\n' -replace \""\`n\"", '\\n' -replace \""\`r\"", '\\n' }); [System.IO.File]::WriteAllText('serviceAccountKey.json', $fixed, [System.Text.Encoding]::UTF8); Write-Host 'JSON repaired!' }"

echo.
echo [2/2] Seeding demo content...
node seed-demo-content.cjs 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Seed failed. Check Firebase connection.
) else (
  echo ✅ Demo content seeded successfully!
)
pause
