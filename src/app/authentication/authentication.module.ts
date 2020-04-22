import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Routing } from './auth.routing';
import { MaterialModule } from '../material/material.module';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthorizeComponent } from './components/authorize/authorize.component';
import { IonicModule } from '@ionic/angular';

// TODO: Fix height of auth components (Follow Authorization page)
@NgModule({
  declarations: [
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthorizeComponent
  ],
  imports: [
    Routing,
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    IonicModule.forRoot()
  ],
  exports: [
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthorizeComponent
  ]
})
export class AuthenticationModule { }
