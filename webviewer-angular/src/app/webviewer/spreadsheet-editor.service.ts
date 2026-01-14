import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetEditorService {

  constructor() { }

  /**
   * Check if the file is a spreadsheet file
   * @param filename - The name of the file
   * @returns true if it's a spreadsheet file, false otherwise
   */
  isSpreadsheetFile(filename: string): boolean {
    const spreadsheetExtensions = ['xlsx', 'xls', 'csv'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return spreadsheetExtensions.includes(extension);
  }

  /**
   * Get WebViewer Modes for spreadsheet editor
   * @returns Object with spreadsheet editor mode
   */
  getSpreadsheetEditorMode(): string {
    // This will be accessed via WebViewer.Modes.SPREADSHEET_EDITOR
    return 'SPREADSHEET_EDITOR';
  }

  /**
   * Initialize the spreadsheet editor in editing mode
   * @param instance - The WebViewer instance
   */
  initializeSpreadsheetEditor(instance: any): void {
    if (!instance) {
      console.warn('WebViewer instance not available');
      return;
    }

    try {
      const { documentViewer } = instance.Core;
      
      if (!documentViewer) {
        console.warn('Document viewer not available');
        return;
      }

      const spreadsheetEditorManager = documentViewer.getSpreadsheetEditorManager();
      
      if (!spreadsheetEditorManager) {
        console.warn('Spreadsheet Editor Manager not available');
        return;
      }

      console.log('Spreadsheet Editor Manager:', spreadsheetEditorManager);

      // Wait for the spreadsheet editor to fully initialize before setting edit mode
      setTimeout(() => {
        try {
          if (spreadsheetEditorManager && typeof spreadsheetEditorManager.setEditMode === 'function') {
            // Try to set edit mode with value 1 (EDITING mode)
            spreadsheetEditorManager.setEditMode(1);
            console.log('✓ Spreadsheet Editor set to EDITING mode');
          }
        } catch (error) {
          console.warn('Could not set edit mode:', error);
        }
      }, 500);

      console.log('✓ Spreadsheet Editor initialized');
    } catch (error) {
      console.error('❌ Error initializing spreadsheet editor:', error);
    }
  }

  /**
   * Enables spreadsheet editor features like cell editing, formulas, etc.
   * @param instance - The WebViewer instance
   */
  enableSpreadsheetFeatures(instance: any): void {
    if (!instance) return;

    try {
      const { documentViewer } = instance.Core;
      const spreadsheetEditorManager = documentViewer.getSpreadsheetEditorManager();

      if (spreadsheetEditorManager) {
        // Open any additional panels if needed
        if (instance.UI && instance.UI.openElements) {
          instance.UI.openElements(['notesPanel']);
        }
        console.log('✓ Spreadsheet features enabled');
      }
    } catch (error) {
      console.error('❌ Error enabling spreadsheet features:', error);
    }
  }

  /**
   * Get spreadsheet metadata
   * @param instance - The WebViewer instance
   * @returns spreadsheet information or null
   */
  getSpreadsheetInfo(instance: any): any {
    if (!instance) return null;

    try {
      const { documentViewer } = instance.Core;
      
      if (!documentViewer) {
        return null;
      }

      const spreadsheetEditorManager = documentViewer.getSpreadsheetEditorManager();

      if (spreadsheetEditorManager) {
        return {
          isInitialized: !!spreadsheetEditorManager,
          hasSetEditMode: typeof spreadsheetEditorManager.setEditMode === 'function'
        };
      }
    } catch (error) {
      console.error('❌ Error getting spreadsheet info:', error);
    }

    return null;
  }
}
