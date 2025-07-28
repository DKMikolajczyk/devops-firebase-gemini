import {Component, inject, OnInit, OnDestroy} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {Auth, signOut, User, user} from '@angular/fire/auth';
import {Observable, Subscription} from 'rxjs';
import {CommonModule, NgIf} from '@angular/common';
import {GeminiService} from './services/gemini.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatCardModule, MatButton, CommonModule, NgIf, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private auth: Auth = inject(Auth);
  title = 'dfg-front';
  user$: Observable<User | null> = user(this.auth);

  personalGreeting: string = '';
  greetingLoading = true;

  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private geminiService: GeminiService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.geminiService.greetingLoading$.subscribe(loading => {
        this.greetingLoading = loading;
      })
    );
    this.fetchPersonalizedGreeting();
  }

  private fetchPersonalizedGreeting(): void {
    this.subscriptions.push(
      this.geminiService.getCurrentUserGreeting().subscribe(greeting => {
        this.personalGreeting = greeting;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async logout() {
    try {
      await signOut(this.auth).then(() => this.router.navigate(['/login']));
    } catch (error: any) {
      console.error('Sign Out Error:', error);
    }
  }
}
