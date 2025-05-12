import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import {Observable} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Router} from "@angular/router";

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
        MatProgressSpinnerModule
    ],
    template: `
        <mat-card class="login-card">
            <mat-card-content>
                <div *ngIf="(user$ | async) as currentUser; else showLogin">
                    <mat-card-title>Welcome, {{ currentUser.email }}!</mat-card-title>
                    <button mat-raised-button color="warn" (click)="logout()">Sign Out</button>
                    <button mat-button (click)="redirectToHomePage()">Redirect To Home Page</button>

                </div>

                <ng-template #showLogin>
                    <mat-card-title>Sign In / Sign Up</mat-card-title>
                    <p>Please sign in with your email and password.</p>

                    <mat-form-field appearance="fill">
                        <mat-label>Email</mat-label>
                        <input matInput type="email" [(ngModel)]="email">
                    </mat-form-field>

                    <mat-form-field appearance="fill">
                        <mat-label>Password</mat-label>
                        <input matInput type="password" [(ngModel)]="password">
                    </mat-form-field>

                    <div class="button-row">
                        <button mat-raised-button color="primary" [disabled]="loading" (click)="loginWithEmail()">Sign
                            In
                        </button>
                        <button mat-button [disabled]="loading" (click)="createUserWithEmail()">Sign Up</button>
                    </div>

                    <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
                    <mat-spinner *ngIf="loading" [diameter]="30"></mat-spinner>
                </ng-template>
            </mat-card-content>
        </mat-card>
    `,
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    private auth: Auth = inject(Auth);
    user$: Observable<User | null> = user(this.auth);
    email = '';
    password = '';
    errorMessage = '';
    loading = false;

    constructor(private router: Router) {
    }

    async loginWithEmail() {
        this.errorMessage = '';
        this.loading = true;
        try {
            const result = await signInWithEmailAndPassword(this.auth, this.email, this.password);
            console.log('Email sign-in successful:', result.user);
            this.email = '';
            this.password = '';
        } catch (error: any) {
            console.error('Email Sign-In Error:', error);
            this.errorMessage = error.message || 'An unknown error occurred during sign in.';
        } finally {
            this.loading = false;
        }
    }

    async createUserWithEmail() {
        this.errorMessage = '';
        this.loading = true;
        try {
            const result = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
            console.log('User created successfully:', result.user);
            this.email = '';
            this.password = '';
        } catch (error: any) {
            console.error('Create User Error:', error);
            this.errorMessage = error.message || 'An unknown error occurred during sign up.';
        } finally {
            this.loading = false;
        }
    }

    async logout() {
        this.errorMessage = '';
        try {
            await signOut(this.auth);
            console.log('Signed out successfully');
        } catch (error: any) {
            console.error('Sign Out Error:', error);
            this.errorMessage = error.message || 'An unknown error occurred during sign out.';
        }
    }

    redirectToHomePage() {
        this.router.navigate(['']).then();
    }
}
