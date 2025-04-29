import { Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: '/error' }
];
