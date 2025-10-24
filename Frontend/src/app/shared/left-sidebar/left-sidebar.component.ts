import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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
export class LeftSidebarComponent implements OnInit {
  items: MenuItem[] = [];
  usuario: UsuarioModel | null = null;
  isProfileSelected = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        items: [
          { label: 'Dashboard', icon: 'fa-solid fa-house', routerLink: '/dashboard' },
          { label: 'Clientes', icon: 'fa-regular fa-address-book', routerLink: '/clientes' },
          { label: 'Helpdesk', icon: 'fa-solid fa-headset', routerLink: '/helpdesk' },
          { label: 'Mensagens', icon: 'fa-solid fa-comment', badge: '2', routerLink: '/chat' },
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

    this.isProfileSelected = this.router.url ? this.router.url.includes('/profile') : false;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
        this.isProfileSelected = currentUrl.includes('/profile');
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