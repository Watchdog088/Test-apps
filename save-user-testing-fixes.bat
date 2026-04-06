@echo off
echo ================================================
echo  LynkApp – Save User-Testing Fixes to GitHub
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking git status...
git status --short
echo.

echo [2/4] Staging changed files...
git add LynkApp-Production-App/js/user-testing-fixes.js
git add ConnectHub-Frontend/src/js/user-testing-fixes.js
git add LynkApp-Production-App/index.html
echo Files staged.
echo.

echo [3/4] Committing...
git commit -m "fix: user-testing bugs v2 – 7 fixes + comment section deduplication

- Fix 1: Full profile setup wizard shown after Sign Up (name/username/bio/
          photo/interests/location/DOB collected before entering the app)
- Fix 2: Post button now targets correct #postTextContent textarea and
          publishes the card into the feed
- Fix 3: Add Location modal now has a text input + 'Add Location' confirm
          button for custom entries
- Fix 4: Tag People modal now has a search box + 'Done - Add People' button
- Fix 5: Comments – wires up existing #commentInputField / submitComment()
          instead of injecting a duplicate input row (fixes duplicate UI);
          send button resized to 42px round circle, input spans full width
- Fix 6: Share button opens #sharePostModal (or fallback sheet with all
          social options + copy-link)
- Fix 7: Create Story picker – real getUserMedia camera preview with capture/
          flip, real file picker for gallery, and text-story gradient editor"

echo.
echo [4/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo Push to main failed, trying master...
    git push origin master
)

echo.
echo ================================================
echo  Done! All user-testing fixes saved to GitHub.
echo ================================================
pause
