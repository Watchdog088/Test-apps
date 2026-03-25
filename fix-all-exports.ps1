# fix-all-exports.ps1
# Bulk-fix all ES module import/export statements in service + js files
# loaded as regular <script> tags - these cause SyntaxErrors in non-module scripts

$servicesDir = "c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Frontend\src\services"
$jsDir       = "c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Frontend\src\js"

# ── STEP 1: Fix all *.js in services ─────────────────────────────────────────
Write-Host "`n=== Fixing services/*.js ===" -ForegroundColor Cyan
Get-ChildItem -Path $servicesDir -Filter "*.js" | ForEach-Object {
    $path    = $_.FullName
    $content = Get-Content $path -Raw -Encoding UTF8

    $before = $content

    # Comment out: export default <name>;
    $content = $content -replace '(?m)^export default ', '// export default '

    # Comment out: export { ... };  (named exports - start of line)
    $content = $content -replace '(?m)^export \{', '// export {'

    # Comment out: import <name> from '...';
    $content = $content -replace "(?m)^import (\w+) from '(.+)';", "// import `$1 from '`$2';"

    if ($content -ne $before) {
        Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# ── STEP 2: Fix all *.js in src/js ───────────────────────────────────────────
Write-Host "`n=== Fixing src/js/*.js ===" -ForegroundColor Cyan
Get-ChildItem -Path $jsDir -Filter "*.js" | ForEach-Object {
    $path    = $_.FullName
    $content = Get-Content $path -Raw -Encoding UTF8
    $before  = $content

    $content = $content -replace '(?m)^export \{', '// export {'

    if ($content -ne $before) {
        Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# ── STEP 3: mobile-app-integration.js — replace commented imports with window.* ──
Write-Host "`n=== Patching mobile-app-integration.js imports ===" -ForegroundColor Cyan
$mobileFile = "$servicesDir\mobile-app-integration.js"
$content    = Get-Content $mobileFile -Raw -Encoding UTF8

$content = $content -replace "// import (\w+) from '\.\/(\w[^']+)';",'const $1 = window.$1;'

Set-Content -Path $mobileFile -Value $content -Encoding UTF8 -NoNewline
Write-Host "  Patched: mobile-app-integration.js" -ForegroundColor Green

Write-Host "`n=== All fixes applied! ===" -ForegroundColor Yellow
