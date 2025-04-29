import {Component, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';

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
export class ErrorComponent implements OnInit {

  errorMessage: string = "";

  constructor(private readonly http: HttpClient) {
  }

  ngOnInit(): void {
    this.simulateApiError(); // Simulate API error
    // this.simulateTypeError(); // Simulate Type error
    // this.simulateCustomError(); // Simulate Custom error
  }

  simulateApiError(): void {
    this.http.get('https://example.com/api/nonexistent')
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.errorMessage = "Received an unexpected response from the server.";
        },
        error: (error) => {
          console.error('API Error:', error);
          this.errorMessage = "Error fetching data from the server.";
        }
      });
  }

  // Simulate a type error
  simulateTypeError(): void {
    try {
      const data: any = 'not an object';
      console.log(data.property.nested);
    } catch (error) {
      console.error('Type Error:', error);
      this.errorMessage = "A type error occurred. Please try again.";
    }
  }

  // Simulate a custom error
  simulateCustomError(): void {
    try {
      throw new Error('Custom error message');
    } catch (error: any) {
      console.error('Custom Error:', error);
      this.errorMessage = error.message;
    }
  }

}
