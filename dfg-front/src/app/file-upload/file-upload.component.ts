import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {NgClass, NgIf} from '@angular/common';
import {getDownloadURL, ref, Storage, uploadBytesResumable} from '@angular/fire/storage';
import {getAI, getGenerativeModel, GoogleAIBackend} from '@firebase/ai';
import {FirebaseApp} from '@angular/fire/app';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    NgIf,
    NgClass
  ],
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  uploadProgress: number | null = null;
  downloadUrl: string | null = null;
  isUploading = false;
  fileAnalisisResult: string | null = null;
  isAnalysisInProgress: boolean = false;

  private readonly storage: Storage = inject(Storage);
  private readonly firebaseApp = inject(FirebaseApp);

  private readonly ai = getAI(this.firebaseApp, {backend: new GoogleAIBackend()});
  private readonly aiModel = getGenerativeModel(this.ai, {
    model: 'gemini-2.5-flash',
  });

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
          this.analyzeImage(this.downloadUrl)
            .then(r => this.fileAnalisisResult = r);
        });
      }
    );
  }

  async analyzeImage(fileUri: string) {
    const textPrompt = `Opisz jednym zdaniem obraz, który znajduje się pod adresem ${fileUri}`;
    this.isAnalysisInProgress = true;

    try {
      const result = await this.aiModel.generateContent([
        textPrompt,
      ]);

      const responseText = result.response.text();
      console.log('Opis obrazu od Gemini:', responseText);
      return responseText;
    } catch (error) {
      console.error('Błąd podczas analizy obrazu przez Gemini:', error);
      return 'Nie udało się opisać obrazu';
    } finally {
      this.isAnalysisInProgress = false;
    }
  }
}
