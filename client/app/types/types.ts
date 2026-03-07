export interface Message {
  id: string;
  text?: string;
  timestamp: Date;
  duration?: number;
  language?: string;
  role ?: 'user' | 'assistant';
}
export interface CurrentMessageContextType {
  currentMessage: Message;
  setCurrentMessage: React.Dispatch<React.SetStateAction<Message>>;
}
export interface MessagesContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface AudioUrlContextType {
  audioUrl: string | null;
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
}