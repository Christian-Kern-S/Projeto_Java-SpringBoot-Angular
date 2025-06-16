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
          { label: 'Dashboard', icon: 'fa-solid fa-house' },
          { label: 'Clientes', icon: 'fa-regular fa-address-book' },
          { label: 'Helpdesk', icon: 'fa-solid fa-headset' },
          { label: 'Mensagens', icon: 'fa-solid fa-comment', badge: '2' }
        ]
      },
      { separator: true },
      {
        items: [
          { label: 'Configurações', icon: 'fa-solid fa-gear' },
          { label: 'Sair', icon: 'fa-solid fa-right-from-bracket' }
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
}