class MatchAnimation {
    constructor() {
        this.isAnimating = false;
    }

    // Create the "It's a Lynk!" match animation with two chain links coming together
    showMatchAnimation(callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'match-overlay';
        overlay.innerHTML = `
            <div class="match-animation-container">
                <div class="chain-links-container">
                    <div class="chain-link left-link">
                        <div class="link-shape">🔗</div>
                    </div>
                    <div class="chain-link right-link">
                        <div class="link-shape">🔗</div>
                    </div>
                </div>
                <div class="match-text-container">
                    <h1 class="match-title">It's a Lynk!</h1>
                    <p class="match-subtitle">You and this person liked each other</p>
                    <div class="match-sparkles">
                        <div class="sparkle sparkle-1">✨</div>
                        <div class="sparkle sparkle-2">✨</div>
                        <div class="sparkle sparkle-3">✨</div>
                        <div class="sparkle sparkle-4">✨</div>
                        <div class="sparkle sparkle-5">✨</div>
                        <div class="sparkle sparkle-6">✨</div>
                    </div>
                </div>
                <div class="match-actions">
                    <button class="match-btn send-message-btn">Send Message</button>
                    <button class="match-btn keep-dating-btn">Keep Dating</button>
                </div>
            </div>
        `;

        // Add CSS if not already present
        if (!document.getElementById('match-animation-styles')) {
            this.addMatchStyles();
        }

        // Add to DOM
        document.body.appendChild(overlay);

        // Trigger animation after a brief delay
        setTimeout(() => {
            overlay.classList.add('show');
            this.playChainLinkAnimation(overlay);
        }, 100);

        // Handle button clicks
        const sendMessageBtn = overlay.querySelector('.send-message-btn');
        const keepDatingBtn = overlay.querySelector('.keep-dating-btn');

        sendMessageBtn.addEventListener('click', () => {
            this.hideMatchAnimation(overlay);
            if (callback) callback('message');
        });

        keepDatingBtn.addEventListener('click', () => {
            this.hideMatchAnimation(overlay);
            if (callback) callback('continue');
        });

        // Auto-hide after 8 seconds if no interaction
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                this.hideMatchAnimation(overlay);
                if (callback) callback('auto');
            }
        }, 8000);
    }

    playChainLinkAnimation(overlay) {
        const leftLink = overlay.querySelector('.left-link');
        const rightLink = overlay.querySelector('.right-link');
        const matchText = overlay.querySelector('.match-text-container');
        const sparkles = overlay.querySelectorAll('.sparkle');

        // Animate chain links coming together
        setTimeout(() => {
            leftLink.classList.add('animate-in');
            rightLink.classList.add('animate-in');
        }, 500);

        // Show "It's a Lynk!" text with bounce effect
        setTimeout(() => {
            matchText.classList.add('show-text');
        }, 1500);

        // Animate sparkles
        setTimeout(() => {
            sparkles.forEach((sparkle, index) => {
                setTimeout(() => {
                    sparkle.classList.add('animate');
                }, index * 200);
            });
        }, 2000);

        // Show action buttons
        setTimeout(() => {
            overlay.querySelector('.match-actions').classList.add('show');
        }, 3000);
    }

    hideMatchAnimation(overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            this.isAnimating = false;
        }, 500);
    }

    addMatchStyles() {
        const style = document.createElement('style');
        style.id = 'match-animation-styles';
        style.textContent = `
            .match-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, 
                    rgba(99, 102, 241, 0.95) 0%, 
                    rgba(139, 92, 246, 0.95) 50%, 
                    rgba(236, 72, 153, 0.95) 100%);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .match-overlay.show {
                opacity: 1;
                transform: scale(1);
            }

            .match-overlay.fade-out {
                opacity: 0;
                transform: scale(0.9);
                transition: all 0.5s ease-in-out;
            }

            .match-animation-container {
                text-align: center;
                color: white;
                max-width: 400px;
                width: 90%;
            }

            .chain-links-container {
                position: relative;
                height: 120px;
                margin-bottom: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            .chain-link {
                position: absolute;
                font-size: 60px;
                transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
            }

            .left-link {
                transform: translateX(-150px) rotate(-45deg) scale(0.8);
                opacity: 0;
            }

            .right-link {
                transform: translateX(150px) rotate(45deg) scale(0.8);
                opacity: 0;
            }

            .left-link.animate-in {
                transform: translateX(-15px) rotate(-15deg) scale(1);
                opacity: 1;
            }

            .right-link.animate-in {
                transform: translateX(15px) rotate(15deg) scale(1);
                opacity: 1;
            }

            .link-shape {
                display: inline-block;
                animation: pulse 2s infinite ease-in-out;
            }

            .match-text-container {
                opacity: 0;
                transform: translateY(50px) scale(0.5);
                transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                margin-bottom: 30px;
                position: relative;
            }

            .match-text-container.show-text {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .match-title {
                font-size: 3rem;
                font-weight: bold;
                margin: 0 0 10px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                background: linear-gradient(45deg, #ffffff, #f0f9ff, #dbeafe);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: titleGlow 2s infinite alternate ease-in-out;
            }

            .match-subtitle {
                font-size: 1.2rem;
                margin: 0;
                opacity: 0.9;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .match-sparkles {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                width: 200px;
                height: 60px;
                pointer-events: none;
            }

            .sparkle {
                position: absolute;
                font-size: 20px;
                opacity: 0;
                transform: scale(0) rotate(0deg);
                transition: all 0.6s ease-out;
            }

            .sparkle.animate {
                opacity: 1;
                transform: scale(1) rotate(360deg);
                animation: sparkleFloat 3s infinite ease-in-out;
            }

            .sparkle-1 { top: 10px; left: 20px; animation-delay: 0s; }
            .sparkle-2 { top: 0px; left: 80px; animation-delay: 0.5s; }
            .sparkle-3 { top: 15px; left: 140px; animation-delay: 1s; }
            .sparkle-4 { top: 30px; left: 40px; animation-delay: 0.3s; }
            .sparkle-5 { top: 25px; left: 100px; animation-delay: 0.8s; }
            .sparkle-6 { top: 35px; left: 160px; animation-delay: 1.2s; }

            .match-actions {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.5s ease-out;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .match-actions.show {
                opacity: 1;
                transform: translateY(0);
            }

            .match-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 140px;
                position: relative;
                overflow: hidden;
            }

            .send-message-btn {
                background: linear-gradient(45deg, #10b981, #059669);
                color: white;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }

            .send-message-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
            }

            .keep-dating-btn {
                background: linear-gradient(45deg, #ffffff, #f8fafc);
                color: #6366f1;
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.4);
            }

            .keep-dating-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 255, 255, 0.6);
                background: linear-gradient(45deg, #f8fafc, #e2e8f0);
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes titleGlow {
                0% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
                100% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(99, 102, 241, 0.3); }
            }

            @keyframes sparkleFloat {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-10px) scale(1.2); }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .match-title {
                    font-size: 2.5rem;
                }
                
                .match-subtitle {
                    font-size: 1rem;
                }
                
                .chain-link {
                    font-size: 50px;
                }
                
                .match-btn {
                    min-width: 120px;
                    padding: 10px 20px;
                    font-size: 14px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatchAnimation;
}

// Make available globally
window.MatchAnimation = MatchAnimation;
