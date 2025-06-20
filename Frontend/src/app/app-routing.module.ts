import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesPageComponent } from './clientes-page/clientes-page.component';
import { DetalheClientePageComponent } from './detalhe-cliente-page/detalhe-cliente-page.component'
import { LoginPageComponent } from './login-page/login-page.component';
import { LoginGuard } from './login-page/login-page.guard';
import { AuthGuard } from './auth/auth.guard';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

const routes: Routes = [
  {
    path: "login",
    component: LoginPageComponent,
    canActivate: [LoginGuard]
  },
  {
    path: "registration",
    component: RegistrationPageComponent
  },
  {
    path: "clientes",
    component: ClientesPageComponent,
    canActivate: [AuthGuard]
  }, 
  {
    path: "cliente/:id",
    component: DetalheClientePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "profile/:id",
    component: ProfilePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path:"**",
    redirectTo:"/home"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
