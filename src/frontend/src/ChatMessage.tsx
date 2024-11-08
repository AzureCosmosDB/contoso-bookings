export interface ChatMessage {
  id: string;
  timestamp: Date;
  message: string;
}

export interface UserMessage extends ChatMessage {
  amenity: string;

}

export interface ReplyMessage extends ChatMessage {
  replyTo: string; // use id of the UserMessage
  // price: number;
  // description: string;

}

