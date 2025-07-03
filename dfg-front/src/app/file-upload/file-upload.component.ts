import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {NgIf} from '@angular/common';
import {getDownloadURL, ref, Storage, uploadBytesResumable} from '@angular/fire/storage';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    NgIf
  ],
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  uploadProgress: number | null = null;
  downloadUrl: string | null = null;
  isUploading = false;

  private storage: Storage = inject(Storage);

  uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    this.isUploading = true;
    this.uploadProgress = 0;

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        this.uploadProgress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      (error) => {
        this.isUploading = false;
        this.uploadProgress = null;
        alert('Upload failed: ' + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          this.downloadUrl = url;
          this.isUploading = false;
          this.uploadProgress = null;
        });
      }
    );
  }
}
