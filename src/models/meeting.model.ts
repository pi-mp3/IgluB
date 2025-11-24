/**
 * meeting.model.ts
 * 
 * Model for a Meeting entity.
 * 
 * @module models/meeting
 */

export interface Meeting {
  /**
   * Unique identifier for the meeting
   */
  id: string;

  /**
   * Title or name of the meeting
   */
  title: string;

  /**
   * ISO string of meeting creation date
   */
  createdAt: string;

  /**
   * Optional list of participant emails
   */
  participants?: string[];
}
