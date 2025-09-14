
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  sources?: GroundingSource[];
}
