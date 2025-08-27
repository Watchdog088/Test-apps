/**
 * AI & Automation UI Components
 * ConnectHub - Advanced AI and Automation Interface System
 * 
 * This file contains 3 comprehensive AI/Automation UI interfaces:
 * 1. AI Assistant Chat Interface
 * 2. AI Content Moderation Dashboard  
 * 3. Automation Rules Manager Interface
 */

class AIAutomationUIComponents {
    constructor() {
        this.currentChatSession = null;
        this.moderationFilters = {
            toxicity: true,
            spam: true,
            harassment: false,
            adultContent: true,
            violence: true
        };
        this.automationRules = [];
        this.aiChatHistory = [];
    }

    /**
     * 1. AI ASSISTANT CHAT INTERFACE
     * Advanced AI chatbot interface with natural language processing,
     * context awareness, and multi-purpose assistance capabilities
     */
    createAIAssistantChatInterface(containerId = 'ai-automation-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const chatInterface = document.createElement('div');
        chatInterface.className = 'ai-chat-interface';
        chatInterface.innerHTML = `
            <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 24px; overflow: hidden; max-width: 800px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                <!-- Chat Header -->
                <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; padding: 2rem; text-align: center; position: relative;">
                    <button id="closeChatInterface" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.8rem;">ConnectHub AI Assistant</h2>
                    <p style="margin: 0; opacity: 0.9;">Your intelligent companion for navigating ConnectHub</p>
                    <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">💬 Smart Conversations</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">🎯 Personalized Help</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">🚀 Feature Discovery</span>
                    </div>
                </div>

                <!-- Quick Action Buttons -->
                <div style="background: var(--glass); padding: 1.5rem; border-bottom: 1px solid var(--glass-border);">
                    <h4 style="margin: 0 0 1rem 0; color: var(--primary);">✨ Quick Actions</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <button class="ai-quick-action" onclick="aiAutomationUI.sendQuickMessage('How do I find matches?')" style="background: var(--primary); color: white; border: none; padding: 0.8rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">💕 Dating Help</button>
                        <button class="ai-quick-action" onclick="aiAutomationUI.sendQuickMessage('Show me privacy settings')" style="background: var(--secondary); color: white; border: none; padding: 0.8rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">🔒 Privacy Guide</button>
                        <button class="ai-quick-action" onclick="aiAutomationUI.sendQuickMessage('Help me create content')" style="background: var(--accent); color: white; border: none; padding: 0.8rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">📝 Content Creation</button>
                        <button class="ai-quick-action" onclick="aiAutomationUI.sendQuickMessage('Platform tutorial')" style="background: var(--warning); color: white; border: none; padding: 0.8rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">🎓 Platform Tour</button>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div id="aiChatMessages" style="height: 400px; overflow-y: auto; padding: 1.5rem; background: var(--bg-secondary);">
                    <!-- Welcome Message -->
                    <div class="ai-message" style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">🤖</div>
                        <div style="background: white; padding: 1rem 1.5rem; border-radius: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex: 1; animation: fadeInUp 0.5s ease;">
                            <div style="color: var(--text-primary); line-height: 1.5;">
                                <strong>Hello! I'm your AI Assistant! 👋</strong><br><br>
                                I'm here to help you navigate ConnectHub, answer questions, and make your experience amazing. I can help with:
                                <ul style="margin: 0.5rem 0; padding-left: 1rem;">
                                    <li>Finding the right features for you</li>
                                    <li>Optimizing your profile and content</li>
                                    <li>Privacy and security guidance</li>
                                    <li>Troubleshooting any issues</li>
                                    <li>Platform tips and tricks</li>
                                </ul>
                                What would you like to know? 😊
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Input Area -->
                <div style="background: var(--bg-card); padding: 1.5rem; border-top: 1px solid var(--glass-border);">
                    <div style="display: flex; gap: 1rem; align-items: flex-end;">
                        <div style="flex: 1; position: relative;">
                            <textarea id="aiChatInput" placeholder="Ask me anything about ConnectHub..." style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 16px; background: white; color: var(--text-primary); resize: none; min-height: 50px; max-height: 120px; font-family: inherit; transition: border-color 0.3s ease;" rows="1" onkeydown="aiAutomationUI.handleChatKeydown(event)" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--glass-border)'"></textarea>
                            <div style="position: absolute; bottom: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                                <button onclick="aiAutomationUI.attachFile()" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.3s ease;" title="Attach file">📎</button>
                                <button onclick="aiAutomationUI.openEmojiPicker()" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.3s ease;" title="Add emoji">😊</button>
                            </div>
                        </div>
                        <button id="sendAiMessage" onclick="aiAutomationUI.sendAIMessage()" style="background: var(--primary); color: white; border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; font-size: 1.3rem; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🚀</button>
                    </div>
                    
                    <!-- Typing Indicator -->
                    <div id="typingIndicator" style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem; font-style: italic; opacity: 0; transition: opacity 0.3s ease;">
                        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
                            🤖 AI Assistant is thinking
                            <div class="typing-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </span>
                    </div>
                </div>

                <!-- AI Capabilities Footer -->
                <div style="background: var(--glass); padding: 1rem; text-align: center; font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid var(--glass-border);">
                    <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                        <span>🧠 Context Awareness</span>
                        <span>🌐 Multi-language Support</span>
                        <span>🎯 Personalized Responses</span>
                        <span>⚡ Real-time Learning</span>
                    </div>
                </div>
            </div>

            <style>
                .ai-quick-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .typing-dots span {
                    animation: typingDots 1.4s infinite;
                }
                
                .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typingDots {
                    0%, 60%, 100% { opacity: 0.3; }
                    30% { opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;

        container.innerHTML = '';
        container.appendChild(chatInterface);

        // Add event listeners
        document.getElementById('closeChatInterface').addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('AI Assistant closed', 'info');
            }
            container.innerHTML = '';
        });

        // Auto-resize textarea
        const textarea = document.getElementById('aiChatInput');
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        this.scrollChatToBottom();
    }

    /**
     * 2. AI CONTENT MODERATION DASHBOARD
     * Comprehensive AI-powered content moderation interface with 
     * real-time monitoring, filtering options, and review capabilities
     */
    createAIContentModerationDashboard(containerId = 'ai-automation-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const moderationDashboard = document.createElement('div');
        moderationDashboard.className = 'ai-moderation-dashboard';
        moderationDashboard.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Dashboard Header -->
                <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 2rem; position: relative;">
                    <button id="closeModerationDashboard" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">✕</button>
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="font-size: 3rem;">🛡️</div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem;">AI Content Moderation</h2>
                            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Intelligent content filtering and safety management</p>
                        </div>
                    </div>
                    
                    <!-- Moderation Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">12,847</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Posts Reviewed</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">234</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Flagged Content</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">98.7%</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Accuracy Rate</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">45</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Pending Review</div>
                        </div>
                    </div>
                </div>

                <!-- Main Dashboard Content -->
                <div style="padding: 2rem;">
                    <!-- Moderation Controls -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            ⚙️ AI Moderation Settings
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <!-- Toxicity Detection -->
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <div>
                                        <h4 style="margin: 0; color: var(--text-primary);">🚫 Toxicity Detection</h4>
                                        <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Detect harmful and toxic language</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked onchange="aiAutomationUI.toggleModerationFilter('toxicity', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div style="margin-top: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Sensitivity Level:</label>
                                    <input type="range" min="1" max="100" value="75" style="width: 100%; accent-color: var(--primary);" onchange="aiAutomationUI.updateSensitivity('toxicity', this.value)">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                                        <span>Lenient</span>
                                        <span>Strict</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Spam Detection -->
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <div>
                                        <h4 style="margin: 0; color: var(--text-primary);">📧 Spam Detection</h4>
                                        <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Identify promotional and spam content</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked onchange="aiAutomationUI.toggleModerationFilter('spam', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div style="margin-top: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Sensitivity Level:</label>
                                    <input type="range" min="1" max="100" value="60" style="width: 100%; accent-color: var(--primary);" onchange="aiAutomationUI.updateSensitivity('spam', this.value)">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                                        <span>Lenient</span>
                                        <span>Strict</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Adult Content -->
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <div>
                                        <h4 style="margin: 0; color: var(--text-primary);">🔞 Adult Content</h4>
                                        <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Filter inappropriate adult material</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked onchange="aiAutomationUI.toggleModerationFilter('adultContent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div style="margin-top: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Sensitivity Level:</label>
                                    <input type="range" min="1" max="100" value="85" style="width: 100%; accent-color: var(--primary);" onchange="aiAutomationUI.updateSensitivity('adultContent', this.value)">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                                        <span>Lenient</span>
                                        <span>Strict</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Flagged Content -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            🚨 Recent Flagged Content
                            <span style="background: var(--error); color: white; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 10px; font-weight: normal;">45 Pending</span>
                        </h3>
                        
                        <div id="flaggedContentList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <!-- Flagged Content Items -->
                            <div style="background: white; border: 1px solid #fee2e2; border-radius: 16px; padding: 1.5rem; border-left: 4px solid #ef4444;">
                                <div style="display: flex; justify-content: between; align-items: flex-start; gap: 1rem;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                            <div style="width: 40px; height: 40px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">⚠️</div>
                                            <div>
                                                <h5 style="margin: 0; color: #ef4444;">High Toxicity Detected</h5>
                                                <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Posted by @user123 • 5 minutes ago</p>
                                            </div>
                                        </div>
                                        <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-family: monospace; color: #991b1b;">
                                            "This is offensive content that contains hate speech and toxic language..."
                                        </div>
                                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                            <span style="background: #fee2e2; color: #991b1b; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Toxicity: 94%</span>
                                            <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Harassment: 67%</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 120px;">
                                        <button onclick="aiAutomationUI.approveContent(this)" style="background: var(--success); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">✅ Approve</button>
                                        <button onclick="aiAutomationUI.rejectContent(this)" style="background: var(--error); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">❌ Remove</button>
                                        <button onclick="aiAutomationUI.reviewLater(this)" style="background: var(--warning); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">⏰ Later</button>
                                    </div>
                                </div>
                            </div>

                            <div style="background: white; border: 1px solid #fef3c7; border-radius: 16px; padding: 1.5rem; border-left: 4px solid #f59e0b;">
                                <div style="display: flex; justify-content: between; align-items: flex-start; gap: 1rem;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                            <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">📧</div>
                                            <div>
                                                <h5 style="margin: 0; color: #f59e0b;">Potential Spam Content</h5>
                                                <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Posted by @marketingbot • 12 minutes ago</p>
                                            </div>
                                        </div>
                                        <div style="background: #fffbeb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-family: monospace; color: #92400e;">
                                            "🎉 AMAZING OFFER! Buy now and get 50% off! Limited time only! Click here now!!!"
                                        </div>
                                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                            <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Spam: 89%</span>
                                            <span style="background: #ddd6fe; color: #7c3aed; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Commercial: 95%</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 120px;">
                                        <button onclick="aiAutomationUI.approveContent(this)" style="background: var(--success); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">✅ Approve</button>
                                        <button onclick="aiAutomationUI.rejectContent(this)" style="background: var(--error); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">❌ Remove</button>
                                        <button onclick="aiAutomationUI.reviewLater(this)" style="background: var(--warning); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">⏰ Later</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div>
                        <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            ⚡ Quick Actions
                        </h3>
                        
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button onclick="aiAutomationUI.reviewAllFlagged()" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">📋 Review All Flagged</button>
                            <button onclick="aiAutomationUI.exportModerationReport()" style="background: var(--secondary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">📊 Export Report</button>
                            <button onclick="aiAutomationUI.updateModerationRules()" style="background: var(--accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">⚙️ Update Rules</button>
                            <button onclick="aiAutomationUI.trainModerationModel()" style="background: var(--warning); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">🧠 Train Model</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.3s;
                    border-radius: 24px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: var(--primary);
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
            </style>
        `;

        container.innerHTML = '';
        container.appendChild(moderationDashboard);

        // Add event listeners
        document.getElementById('closeModerationDashboard').addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('Content Moderation Dashboard closed', 'info');
            }
            container.innerHTML = '';
        });
    }

    /**
     * 3. AUTOMATION RULES MANAGER INTERFACE
     * Advanced automation system for creating, managing, and executing 
     * automated workflows and business rules
     */
    createAutomationRulesManager(containerId = 'ai-automation-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const automationInterface = document.createElement('div');
        automationInterface.className = 'automation-rules-manager';
        automationInterface.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; padding: 2rem; position: relative;">
                    <button id="closeAutomationManager" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">✕</button>
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="font-size: 3rem;">⚡</div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem;">Automation Rules Manager</h2>
                            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Create and manage intelligent automation workflows</p>
                        </div>
                    </div>
                    
                    <!-- Automation Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">23</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Active Rules</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">1,847</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Tasks Executed</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">97.3%</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Success Rate</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">5</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Failed Tasks</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div style="padding: 2rem;">
                    <!-- Rule Creation Section -->
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3 style="color: var(--primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                🔧 Create New Automation Rule
                            </h3>
                            <button onclick="aiAutomationUI.showRuleTemplates()" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">📋 Use Template</button>
                        </div>

                        <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 16px; padding: 2rem;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                                <!-- Trigger Section -->
                                <div>
                                    <h4 style="margin: 0 0 1rem 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                                        🎯 When (Trigger)
                                    </h4>
                                    <select id="triggerType" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary); margin-bottom: 1rem;" onchange="aiAutomationUI.updateTriggerOptions(this.value)">
                                        <option value="">Select trigger type...</option>
                                        <option value="newUser">New User Registers</option>
                                        <option value="newPost">New Post Created</option>
                                        <option value="newMatch">New Dating Match</option>
                                        <option value="userInactive">User Inactive for X Days</option>
                                        <option value="contentFlagged">Content Gets Flagged</option>
                                        <option value="timeScheduled">Scheduled Time</option>
                                        <option value="userAction">Specific User Action</option>
                                    </select>
                                    
                                    <div id="triggerOptions" style="display: none;">
                                        <!-- Dynamic trigger options will appear here -->
                                    </div>
                                </div>

                                <!-- Action Section -->
                                <div>
                                    <h4 style="margin: 0 0 1rem 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                                        ⚡ Then (Action)
                                    </h4>
                                    <select id="actionType" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary); margin-bottom: 1rem;" onchange="aiAutomationUI.updateActionOptions(this.value)">
                                        <option value="">Select action type...</option>
                                        <option value="sendEmail">Send Email</option>
                                        <option value="sendNotification">Send In-App Notification</option>
                                        <option value="assignBadge">Assign User Badge</option>
                                        <option value="addToGroup">Add to Group</option>
                                        <option value="sendMessage">Send Automated Message</option>
                                        <option value="moderateContent">Moderate Content</option>
                                        <option value="updateProfile">Update User Profile</option>
                                        <option value="createTask">Create Admin Task</option>
                                    </select>
                                    
                                    <div id="actionOptions" style="display: none;">
                                        <!-- Dynamic action options will appear here -->
                                    </div>
                                </div>
                            </div>

                            <!-- Rule Details -->
                            <div style="margin-bottom: 2rem;">
                                <h4 style="margin: 0 0 1rem 0; color: var(--text-primary);">📝 Rule Details</h4>
                                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                                    <input type="text" id="ruleName" placeholder="Enter rule name..." style="padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                                    <select id="rulePriority" style="padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                                        <option value="low">Low Priority</option>
                                        <option value="medium" selected>Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>
                                <textarea id="ruleDescription" placeholder="Describe what this rule does..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary); min-height: 80px; resize: vertical; font-family: inherit;"></textarea>
                            </div>

                            <!-- Rule Controls -->
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                                        <input type="checkbox" id="ruleActive" checked>
                                        <span>Active immediately</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                                        <input type="checkbox" id="ruleNotifications">
                                        <span>Send notifications</span>
                                    </label>
                                </div>
                                <div style="display: flex; gap: 1rem;">
                                    <button onclick="aiAutomationUI.testRule()" style="background: var(--secondary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500;">🧪 Test Rule</button>
                                    <button onclick="aiAutomationUI.saveRule()" style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500;">💾 Save Rule</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Existing Rules Section -->
                    <div>
                        <h3 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            📋 Existing Automation Rules
                            <span style="background: var(--success); color: white; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 10px; font-weight: normal;">23 Active</span>
                        </h3>

                        <div id="existingRulesList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <!-- Active Rule -->
                            <div style="background: white; border: 1px solid #dcfce7; border-radius: 16px; padding: 1.5rem; border-left: 4px solid #22c55e;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                            <div style="width: 40px; height: 40px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">✅</div>
                                            <div>
                                                <h5 style="margin: 0; color: #22c55e; display: flex; align-items: center; gap: 0.5rem;">
                                                    Welcome New Users
                                                    <span style="background: #dcfce7; color: #15803d; padding: 0.15rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: normal;">ACTIVE</span>
                                                </h5>
                                                <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Created 15 days ago • High Priority</p>
                                            </div>
                                        </div>
                                        <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                            <p style="margin: 0; color: #15803d; font-size: 0.9rem; line-height: 1.4;">
                                                <strong>When:</strong> New user registers → <strong>Then:</strong> Send welcome email + assign "New Member" badge + add to "Welcome Group"
                                            </p>
                                        </div>
                                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                                            <span style="background: #dcfce7; color: #15803d; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Executed: 247 times</span>
                                            <span style="background: #dbeafe; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Success: 99.6%</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 120px;">
                                        <button onclick="aiAutomationUI.editRule(1)" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">✏️ Edit</button>
                                        <button onclick="aiAutomationUI.pauseRule(1)" style="background: var(--warning); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">⏸️ Pause</button>
                                        <button onclick="aiAutomationUI.deleteRule(1)" style="background: var(--error); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Paused Rule -->
                            <div style="background: white; border: 1px solid #fef3c7; border-radius: 16px; padding: 1.5rem; border-left: 4px solid #f59e0b;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                            <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">⏸️</div>
                                            <div>
                                                <h5 style="margin: 0; color: #f59e0b; display: flex; align-items: center; gap: 0.5rem;">
                                                    Inactive User Reminder
                                                    <span style="background: #fef3c7; color: #92400e; padding: 0.15rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: normal;">PAUSED</span>
                                                </h5>
                                                <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">Created 8 days ago • Medium Priority</p>
                                            </div>
                                        </div>
                                        <div style="background: #fffbeb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                            <p style="margin: 0; color: #92400e; font-size: 0.9rem; line-height: 1.4;">
                                                <strong>When:</strong> User inactive for 7 days → <strong>Then:</strong> Send re-engagement email + push notification
                                            </p>
                                        </div>
                                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                                            <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Executed: 89 times</span>
                                            <span style="background: #dbeafe; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">Success: 94.4%</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 120px;">
                                        <button onclick="aiAutomationUI.editRule(2)" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">✏️ Edit</button>
                                        <button onclick="aiAutomationUI.resumeRule(2)" style="background: var(--success); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">▶️ Resume</button>
                                        <button onclick="aiAutomationUI.deleteRule(2)" style="background: var(--error); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(automationInterface);

        // Add event listeners
        document.getElementById('closeAutomationManager').addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('Automation Rules Manager closed', 'info');
            }
            container.innerHTML = '';
        });
    }

    // AI Chat Helper Methods
    handleChatKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendAIMessage();
        }
    }

    sendQuickMessage(message) {
        const chatMessages = document.getElementById('aiChatMessages');
        const input = document.getElementById('aiChatInput');
        
        if (input) {
            input.value = message;
        }
        
        this.sendAIMessage();
    }

    sendAIMessage() {
        const input = document.getElementById('aiChatInput');
        const chatMessages = document.getElementById('aiChatMessages');
        
        if (!input || !chatMessages) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: flex-end;';
        userMessage.innerHTML = `
            <div style="background: var(--primary); color: white; padding: 1rem 1.5rem; border-radius: 18px; max-width: 70%; animation: fadeInUp 0.5s ease;">
                ${message}
            </div>
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; flex-shrink: 0;">👤</div>
        `;
        
        chatMessages.appendChild(userMessage);
        input.value = '';
        input.style.height = 'auto';
        
        this.showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addAIResponse(this.generateAIResponse(message));
        }, 1500);
        
        this.scrollChatToBottom();
    }

    generateAIResponse(userMessage) {
        const responses = {
            'dating': 'Great question about dating! 💕 To find better matches, I recommend:\n\n1. Complete your profile with recent photos\n2. Write an engaging bio that shows your personality\n3. Set your preferences in the dating settings\n4. Be active - like and message people you\'re interested in\n\nWould you like me to help you optimize any specific part of your dating profile?',
            'privacy': 'Privacy is super important! 🔒 Here are your key privacy controls:\n\n• **Profile Visibility**: Control who can see your profile\n• **Message Settings**: Choose who can message you\n• **Location Sharing**: Manage location data\n• **Data Controls**: Download or delete your data\n\nWould you like me to walk you through any specific privacy setting?',
            'content': 'I\'d love to help with content creation! 📝 Here are some tips:\n\n• **Post regularly** to stay visible\n• **Use relevant hashtags** to reach more people\n• **Engage with others** - like and comment on posts\n• **Share authentic content** that reflects your personality\n• **Post at optimal times** when your audience is active\n\nWhat type of content would you like to create?',
            'tutorial': 'Welcome to ConnectHub! 🎓 Let me give you a quick tour:\n\n**🏠 Home**: Your main feed and posts\n**💕 Dating**: Swipe and find matches\n**🎵 Media**: Music, videos, and live streaming\n**🎮 Games**: Play games and compete\n**🛒 Shop**: Browse the marketplace\n\nWhich feature would you like to explore first?'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('match') || lowerMessage.includes('dating')) {
            return responses.dating;
        } else if (lowerMessage.includes('privacy') || lowerMessage.includes('setting')) {
            return responses.privacy;
        } else if (lowerMessage.includes('content') || lowerMessage.includes('post')) {
            return responses.content;
        } else if (lowerMessage.includes('tutorial') || lowerMessage.includes('tour') || lowerMessage.includes('help')) {
            return responses.tutorial;
        } else {
            return `I understand you're asking about "${userMessage}". 🤖\n\nI'm here to help with:\n• Platform navigation and features\n• Dating and matching tips\n• Privacy and security settings\n• Content creation guidance\n• Troubleshooting issues\n\nCould you be more specific about what you'd like help with?`;
        }
    }

    addAIResponse(message) {
        const chatMessages = document.getElementById('aiChatMessages');
        if (!chatMessages) return;
        
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';
        aiMessage.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1.5rem;';
        aiMessage.innerHTML = `
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">🤖</div>
            <div style="background: white; padding: 1rem 1.5rem; border-radius: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex: 1; animation: fadeInUp 0.5s ease;">
                <div style="color: var(--text-primary); line-height: 1.5; white-space: pre-line;">
                    ${message}
                </div>
            </div>
        `;
        
        chatMessages.appendChild(aiMessage);
        this.scrollChatToBottom();
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.opacity = '1';
        }
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.opacity = '0';
        }
    }

    scrollChatToBottom() {
        setTimeout(() => {
            const chatMessages = document.getElementById('aiChatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 100);
    }

    attachFile() {
        if (typeof showToast === 'function') {
            showToast('File attachment feature coming soon!', 'info');
        }
    }

    openEmojiPicker() {
        if (typeof showToast === 'function') {
            showToast('Emoji picker feature coming soon!', 'info');
        }
    }

    // Content Moderation Methods
    toggleModerationFilter(filterType, enabled) {
        this.moderationFilters[filterType] = enabled;
        if (typeof showToast === 'function') {
            const status = enabled ? 'enabled' : 'disabled';
            showToast(`${filterType} detection ${status}`, enabled ? 'success' : 'warning');
        }
    }

    updateSensitivity(filterType, value) {
        if (typeof showToast === 'function') {
            showToast(`${filterType} sensitivity updated to ${value}%`, 'info');
        }
    }

    approveContent(button) {
        const contentItem = button.closest('div[style*="border-left: 4px solid"]');
        if (contentItem) {
            contentItem.style.opacity = '0.5';
            setTimeout(() => {
                contentItem.remove();
            }, 300);
        }
        if (typeof showToast === 'function') {
            showToast('Content approved', 'success');
        }
    }

    rejectContent(button) {
        const contentItem = button.closest('div[style*="border-left: 4px solid"]');
        if (contentItem) {
            contentItem.style.opacity = '0.5';
            setTimeout(() => {
                contentItem.remove();
            }, 300);
        }
        if (typeof showToast === 'function') {
            showToast('Content removed', 'error');
        }
    }

    reviewLater(button) {
        if (typeof showToast === 'function') {
            showToast('Content marked for later review', 'info');
        }
    }

    reviewAllFlagged() {
        if (typeof showToast === 'function') {
            showToast('Opening bulk review interface...', 'info');
        }
    }

    exportModerationReport() {
        if (typeof showToast === 'function') {
            showToast('Exporting moderation report...', 'info');
        }
    }

    updateModerationRules() {
        if (typeof showToast === 'function') {
            showToast('Opening rule configuration...', 'info');
        }
    }

    trainModerationModel() {
        if (typeof showToast === 'function') {
            showToast('Starting AI model training...', 'info');
        }
    }

    // Automation Rules Methods
    showRuleTemplates() {
        if (typeof showToast === 'function') {
            showToast('Opening rule templates...', 'info');
        }
    }

    updateTriggerOptions(triggerType) {
        const triggerOptions = document.getElementById('triggerOptions');
        if (!triggerOptions) return;

        let optionsHTML = '';
        
        switch(triggerType) {
            case 'newUser':
                optionsHTML = `
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">User Registration Method:</label>
                    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                        <option value="any">Any Registration</option>
                        <option value="email">Email Registration</option>
                        <option value="social">Social Login</option>
                    </select>
                `;
                break;
            case 'userInactive':
                optionsHTML = `
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Inactive Duration (days):</label>
                    <input type="number" min="1" max="365" value="7" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                `;
                break;
            case 'timeScheduled':
                optionsHTML = `
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Schedule Type:</label>
                    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary); margin-bottom: 1rem;">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="once">One-time</option>
                    </select>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Time:</label>
                    <input type="time" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                `;
                break;
        }

        triggerOptions.innerHTML = optionsHTML;
        triggerOptions.style.display = triggerType ? 'block' : 'none';
    }

    updateActionOptions(actionType) {
        const actionOptions = document.getElementById('actionOptions');
        if (!actionOptions) return;

        let optionsHTML = '';
        
        switch(actionType) {
            case 'sendEmail':
                optionsHTML = `
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Email Template:</label>
                    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary); margin-bottom: 1rem;">
                        <option value="welcome">Welcome Email</option>
                        <option value="reminder">Reminder Email</option>
                        <option value="notification">Notification Email</option>
                        <option value="custom">Custom Template</option>
                    </select>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Subject:</label>
                    <input type="text" placeholder="Email subject..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                `;
                break;
            case 'assignBadge':
                optionsHTML = `
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Badge Type:</label>
                    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                        <option value="new-member">🆕 New Member</option>
                        <option value="active-user">⭐ Active User</option>
                        <option value="top-contributor">🏆 Top Contributor</option>
                        <option value="verified">✅ Verified</option>
                        <option value="custom">🎯 Custom Badge</option>
                    </select>
                `;
                break;
            case 'addToGroup':
                optionsHTML = `
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Target Group:</label>
                    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: white; color: var(--text-primary);">
                        <option value="welcome">Welcome Group</option>
                        <option value="new-users">New Users</option>
                        <option value="general">General Discussion</option>
                        <option value="announcements">Announcements</option>
                    </select>
                `;
                break;
        }

        actionOptions.innerHTML = optionsHTML;
        actionOptions.style.display = actionType ? 'block' : 'none';
    }

    testRule() {
        if (typeof showToast === 'function') {
            showToast('Testing automation rule...', 'info');
            setTimeout(() => {
                showToast('Rule test completed successfully! ✅', 'success');
            }, 2000);
        }
    }

    saveRule() {
        const ruleName = document.getElementById('ruleName')?.value;
        const triggerType = document.getElementById('triggerType')?.value;
        const actionType = document.getElementById('actionType')?.value;
        
        if (!ruleName || !triggerType || !actionType) {
            if (typeof showToast === 'function') {
                showToast('Please fill in all required fields', 'warning');
            }
            return;
        }

        const rule = {
            id: Date.now(),
            name: ruleName,
            trigger: triggerType,
            action: actionType,
            active: document.getElementById('ruleActive')?.checked || false,
            notifications: document.getElementById('ruleNotifications')?.checked || false,
            priority: document.getElementById('rulePriority')?.value || 'medium',
            description: document.getElementById('ruleDescription')?.value || ''
        };

        this.automationRules.push(rule);
        
        if (typeof showToast === 'function') {
            showToast(`Rule "${ruleName}" saved successfully!`, 'success');
        }

        // Clear form
        document.getElementById('ruleName').value = '';
        document.getElementById('triggerType').value = '';
        document.getElementById('actionType').value = '';
        document.getElementById('ruleDescription').value = '';
        this.updateTriggerOptions('');
        this.updateActionOptions('');
    }

    editRule(ruleId) {
        if (typeof showToast === 'function') {
            showToast(`Editing rule ${ruleId}...`, 'info');
        }
    }

    pauseRule(ruleId) {
        if (typeof showToast === 'function') {
            showToast(`Rule ${ruleId} paused`, 'warning');
        }
    }

    resumeRule(ruleId) {
        if (typeof showToast === 'function') {
            showToast(`Rule ${ruleId} resumed`, 'success');
        }
    }

    deleteRule(ruleId) {
        if (typeof showToast === 'function') {
            showToast(`Rule ${ruleId} deleted`, 'error');
        }
    }
}

// Create global instance
const aiAutomationUI = new AIAutomationUIComponents();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAutomationUIComponents;
}
