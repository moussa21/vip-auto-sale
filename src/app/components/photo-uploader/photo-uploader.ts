import {
  Component, EventEmitter, HostListener, Input, Output, signal
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export interface PhotoPreview {
  file: File;
  url: string;   // local object URL
}

@Component({
  selector: 'app-photo-uploader',
  imports: [NgFor, NgIf],
  templateUrl: './photo-uploader.html',
  styleUrl: './photo-uploader.scss'
})
export class PhotoUploader {
  @Input() maxPhotos = 8;
  @Output() photosChange = new EventEmitter<File[]>();

  previews = signal<PhotoPreview[]>([]);
  dragOver = false;
  error = '';

  get files(): File[] { return this.previews().map(p => p.file); }
  get canAddMore(): boolean { return this.previews().length < this.maxPhotos; }

  @HostListener('dragover', ['$event'])
  onDragOver(e: DragEvent) { e.preventDefault(); this.dragOver = true; }

  @HostListener('dragleave', ['$event'])
  onDragLeave(e: DragEvent) {
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node))
      this.dragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  onFileInput(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    this.addFiles(files);
    (e.target as HTMLInputElement).value = '';
  }

  addFiles(files: File[]) {
    this.error = '';
    const remaining = this.maxPhotos - this.previews().length;
    const valid = files
      .filter(f => {
        if (!f.type.startsWith('image/')) { this.error = 'Seules les images sont acceptées.'; return false; }
        if (f.size > 10 * 1024 * 1024)   { this.error = 'Une image dépasse 10 Mo.'; return false; }
        return true;
      })
      .slice(0, remaining);

    const newPreviews = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    this.previews.update(prev => [...prev, ...newPreviews]);
    this.photosChange.emit(this.files);
  }

  remove(index: number) {
    URL.revokeObjectURL(this.previews()[index].url);
    this.previews.update(prev => prev.filter((_, i) => i !== index));
    this.photosChange.emit(this.files);
  }

  moveLeft(index: number) {
    if (index === 0) return;
    this.previews.update(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
    this.photosChange.emit(this.files);
  }

  moveRight(index: number) {
    if (index === this.previews().length - 1) return;
    this.previews.update(prev => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    this.photosChange.emit(this.files);
  }
}
