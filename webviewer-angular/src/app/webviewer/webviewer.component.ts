import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';

@Component({
  selector: 'webviewer',
  templateUrl: './webviewer.component.html',
  styleUrls: ['./webviewer.component.css'],
  standalone: true
})
export class WebViewerComponent implements AfterViewInit {
  @ViewChild('viewer') viewer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  instance: any;

  constructor() { }
  ngOnInit(): void {
    // Component initialization if needed
  }
  ngAfterViewInit(): void {
    this.loadSpreadsheetEditor();
  }

  loadSpreadsheetEditor(): void {
    const element = this.viewer.nativeElement;
    if (!element) {
      console.error('Viewer div not found.');
      return;
    }

    WebViewer.Iframe({
      path: '../../lib/webviewer',
      licenseKey: 'demo:1753596865578:618a9f7c03000000009c928c6b31921cd9cb2ce5c2c8e72b98d419bd5c',
      enableFilePicker: true,
      initialMode: (WebViewer as any).Modes.SPREADSHEET_EDITOR
    }, element).then(instance => {
      this.instance = instance;

      const { documentViewer } = instance.Core;

      documentViewer.addEventListener('documentLoaded', () => {
        this.handleDocumentLoaded();
      });

    }).catch(error => {
      console.error('Error initializing WebViewer:', error);
    });
  }

  handleDocumentLoaded(): void {
    if (!this.instance) return;

    try {
      const { documentViewer } = this.instance.Core;
      console.log(this.instance.Core);
      const spreadsheetEditorManager = documentViewer.getSpreadsheetEditorManager();
      console.log(spreadsheetEditorManager);

      if (spreadsheetEditorManager) {
        console.log('✓ Spreadsheet Editor Manager initialized - ready for editing');
      }
    } catch (error) {
      console.error('Error handling document loaded:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      console.log(`File selected: ${file.name}`);
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isSpreadsheet = ['xlsx', 'xls', 'csv'].includes(fileExtension);

      console.log(`File type detected: ${isSpreadsheet ? 'SPREADSHEET' : 'PDF/DOCUMENT'}`);

      if (this.instance) {
        const { documentViewer } = this.instance.Core;
        
        if (isSpreadsheet) {
          let mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          if (fileExtension === 'xls') {
            mimeType = 'application/vnd.ms-excel';
          } else if (fileExtension === 'csv') {
            mimeType = 'text/csv';
          }
          
          const blob = new Blob([file], { type: mimeType });
          documentViewer.loadDocument(blob, { 
            filename: file.name,
            extension: fileExtension
          });
          console.log(`✓ Loading spreadsheet with MIME type: ${mimeType}`);
        } else {
          documentViewer.loadDocument(file, { filename: file.name });
          console.log(`✓ Loading document: ${file.name}`);
        }
      }
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}
