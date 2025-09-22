import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login';
import { LoginForm } from './components/login-form/login-form';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    Login,
    LoginForm
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
