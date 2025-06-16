import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';

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

  ngOnInit(): void {
    this.items = [
      {
        items: [
          { label: 'Dashboard', icon: 'fa-solid fa-house' },
          { label: 'Clientes', icon: 'fa-regular fa-address-book' },
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
  }
}