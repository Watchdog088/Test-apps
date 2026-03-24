/**
 * OpenAI Moderation Service
 * Provides content moderation using OpenAI's moderation API
 * FREE with your API key - protects against harmful content
 * Created: 2026-03-05
 */

class OpenAIModerationService {
    constructor() {
        this.apiKey = null; // Set from backend
        this.moderationEndpoint = '/api/moderation'; // Backend proxy
        this.isInitialized = false;
    }

    /**
     * Initialize the service
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🛡️ OpenAI Moderation Service initialized');
        this.isInitialized = true;
    }

    /**
     * Moderate text content (posts, comments, messages)
     * @param {string} text - Text to moderate
     * @returns {Promise<Object>} Moderation result
     */
    async moderateText(text) {
        try {
            if (!text || text.trim().length === 0) {
                return { flagged: false, safe: true };
            }

            // Call backend moderation endpoint
            const response = await fetch(this.moderationEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Moderation API failed');
            }

            const result = await response.json();
            
            return {
                flagged: result.flagged,
                safe: !result.flagged,
                categories: result.categories,
                scores: result.category_scores,
                details: this.getModerationDetails(result)
            };
        } catch (error) {
            console.error('❌ Moderation error:', error);
            // Fail open - allow content if moderation fails
            return { flagged: false, safe: true, error: error.message };
        }
    }

    /**
     * Moderate post before submission
     * @param {Object} post - Post object {title, content, tags}
     * @returns {Promise<Object>} Moderation result
     */
    async moderatePost(post) {
        const combinedText = `${post.title || ''} ${post.content || ''} ${(post.tags || []).join(' ')}`;
        return await this.moderateText(combinedText);
    }

    /**
     * Moderate comment before submission
     * @param {string} comment - Comment text
     * @returns {Promise<Object>} Moderation result
     */
    async moderateComment(comment) {
        return await this.moderateText(comment);
    }

    /**
     * Moderate message before sending
     * @param {string} message - Message text
     * @returns {Promise<Object>} Moderation result
     */
    async moderateMessage(message) {
        return await this.moderateText(message);
    }

    /**
     * Moderate profile information
     * @param {Object} profile - Profile object {bio, about, interests}
     * @returns {Promise<Object>} Moderation result
     */
    async moderateProfile(profile) {
        const combinedText = `${profile.bio || ''} ${profile.about || ''} ${(profile.interests || []).join(' ')}`;
        return await this.moderateText(combinedText);
    }

    /**
     * Get human-readable moderation details
     * @param {Object} result - Raw moderation result
     * @returns {Object} Formatted details
     */
    getModerationDetails(result) {
        if (!result.flagged) {
            return { message: 'Content passed moderation', severity: 'none' };
        }

        const flaggedCategories = [];
        const categories = result.categories || {};
        
        for (const [category, flagged] of Object.entries(categories)) {
            if (flagged) {
                flaggedCategories.push(this.getCategoryLabel(category));
            }
        }

        return {
            message: `Content flagged for: ${flaggedCategories.join(', ')}`,
            categories: flaggedCategories,
            severity: this.getSeverity(result.category_scores)
        };
    }

    /**
     * Get user-friendly category label
     * @param {string} category - API category name
     * @returns {string} User-friendly label
     */
    getCategoryLabel(category) {
        const labels = {
            'hate': 'Hate Speech',
            'hate/threatening': 'Threatening Hate Speech',
            'harassment': 'Harassment',
            'harassment/threatening': 'Threatening Harassment',
            'self-harm': 'Self-Harm',
            'self-harm/intent': 'Self-Harm Intent',
            'self-harm/instructions': 'Self-Harm Instructions',
            'sexual': 'Sexual Content',
            'sexual/minors': 'Sexual Content Involving Minors',
            'violence': 'Violence',
            'violence/graphic': 'Graphic Violence'
        };
        return labels[category] || category;
    }

    /**
     * Determine severity based on scores
     * @param {Object} scores - Category scores
     * @returns {string} Severity level
     */
    getSeverity(scores = {}) {
        const maxScore = Math.max(...Object.values(scores));
        
        if (maxScore > 0.9) return 'critical';
        if (maxScore > 0.7) return 'high';
        if (maxScore > 0.5) return 'medium';
        return 'low';
    }

    /**
     * Check if content should be blocked
     * @param {Object} moderationResult - Result from moderateText()
     * @returns {boolean} True if content should be blocked
     */
    shouldBlock(moderationResult) {
        return moderationResult.flagged && 
               ['critical', 'high'].includes(moderationResult.details?.severity);
    }

    /**
     * Get user-friendly error message
     * @param {Object} moderationResult - Result from moderateText()
     * @returns {string} Error message for user
     */
    getUserMessage(moderationResult) {
        if (!moderationResult.flagged) {
            return null;
        }

        const severity = moderationResult.details?.severity;
        
        if (severity === 'critical' || severity === 'high') {
            return `Your content violates our community guidelines: ${moderationResult.details.message}. Please revise and try again.`;
        }
        
        return `Your content may violate our community guidelines. Please review before posting.`;
    }

    /**
     * Batch moderate multiple texts
     * @param {Array<string>} texts - Array of texts to moderate
     * @returns {Promise<Array<Object>>} Array of moderation results
     */
    async moderateBatch(texts) {
        try {
            const results = await Promise.all(
                texts.map(text => this.moderateText(text))
            );
            return results;
        } catch (error) {
            console.error('❌ Batch moderation error:', error);
            return texts.map(() => ({ flagged: false, safe: true, error: error.message }));
        }
    }

    /**
     * Get moderation statistics
     * @returns {Object} Stats about moderation
     */
    getStats() {
        return {
            totalModerated: this.totalModerated || 0,
            totalFlagged: this.totalFlagged || 0,
            totalBlocked: this.totalBlocked || 0
        };
    }
}

// Export singleton instance
const openaiModerationService = new OpenAIModerationService();
// export default openaiModerationService;

// Also export for testing
// export { OpenAIModerationService };
