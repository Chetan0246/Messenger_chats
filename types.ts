export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  encryptedText: string;
  type?: 'text' | 'file' | 'call';
  fileName?: string;
  read?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  uploading?: boolean;
  callDuration?: number; // in seconds
}

export interface Contact {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

export interface UserProfile {
  name: string;
}
