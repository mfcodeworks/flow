import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { Routing } from './auth.routing';
import { MaterialModule } from '../material/material.module';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import { SharedModule } from '../shared/shared.module';

// TODO: Fix height of auth components (Follow Authorization page)
@NgModule({
  imports: [
    Routing,
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    SharedModule
  ],
  declarations: [
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthorizeComponent
  ]
})
export class AuthenticationModule { }
