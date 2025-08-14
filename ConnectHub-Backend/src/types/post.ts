export interface Post {
  id: string;
  userId: string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'mixed';
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isEdited: boolean;
  visibility: 'public' | 'followers' | 'private';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithUser extends Post {
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    isVerified: boolean;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
}

export interface CreatePostRequest {
  content: string;
  contentType: 'text' | 'image' | 'video' | 'mixed';
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  visibility?: 'public' | 'followers' | 'private';
  location?: string;
}

export interface UpdatePostRequest {
  content?: string;
  hashtags?: string[];
  mentions?: string[];
  visibility?: 'public' | 'followers' | 'private';
  location?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    isVerified: boolean;
  };
  isLiked?: boolean;
  replies?: CommentWithUser[];
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface PostEngagement {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'save' | 'share' | 'view';
  createdAt: Date;
}

export interface FeedOptions {
  page?: number;
  limit?: number;
  type?: 'following' | 'explore' | 'trending';
  hashtag?: string;
  userId?: string;
}
