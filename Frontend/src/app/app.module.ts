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


@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ClientePageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TableModule,
    MatSnackBarModule
  ],
  providers: [provideHttpClient(), provideNgxMask(), provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule { }
