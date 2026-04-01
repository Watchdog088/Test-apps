    (function() {
        var _splashDone = false;
        function _forceSplash() {
            if (_splashDone) return;
            _splashDone = true;
            var s = document.getElementById('splashScreen');
            var l = document.getElementById('loginScreen');
            if (s) { s.style.opacity = '0'; s.style.transition = 'opacity 0.5s ease'; setTimeout(function(){ s.style.display = 'none'; }, 500); }
            if (l) { l.classList.remove('hidden'); l.style.display = 'flex'; }
        }
        setTimeout(_forceSplash, 3000);
        window.addEventListener('load', function(){ setTimeout(_forceSplash, 3000); });
    })();