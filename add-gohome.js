const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'LynkApp-Production-App', 'js', 'user-testing-fixes.js');
let content = fs.readFileSync(file, 'utf8');

// Check if goHome already exists
if (content.includes('window.goHome')) {
    console.log('goHome already exists in file.');
    process.exit(0);
}

const goHomeCode = `
    // ===== BACK BUTTON: goHome() navigates to feed screen =====
    window.goHome = function() {
        if (typeof openScreen === 'function') {
            openScreen('feed');
        } else {
            document.querySelectorAll('.screen').forEach(function(s) {
                s.classList.remove('active');
            });
            var feed = document.getElementById('feed-screen') || document.querySelector('.screen');
            if (feed) feed.classList.add('active');
        }
    };

`;

// Insert before the closing })();
content = content.replace('})();', goHomeCode + '})();');

fs.writeFileSync(file, content, 'utf8');
console.log('SUCCESS: goHome() function added to user-testing-fixes.js');
