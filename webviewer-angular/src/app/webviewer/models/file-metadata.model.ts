/**
 * File Metadata Model
 * Holds information about a document file
 */
export interface FileMetadata {
  name: string;
  displayName: string;
  path: string;
  extension: string;
  displayExtension?: string;
  id?: number;
  thumbnail?: string;
}
