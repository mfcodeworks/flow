import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { Routing } from './auth.routing';
import { MaterialModule } from '../material/material.module';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthorizeComponent } from './components/authorize/authorize.component';

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
  ]
})
export class AuthenticationModule { }
