/**
 * chatMessage.model.ts
 * 
 * Model for a chat message within a meeting.
 * 
 * @module models/chatMessage
 */

export interface ChatMessage {
  /**
   * Email or name of the user who sent the message
   */
  user: string;

  /**
   * Message content
   */
  message: string;

  /**
   * ISO string of message timestamp
   */
  timestamp?: string;
}
