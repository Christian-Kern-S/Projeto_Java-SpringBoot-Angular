import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClientesPageComponent } from './clientes-page/clientes-page.component';
import { DetalheClientePageComponent } from './detalhe-cliente-page/detalhe-cliente-page.component';
import { provideHttpClient } from '@angular/common/http';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { LeftSidebarComponent } from '../app/shared/left-sidebar/left-sidebar.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';


@NgModule({
  declarations: [
    AppComponent,
    ClientesPageComponent,
    DetalheClientePageComponent,
    LoginPageComponent,
    RegistrationPageComponent,
    ProfilePageComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    LeftSidebarComponent,
    BrowserAnimationsModule,
    FileUploadModule,
    ButtonModule,
    DialogModule,
    MultiSelectModule,
    RippleModule,
    BadgeModule,
    MenuModule,
    AvatarModule,
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
  providers: [MessageService,provideHttpClient(), provideNgxMask(), provideAnimationsAsync(), providePrimeNG()],
  bootstrap: [AppComponent]
})
export class AppModule { }
