export interface ChatMessage {
  id: string;
  timestamp: Date;
}

export interface UserMessage extends ChatMessage {
  amenity: string;
  message: string;

}

export interface ReplyMessage extends ChatMessage {
  replyTo: string; // use id of the UserMessage
  price: number;
  description: string;
}