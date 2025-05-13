import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Router} from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  user,
} from '@angular/fire/auth';
import {Observable, of, switchMap} from 'rxjs';
import {Database, get, ref, set} from '@angular/fire/database';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card class="login-card">
      <mat-card-content>
        <div *ngIf="(user$ | async) as currentUser; else showLogin">
          <mat-card-title>Welcome, {{ (userName$ | async) }}!</mat-card-title>
          <p>Email: {{ currentUser.email }}</p>
          <button mat-raised-button color="warn" (click)="logout()">Sign Out</button>
          <button mat-button (click)="redirectToHomePage()">Redirect To Home Page</button>

        </div>

        <ng-template #showLogin>
          <mat-card-title>Sign In / Sign Up</mat-card-title>
          <p>Please sign in with your email and password.</p>

          <mat-form-field appearance="fill">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email"/>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Password</mat-label>
            <input matInput type="password" [(ngModel)]="password"/>
          </mat-form-field>

          <mat-form-field appearance="fill" *ngIf="isSignUp">
            <mat-label>Name</mat-label>
            <input matInput type="text" [(ngModel)]="name"/>
          </mat-form-field>

          <div class="button-row">
            <button
              mat-raised-button
              color="primary"
              [disabled]="loading"
              (click)="loginWithEmail()"
            >
              Sign In
            </button>
            <button
              mat-button
              [disabled]="loading"
              (click)="toggleSignUp()"
            >
              {{ isSignUp ? 'Cancel' : 'Sign Up' }}
            </button>
            <button mat-button [disabled]="loading" (click)="createUserWithEmail()" *ngIf="isSignUp">
              Sign Up
            </button>
          </div>

          <p *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>
          <mat-spinner *ngIf="loading" [diameter]="30"></mat-spinner>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private db: Database = inject(Database);
  user$: Observable<User | null> = user(this.auth);
  userName$: Observable<string | null> = of(null);
  email = '';
  password = '';
  name = '';
  errorMessage = '';
  loading = false;
  isSignUp = false;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.initUserName();
  }

  toggleSignUp() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
  }

  async loginWithEmail() {
    this.errorMessage = '';
    this.loading = true;
    try {
      await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      // Set userName$ here
      this.initUserName();

      this.email = '';
      this.password = '';
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      this.errorMessage =
        error.message || 'An unknown error occurred during sign in.';
    } finally {
      this.loading = false;
    }
  }

  async createUserWithEmail() {
    this.errorMessage = '';
    this.loading = true;
    if (!this.name) {
      this.errorMessage = 'Please enter your name.';
      this.loading = false;
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      await updateProfile(result.user, {
        displayName: this.name,
      });

      const userRef = ref(this.db, `users/${result.user.uid}`);
      await set(userRef, {
        name: this.name,
        email: this.email,
      });

      this.userName$ = of(this.name);
      this.isSignUp = false;
    } catch (error: any) {
      console.error('Create User Error:', error);
      this.errorMessage =
        error.message || 'An unknown error occurred during sign up.';
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    this.errorMessage = '';
    try {
      await signOut(this.auth);
      this.userName$ = of(null);
      console.log('Signed out successfully');
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      this.errorMessage =
        error.message || 'An unknown error occurred during sign out.';
    }
  }

  redirectToHomePage() {
    this.router.navigate(['']).then();
  }

  private initUserName() {
    this.userName$ = this.user$.pipe(
      switchMap((user) => {
        if (user) {
          const userRef = ref(this.db, `users/${user.uid}/name`);
          return get(userRef).then((snapshot) => {
            return snapshot.exists() ? snapshot.val() : user.email;
          }).catch(() => {
            return user.email;
          });
        } else {
          return of(null);
        }
      })
    );
  }
}

