import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';

@Component({
  selector: 'webviewer',
  templateUrl: './webviewer.component.html',
  standalone: true
})
export class WebViewerComponent implements AfterViewInit {
  @ViewChild('viewer') viewer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  instance: any;

  constructor() { }

  ngAfterViewInit(): void {
    WebViewer({
      path: '../../lib/webviewer',
      licenseKey: 'demo:1753596865578:618a9f7c03000000009c928c6b31921cd9cb2ce5c2c8e72b98d419bd5c' // sign up to get a free trial key at https://dev.apryse.com
    }, this.viewer.nativeElement).then(instance => {
      this.instance = instance;
      
      const { documentViewer, Annotations, annotationManager } = instance.Core;

      instance.UI.openElements(['notesPanel']);

      documentViewer.addEventListener('annotationsLoaded', () => {
        console.log('annotations loaded');
      });

      documentViewer.addEventListener('documentLoaded', () => {
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 100,
          Y: 150,
          Width: 200,
          Height: 50,
          Author: annotationManager.getCurrentUser()
        });
        annotationManager.addAnnotation(rectangleAnnot);
        annotationManager.redrawAnnotation(rectangleAnnot);
      });

    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
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

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}