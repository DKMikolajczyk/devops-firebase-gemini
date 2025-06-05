import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {Auth, signOut, User, user} from '@angular/fire/auth';
import {Observable} from 'rxjs';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatCardModule, MatButton, CommonModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private auth: Auth = inject(Auth);
  title = 'dfg-front';
  user$: Observable<User | null> = user(this.auth);

  constructor(private router: Router) {
  }

  async logout() {
    try {
      await signOut(this.auth).then(() => this.router.navigate(['/login']));
    } catch (error: any) {
      console.error('Sign Out Error:', error);
    }
  }}
