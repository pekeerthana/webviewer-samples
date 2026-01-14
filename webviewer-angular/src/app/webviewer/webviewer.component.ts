import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';
import { SpreadsheetEditorService } from './spreadsheet-editor.service';
import { GalleryPickerComponent } from './components/gallery-picker/gallery-picker.component';
import { FileMetadata } from './models/file-metadata.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'webviewer',
  templateUrl: './webviewer.component.html',
  styleUrls: ['./webviewer.component.css'],
  standalone: true,
  imports: [GalleryPickerComponent, CommonModule]
})
export class WebViewerComponent implements AfterViewInit {
  @ViewChild('viewer') viewer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('galleryPicker') galleryPickerRef: any;

  instance: any;
  sampleFiles: FileMetadata[] = [
    {
      name: 'annual_financial_report.xlsx',
      displayName: 'Annual Financial Report (xlsx)',
      path: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/annual_financial_report.xlsx',
      extension: 'xlsx',
      id: 82,
      thumbnail: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/thumbs/annual_financial_report.png'
    },
    {
      name: 'invoice_template.xlsx',
      displayName: 'Invoice Template (xlsx)',
      path: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/invoice_template.xlsx',
      extension: 'xlsx',
      displayExtension: 'xlsx',
      id: 48,
      thumbnail: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/thumbs/invoice_template.png'
    },
    {
      name: 'file_5000_rows.xlsx',
      displayName: 'File with 5000 rows (xlsx)',
      path: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/file_5000_rows.xlsx',
      extension: 'xlsx',
      id: 83,
      thumbnail: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/thumbs/file_5000_rows.png'
    }
  ];

  constructor(private spreadsheetEditorService: SpreadsheetEditorService) { }

  ngAfterViewInit(): void {
    this.loadSpreadsheetEditor();
  }

  /**
   * Initialize and load the Spreadsheet Editor
   * Mirrors the original JavaScript loadSpreadsheetEditor() function
   */
  loadSpreadsheetEditor(): void {
    const element = this.viewer.nativeElement;
    if (!element) {
      console.error('Viewer div not found.');
      return;
    }

    // Initialize WebViewer with SPREADSHEET_EDITOR mode by default
    // This allows dynamic switching based on document type
    WebViewer.Iframe({
      path: '../../lib/webviewer',
      licenseKey: 'demo:1753596865578:618a9f7c03000000009c928c6b31921cd9cb2ce5c2c8e72b98d419bd5c',
      initialMode: (WebViewer as any).Modes.SPREADSHEET_EDITOR,
      enableFilePicker: true
    }, element).then(instance => {
      this.instance = instance;

      const { documentViewer } = instance.Core;

      // Open notes panel
      instance.UI.openElements(['notesPanel']);

      // Listen for document loaded event
      documentViewer.addEventListener('documentLoaded', () => {
        this.handleDocumentLoaded();
      });

      // Initialize with first sample document
      const defaultFile = this.sampleFiles[0].path;
      if (defaultFile) {
        documentViewer.loadDocument(defaultFile, { filename: this.sampleFiles[0].name });
      }
    }).catch(error => {
      console.error('Error initializing WebViewer:', error);
    });
  }

  /**
   * Handle document loaded event
   * Check file type and initialize appropriate editor
   */
  handleDocumentLoaded(): void {
    if (!this.instance) return;

    const { documentViewer } = this.instance.Core;
    const document = documentViewer.getDocument();
    const filename = document?.getFilename() || '';

    console.log(`Document loaded: ${filename}`);

    // Check if it's a spreadsheet file
    if (this.spreadsheetEditorService.isSpreadsheetFile(filename)) {
      console.log('📊 Spreadsheet file detected - initializing spreadsheet editor');
      this.initializeSpreadsheetEditor();
    } else {
      console.log('📄 PDF file detected');
    }
  }

  /**
   * Initialize spreadsheet editor with editing mode
   */
  initializeSpreadsheetEditor(): void {
    if (!this.instance) return;

    try {
      const { documentViewer } = this.instance.Core;
      const spreadsheetEditorManager = documentViewer.getSpreadsheetEditorManager();

      if (!spreadsheetEditorManager) {
        console.warn('Spreadsheet Editor Manager not available');
        return;
      }

      console.log('Spreadsheet Editor Manager initialized:', spreadsheetEditorManager);

      // Set edit mode
      setTimeout(() => {
        try {
          if (spreadsheetEditorManager && typeof spreadsheetEditorManager.setEditMode === 'function') {
            spreadsheetEditorManager.setEditMode(1); // 1 = EDITING mode
            console.log('✓ Spreadsheet Editor set to EDITING mode');
          }
        } catch (error) {
          console.warn('Could not set edit mode:', error);
        }
      }, 500);

      this.spreadsheetEditorService.enableSpreadsheetFeatures(this.instance);
    } catch (error) {
      console.error('❌ Error initializing spreadsheet editor:', error);
    }
  }

  /**
   * Handle file selection from gallery
   * @param file - Selected file from gallery
   */
  onGalleryFileSelected(file: FileMetadata): void {
    if (file && file.path && this.instance) {
      console.log(`Loading file from gallery: ${file.displayName}`);
      const { documentViewer } = this.instance.Core;
      documentViewer.loadDocument(file.path, { filename: file.name });
    }
  }

  /**
   * Handle file selection from file input
   * @param event - File input change event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      console.log(`File selected: ${file.name}`);
      const fileReader = new FileReader();

      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        if (this.instance) {
          const { documentViewer } = this.instance.Core;
          documentViewer.loadDocument(arrayBuffer, { filename: file.name });
        }
      };

      fileReader.readAsArrayBuffer(file);
    }
  }

  /**
   * Trigger file input dialog
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}