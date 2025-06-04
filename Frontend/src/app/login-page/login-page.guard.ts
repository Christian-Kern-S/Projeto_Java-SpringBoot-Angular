import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      // Se NÃO estiver logado, deixa acessar /login
      return true;
    }
    // Se JÁ estiver logado, manda para /home
    this.router.navigate(['/home']);
    return false;
  }
}
