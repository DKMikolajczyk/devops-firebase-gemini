import {Component, inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';
import {Database, push, ref, set} from '@angular/fire/database';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    MatCardModule,
    MatButton,
    RouterLink
  ],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  private static readonly APP_NAME = "dfg-front";

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly db: Database = inject(Database);

  errorMessage: string = "";

  constructor() {
    this.route.paramMap.subscribe(params => {
      const errorType = params.get('type');

      switch (errorType) {
        case 'typeError':
          this.simulateTypeError();
          break;
        case 'customError':
          this.simulateCustomError();
          break;
        default:
          this.simulateApiError();
      }
    });
  }

  simulateApiError(): void {
    this.http.get('http://localhost/api/nonexistent')
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.updateErrorMessage("Received an unexpected response from the server.");
        },
        error: (error) => {
          console.error('API Error:', error);
          this.updateErrorMessage("Error fetching data from the server.");
        }
      });
  }

  simulateTypeError(): void {
    try {
      const data: any = 'not an object';
      console.log(data.property.nested);
    } catch (error) {
      console.error('Type Error:', error);
      this.updateErrorMessage("A type error occurred. Please try again.");
    }
  }

  simulateCustomError(): void {
    try {
      throw new Error('Custom error message');
    } catch (error: any) {
      console.error('Custom Error:', error);
      this.updateErrorMessage(error.message);
    }
  }

  updateErrorMessage(errorMessage: string) {
    this.errorMessage = errorMessage;
    this.reportError(errorMessage);
  }

  reportError(errorMessage: string): void {
    const errorRef = ref(this.db, 'errorReports');
    const errorData = {appName: ErrorComponent.APP_NAME, url: this.router.url, errorMessage: errorMessage};
    const newErrorRef = push(errorRef);
    set(newErrorRef, errorData)
      .then(() => console.log(`Error reported`))
  }
}
