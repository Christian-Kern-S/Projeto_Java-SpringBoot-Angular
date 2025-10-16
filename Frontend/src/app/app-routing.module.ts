import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesPageComponent } from './clientes-page/clientes-page.component';
import { DetalheClientePageComponent } from './detalhe-cliente-page/detalhe-cliente-page.component'
import { LoginPageComponent } from './login-page/login-page.component';
import { LoginGuard } from './login-page/login-page.guard';
import { AuthGuard } from './auth/auth.guard';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';

const routes: Routes = [
  {
    path: "login",
    component: LoginPageComponent,
    canActivate: [LoginGuard],
    data: { title: 'Login' }
  },
  {
    path: "registration",
    component: RegistrationPageComponent,
    data: { title: 'Cadastro' }
  },
  {
    path: "clientes",
    component: ClientesPageComponent,
    canActivate: [AuthGuard],
    data: { title: 'CLIENTES' }
  }, 
  {
    path: "cliente/:id",
    component: DetalheClientePageComponent,
    canActivate: [AuthGuard],
    data: { title: 'DETALHES DO CLIENTE' }
  },
  {
    path: "profile/:id",
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
    data: { title: 'PERFIL' }
  },
  {
    path: "chat",
    component: ChatPageComponent,
    canActivate: [AuthGuard],
    data: { title: 'CHAT' }
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
