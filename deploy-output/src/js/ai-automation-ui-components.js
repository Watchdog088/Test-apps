/**
 * AI & Automation UI Components
 * ConnectHub - Advanced AI and Automation Interface System
 * 
 * This file contains 5 comprehensive AI/Automation UI interfaces:
 * 1. AI Assistant Chat Interface
 * 2. AI Content Moderation Dashboard  
 * 3. Automation Rules Manager Interface
 * 4. AI Chatbot Interface - Advanced conversational AI
 * 5. AI Recommendations Panel - Smart content suggestions
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
        this.currentPersonality = 'friendly';
        this.currentRecommendationCategory = 'content';
        this.chatbotPersonality = 'friendly';
    }

    /**
     * 4. AI CHATBOT INTERFACE
     * Advanced conversational AI chatbot with natural language understanding,
     * contextual awareness, multi-modal interactions and personality-driven responses
     */
    createAIChatbotInterface(containerId = 'ai-automation-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const chatbotInterface = document.createElement('div');
        chatbotInterface.className = 'ai-chatbot-interface';
        chatbotInterface.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; max-width: 900px; margin: 0 auto;">
                <!-- Chatbot Header -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: white; padding: 2rem; position: relative;">
                    <button id="closeChatbotInterface" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">✕</button>
                    
                    <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem;">
                        <div style="font-size: 4rem; animation: pulse 2s infinite;">🤖</div>
                        <div style="flex: 1;">
                            <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">ARIA - AI Chatbot</h2>
                            <p style="margin: 0 0 1rem 0; opacity: 0.9; font-size: 1.1rem;">Advanced Responsive Intelligent Assistant</p>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem;">🧠 Context-Aware</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem;">🌍 Multi-Language</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem;">🎭 Personality-Driven</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem;">⚡ Real-Time</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI Status & Mood -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                        <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.2rem; margin-bottom: 0.25rem;">😊</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Mood: Happy</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.2rem; margin-bottom: 0.25rem; color: #4ade80;">●</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Status: Online</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1rem; font-weight: bold; margin-bottom: 0.25rem;">127ms</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Response Time</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1rem; font-weight: bold; margin-bottom: 0.25rem;">2,847</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Conversations</div>
                        </div>
                    </div>
                </div>

                <!-- Chatbot Personality Selector -->
                <div style="background: var(--glass); padding: 1.5rem; border-bottom: 1px solid var(--glass-border);">
                    <h4 style="margin: 0 0 1rem 0; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                        🎭 AI Personality Mode
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
                        <button onclick="aiAutomationUI.setPersonality('friendly')" class="personality-btn active" data-personality="friendly" style="background: var(--primary); color: white; border: none; padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-size: 0.9rem; font-weight: 500;">😊 Friendly & Helpful</button>
                        <button onclick="aiAutomationUI.setPersonality('professional')" class="personality-btn" data-personality="professional" style="background: var(--glass); color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-size: 0.9rem; font-weight: 500;">👔 Professional</button>
                        <button onclick="aiAutomationUI.setPersonality('creative')" class="personality-btn" data-personality="creative" style="background: var(--glass); color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-size: 0.9rem; font-weight: 500;">🎨 Creative & Fun</button>
                        <button onclick="aiAutomationUI.setPersonality('analytical')" class="personality-btn" data-personality="analytical" style="background: var(--glass); color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-size: 0.9rem; font-weight: 500;">📊 Analytical</button>
                    </div>
                </div>

                <!-- Chatbot Messages Area -->
                <div id="chatbotMessages" style="height: 500px; overflow-y: auto; padding: 1.5rem; background: var(--bg-secondary);">
                    <!-- AI Welcome Message -->
                    <div class="chatbot-message" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">🤖</div>
                        <div style="background: white; padding: 1.5rem; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex: 1; position: relative;">
                            <div style="color: var(--text-primary); line-height: 1.6;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                    <strong style="color: var(--primary);">ARIA AI</strong>
                                    <span style="background: #4ade80; color: white; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 10px;">ONLINE</span>
                                </div>
                                
                                <p style="margin: 0 0 1rem 0;"><strong>Hello! I'm ARIA, your advanced AI companion! 🌟</strong></p>
                                
                                <p style="margin: 0 0 1rem 0;">I'm equipped with:</p>
                                <ul style="margin: 0 0 1rem 0; padding-left: 1.5rem; color: var(--text-secondary);">
                                    <li><strong>Contextual Memory</strong> - I remember our entire conversation</li>
                                    <li><strong>Emotional Intelligence</strong> - I adapt to your mood and preferences</li>
                                    <li><strong>Multi-modal Understanding</strong> - Text, images, files, and more</li>
                                    <li><strong>Real-time Learning</strong> - I improve with every interaction</li>
                                </ul>
                                
                                <p style="margin: 0; font-weight: 500;">What would you like to explore together today? 🚀</p>
                            </div>
                            <div style="position: absolute; bottom: 0.5rem; right: 1rem; font-size: 0.7rem; color: var(--text-muted);">
                                ${new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced Input Area -->
                <div style="background: var(--bg-card); padding: 1.5rem; border-top: 1px solid var(--glass-border);">
                    <!-- Main Input -->
                    <div style="display: flex; gap: 1rem; align-items: flex-end;">
                        <div style="flex: 1; position: relative;">
                            <textarea id="chatbotInput" placeholder="Ask me anything... I can help with complex topics, creative projects, problem-solving, or just friendly conversation!" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 20px; background: white; color: var(--text-primary); resize: none; min-height: 60px; max-height: 150px; font-family: inherit; transition: all 0.3s ease; font-size: 0.95rem; line-height: 1.4;" rows="1" onkeydown="aiAutomationUI.handleChatbotKeydown(event)" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.1)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'"></textarea>
                            
                            <!-- Input Enhancement Overlay -->
                            <div style="position: absolute; bottom: 0.75rem; right: 1rem; display: flex; gap: 0.5rem; align-items: center;">
                                <span id="chatbotCharCount" style="font-size: 0.7rem; color: var(--text-muted);">0 / 2000</span>
                            </div>
                        </div>
                        
                        <button id="sendChatbotMessage" onclick="aiAutomationUI.sendChatbotMessage()" style="background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%); color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; font-size: 1.5rem; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            🚀
                        </button>
                    </div>
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .personality-btn.active {
                    background: var(--primary) !important;
                    color: white !important;
                    border: none !important;
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                
                .personality-btn:hover:not(.active) {
                    background: var(--primary) !important;
                    color: white !important;
                    transform: translateY(-1px);
                }
            </style>
        `;

        container.innerHTML = '';
        container.appendChild(chatbotInterface);

        // Add event listeners
        document.getElementById('closeChatbotInterface').addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('AI Chatbot closed', 'info');
            }
            container.innerHTML = '';
        });

        // Auto-resize textarea
        const textarea = document.getElementById('chatbotInput');
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            
            // Update character count
            const charCount = this.value.length;
            const countElement = document.getElementById('chatbotCharCount');
            if (countElement) {
                countElement.textContent = `${charCount} / 2000`;
                countElement.style.color = charCount > 1800 ? 'var(--error)' : 'var(--text-muted)';
            }
        });

        this.scrollChatbotToBottom();
    }

    /**
     * 5. AI RECOMMENDATIONS PANEL
     * Intelligent content suggestion system with personalized recommendations,
     * trend analysis, and smart content curation
     */
    createAIRecommendationsPanel(containerId = 'ai-automation-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const recommendationsPanel = document.createElement('div');
        recommendationsPanel.className = 'ai-recommendations-panel';
        recommendationsPanel.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%); color: white; padding: 2rem; position: relative;">
                    <button id="closeRecommendationsPanel" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">✕</button>
                    
                    <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem;">
                        <div style="font-size: 4rem;">🎯</div>
                        <div style="flex: 1;">
                            <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">AI Smart Recommendations</h2>
                            <p style="margin: 0 0 1rem 0; opacity: 0.9; font-size: 1.1rem;">Personalized content suggestions powered by machine learning</p>
                        </div>
                    </div>
                    
                    <!-- Recommendation Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">847</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Recommendations</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">94.7%</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Accuracy Rate</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">2,341</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Interactions</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">68%</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Click-Through</div>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div style="padding: 2rem;">
                    <!-- Recommendation Categories -->
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3 style="color: var(--primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                🎛️ Recommendation Categories
                            </h3>
                            <button onclick="aiAutomationUI.refreshRecommendations()" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease;">🔄 Refresh</button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                            <button onclick="aiAutomationUI.selectCategory('content')" class="recommendation-category active" data-category="content" style="background: var(--primary); color: white; border: none; padding: 1rem; border-radius: 16px; cursor: pointer; transition: all 0.3s ease; text-align: left;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📝</div>
                                <div style="font-weight: 600; margin-bottom: 0.25rem;">Content Suggestions</div>
                                <div style="font-size: 0.85rem; opacity: 0.9;">Trending topics & viral content ideas</div>
                            </button>
                            
                            <button onclick="aiAutomationUI.selectCategory('people')" class="recommendation-category" data-category="people" style="background: var(--glass); color: var(--text-primary); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 16px; cursor: pointer; transition: all 0.3s ease; text-align: left;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">👥</div>
                                <div style="font-weight: 600; margin-bottom: 0.25rem;">People You May Know</div>
                                <div style="font-size: 0.85rem; opacity: 0.7;">Suggested connections & friends</div>
                            </button>
                        </div>
                    </div>

                    <!-- Active Recommendations Display -->
                    <div id="recommendationsDisplay">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                            <div style="background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid var(--glass-border);">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                    <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">📝</div>
                                    <div>
                                        <h5 style="margin: 0; color: var(--text-primary);">Trending Topic</h5>
                                        <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">98% match for your interests</p>
                                    </div>
                                </div>
                                <p style="color: var(--text-primary); margin-bottom: 1rem;">"The Future of AI in Social Media" - Join the conversation about how artificial intelligence is reshaping social platforms.</p>
                                <button onclick="aiAutomationUI.useRecommendation('content', 1)" style="background: var(--success); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">✅ Use This</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(recommendationsPanel);

        // Add event listeners
        document.getElementById('closeRecommendationsPanel').addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('AI Recommendations Panel closed', 'info');
            }
            container.innerHTML = '';
        });
    }

    // Chatbot Helper Methods
    setPersonality(personality) {
        this.chatbotPersonality = personality;
        
        // Update UI
        document.querySelectorAll('.personality-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.personality === personality) {
                btn.classList.add('active');
            }
        });
        
        if (typeof showToast === 'function') {
            showToast(`AI personality set to ${personality}`, 'info');
        }
    }

    handleChatbotKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendChatbotMessage();
        }
    }

    sendChatbotMessage() {
        const input = document.getElementById('chatbotInput');
        const chatMessages = document.getElementById('chatbotMessages');
        
        if (!input || !chatMessages) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: flex-end;';
        userMessage.innerHTML = `
            <div style="background: var(--primary); color: white; padding: 1rem 1.5rem; border-radius: 18px; max-width: 70%;">${message}</div>
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; flex-shrink: 0;">👤</div>
        `;
        
        chatMessages.appendChild(userMessage);
        input.value = '';
        input.style.height = 'auto';
        
        // Simulate AI response
        setTimeout(() => {
            this.addChatbotResponse(this.generateChatbotResponse(message));
        }, 1500);
        
        this.scrollChatbotToBottom();
    }

    generateChatbotResponse(userMessage) {
        const responses = {
            'friendly': `That's a great question! 😊 I'd love to help you with that. Based on your message about "${userMessage}", here's what I think: This is a fascinating topic that deserves a thoughtful response. Let me break this down for you in a helpful way...`,
            'professional': `Thank you for your inquiry regarding "${userMessage}". I'll provide you with a comprehensive analysis of this matter. Based on current best practices and available data...`,
            'creative': `Wow, what an inspiring question! 🎨 "${userMessage}" really sparks my imagination! Let me paint you a picture of possibilities and creative solutions...`,
            'analytical': `Let me analyze your query: "${userMessage}". From a data-driven perspective, I can identify several key factors and metrics to consider...`
        };
        
        return responses[this.chatbotPersonality] || responses.friendly;
    }

    addChatbotResponse(message) {
        const chatMessages = document.getElementById('chatbotMessages');
        if (!chatMessages) return;
        
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';
        aiMessage.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1.5rem;';
        aiMessage.innerHTML = `
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">🤖</div>
            <div style="background: white; padding: 1rem 1.5rem; border-radius: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex: 1;">
                <div style="color: var(--text-primary); line-height: 1.5;">${message}</div>
            </div>
        `;
        
        chatMessages.appendChild(aiMessage);
        this.scrollChatbotToBottom();
    }

    scrollChatbotToBottom() {
        setTimeout(() => {
            const chatMessages = document.getElementById('chatbotMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 100);
    }

    // Recommendations Helper Methods
    selectCategory(category) {
        this.currentRecommendationCategory = category;
        
        // Update UI
        document.querySelectorAll('.recommendation-category').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        if (typeof showToast === 'function') {
            showToast(`Switched to ${category} recommendations`, 'info');
        }
    }

    refreshRecommendations() {
        if (typeof showToast === 'function') {
            showToast('Refreshing AI recommendations...', 'info');
            setTimeout(() => {
                showToast('Recommendations updated with latest trends!', 'success');
            }, 2000);
        }
    }

    useRecommendation(type, id) {
        if (typeof showToast === 'function') {
            showToast(`Using ${type} recommendation #${id}`, 'success');
        }
    }
}

// Create global instance
const aiAutomationUI = new AIAutomationUIComponents();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAutomationUIComponents;
}
