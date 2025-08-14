export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  matchId?: string; // For dating app messages
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'date_request';
  mediaUrl?: string;
  isRead: boolean;
  isDelivered: boolean;
  replyToMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface MessageWithUsers extends Message {
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  replyToMessage?: Message;
}

export interface Conversation {
  id: string;
  participants: string[];
  matchId?: string; // For dating conversations
  lastMessage?: Message;
  lastMessageAt: Date;
  unreadCount: { [userId: string]: number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithDetails extends Conversation {
  otherUser: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    isOnline: boolean;
    lastActiveAt: Date;
  };
  messages?: MessageWithUsers[];
}

export interface SendMessageRequest {
  receiverId: string;
  matchId?: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'date_request';
  mediaUrl?: string;
  replyToMessageId?: string;
}

export interface UpdateMessageRequest {
  content?: string;
  isRead?: boolean;
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface ConversationFilters {
  page?: number;
  limit?: number;
  search?: string;
  isDating?: boolean;
  hasUnread?: boolean;
}

export interface MessageFilters {
  conversationId: string;
  page?: number;
  limit?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
}
