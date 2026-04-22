/**
 * LynkApp Splash Init — v3
 * Acts as a final FALLBACK only.
 * The inline <head> script already dismisses the splash at 2.5s.
 * This fires at 4s as an absolute hard deadline in case the head
 * script was somehow blocked (very rare), then at 6s regardless.
 * The window.load + 3s pattern was REMOVED because it caused an
 * additional 3–10 second delay on slower connections.
 */
(function () {
    var _splashDone = false;

    function _forceSplash() {
        if (_splashDone) return;
        _splashDone = true;
        var s = document.getElementById('splashScreen');
        var l = document.getElementById('loginScreen');
        if (s) {
            s.style.transition = 'opacity 0.5s ease';
            s.style.opacity = '0';
            setTimeout(function () { s.style.display = 'none'; }, 500);
        }
        if (l) {
            l.classList.remove('hidden');
            l.style.display = 'flex';
        }
    }

    /* 4 s fallback (head script fires at 2.5 s, so this only kicks in if that failed) */
    setTimeout(_forceSplash, 4000);

    /* 6 s absolute deadline — no matter what, the splash will be gone */
    setTimeout(function () {
        var s = document.getElementById('splashScreen');
        if (s && s.style.display !== 'none') {
            _splashDone = false; /* allow re-run */
            _forceSplash();
        }
    }, 6000);
})();
