import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ClientePageComponent } from './cliente-page/cliente-page.component';
import { provideHttpClient } from '@angular/common/http';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TableModule } from 'primeng/table';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { providePrimeNG } from 'primeng/config';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';            
import { MultiSelectModule } from 'primeng/multiselect'; 
import { SelectModule } from 'primeng/select';         
import { TagModule } from 'primeng/tag';                 




@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ClientePageComponent,
    LoginPageComponent,
    RegistrationPageComponent,
  ],
  imports: [
    BrowserModule,
    MultiSelectModule,
    SelectModule,
    TagModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TableModule,
    IconFieldModule,
    InputIconModule,
    MatSnackBarModule
  ],
  providers: [provideHttpClient(), provideNgxMask(), provideAnimationsAsync(), providePrimeNG()],
  bootstrap: [AppComponent]
})
export class AppModule { }
