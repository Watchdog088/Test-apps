import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  userId: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

class AIChatbotService {
  private responses = {
    greeting: [
      "Hi there! I'm ConnectBot, your AI assistant. How can I help you today?",
      "Hello! I'm here to help with dating advice, platform features, and more!",
      "Welcome to ConnectHub! What would you like to know?"
    ],
    dating: [
      "For better matches, make sure your profile is complete with recent photos and interests!",
      "Great conversation starters include asking about their hobbies or commenting on something from their profile.",
      "Remember to be authentic and genuine in your interactions. Quality over quantity!",
      "Safety first! Always meet in public places for first dates and trust your instincts."
    ],
    profile: [
      "Use 3-5 recent, clear photos that show your face and personality.",
      "Write a bio that's engaging and shows your interests and sense of humor.",
      "Keep your profile updated and authentic - honesty attracts the right people!",
      "Include your hobbies and interests to give others conversation starters."
    ],
    safety: [
      "Always meet in public places for first dates.",
      "Tell a friend where you're going and when you expect to be back.",
      "Trust your instincts - if something feels off, it probably is.",
      "Use our in-app video chat before meeting in person.",
      "Never share personal information like your address or financial details."
    ],
    features: [
      "ConnectHub combines social media and dating in one platform!",
      "You can post updates, like and comment on posts, and discover potential matches.",
      "Use our advanced matching algorithm to find compatible people near you.",
      "Premium features include unlimited likes, advanced filters, and read receipts.",
      "Try our video calling feature for safe virtual dates!"
    ],
    default: [
      "I can help with dating advice, profile optimization, safety tips, and platform features.",
      "Feel free to ask me about anything related to ConnectHub or dating!",
      "I'm here to make your ConnectHub experience better. What would you like to know?",
      "Need help with something specific? I can assist with profiles, matching, or safety."
    ]
  };

  async createChatSession(userId: string, context: string = 'general'): Promise<string> {
    try {
      // For now, we'll simulate a chat session without database storage
      const sessionId = `session_${userId}_${Date.now()}`;
      logger.info(`Chat session created for user ${userId}`);
      return sessionId;
    } catch (error) {
      logger.error('Error creating chat session:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, userId: string, message: string): Promise<ChatMessage> {
    try {
      // Analyze message to determine response type
      const responseType = this.analyzeMessage(message);
      const responses = this.responses[responseType] || this.responses.default;
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        userId
      };

      logger.info(`AI chatbot responded to user ${userId}`);
      return assistantMessage;
    } catch (error) {
      logger.error('Error in AI chatbot service:', error);
      throw error;
    }
  }

  private analyzeMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    
    if (lowerMessage.includes('match') || lowerMessage.includes('dating') || lowerMessage.includes('date')) {
      return 'dating';
    }
    
    if (lowerMessage.includes('profile') || lowerMessage.includes('photo') || lowerMessage.includes('bio')) {
      return 'profile';
    }
    
    if (lowerMessage.includes('safe') || lowerMessage.includes('security') || lowerMessage.includes('danger')) {
      return 'safety';
    }
    
    if (lowerMessage.includes('feature') || lowerMessage.includes('premium') || lowerMessage.includes('how to')) {
      return 'features';
    }
    
    return 'default';
  }

  async getChatHistory(sessionId: string, userId: string): Promise<ChatMessage[]> {
    try {
      // For now, return empty array - in production this would fetch from database
      return [];
    } catch (error) {
      logger.error('Error getting chat history:', error);
      throw error;
    }
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      // For now, return empty array - in production this would fetch from database
      return [];
    } catch (error) {
      logger.error('Error getting user chat sessions:', error);
      throw error;
    }
  }

  async deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      logger.info(`Chat session ${sessionId} deleted for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting chat session:', error);
      throw error;
    }
  }

  async getQuickResponse(query: string): Promise<string> {
    const responseType = this.analyzeMessage(query);
    const responses = this.responses[responseType] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default new AIChatbotService();
