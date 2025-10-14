import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    BadgeModule,
    RippleModule,
    AvatarModule
  ],
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.css']
})
export class LeftSidebarComponent {
  items: MenuItem[] = [];
  usuario: UsuarioModel | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        items: [
          { label: 'Dashboard', icon: 'fa-solid fa-house', command: () => this.router.navigate(['/dashboard']) },
          { label: 'Clientes', icon: 'fa-regular fa-address-book', command: () => this.router.navigate(['/clientes']) },
          { label: 'Helpdesk', icon: 'fa-solid fa-headset', command: () => this.router.navigate(['/helpdesk']) },
          { label: 'Mensagens', icon: 'fa-solid fa-comment', badge: '2', command: () => this.router.navigate(['/chat']) },
        ]
      },
      { separator: true },
      {
        items: [
          { label: 'Configurações', icon: 'fa-solid fa-gear' },
          { label: 'Sair', icon: 'fa-solid fa-right-from-bracket', command: () => this.logout() }
        ]
      },
    ];

    this.authService.getCurrentUser().subscribe({
      next: (u: UsuarioModel) => {
        this.usuario = u;
      },
      error: (err) => {
        console.error('Não foi possível obter o usuário logado', err);
        this.router.navigate(['/login']);
      }
    });
  }
  verifyUserRole(): string {
    return this.usuario?.role === "ROLE_ADMIN" ? "Admin" : "Usuário";
  }

  navigate(): void {
    this.router.navigate(['/profile', this.usuario?.id_user]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}