import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ClientePageComponent } from './cliente-page/cliente-page.component'

const routes: Routes = [
  {
    path: "home",
    component: HomePageComponent
  }, 
  {
    path: "cliente/:id",
    component: ClientePageComponent
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
