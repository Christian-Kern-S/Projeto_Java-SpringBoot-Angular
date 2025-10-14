export interface ChatParticipant {
  id: string;
  username: string;
  fullname: string | null;
  avatarUrl: string | null;
  admin: boolean;
}

export interface ChatConversation {
  id: string;
  groupChat: boolean;
  title: string | null;
  updatedAt: string;
  participants: ChatParticipant[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: ChatMessageType;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
}

export interface ChatSocketEnvelope {
  messageId: string | null;
  conversationId: string;
  senderId: string | null;
  senderName: string | null;
  content: string | null;
  mediaUrl: string | null;
  type: string | null;
  createdAt: string | null;
  eventType: 'MESSAGE_CREATED' | 'MESSAGE_DELETED' | 'CONVERSATION_DELETED';
}

export interface ChatMessageRequest {
  conversationId: string;
  content: string;
  type: ChatMessageType;
}

export enum ChatMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}