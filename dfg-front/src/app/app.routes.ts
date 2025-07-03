import {Routes} from '@angular/router';
import {ErrorComponent} from './error/error.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthGuard, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {FileUploadComponent} from './file-upload/file-upload.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {authGuardPipe: redirectUnauthorizedToLogin}
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'error/:type',
    component: ErrorComponent
  },
  {
    path: 'file/upload',
    component: FileUploadComponent,
  },
  {
    path: '**',
    redirectTo: '/error'
  }
];
