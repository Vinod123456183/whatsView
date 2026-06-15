export interface ChatMessage {
  id: string;
  timestamp: Date;
  sender: string;
  content: string;
  type: 'text' | 'media' | 'contact' | 'location' | 'deleted' | 'system' | 'sticker' | 'audio' | 'video' | 'document';
  mediaFile?: MediaFile;
  isMe: boolean;
  isSystem: boolean;
}

export interface MediaFile {
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'sticker';
  blob?: Blob;
}

export interface ParsedChat {
  participants: string[];
  messages: ChatMessage[];
  myName: string;
}

export interface DateGroup {
  date: string;
  messages: ChatMessage[];
}
