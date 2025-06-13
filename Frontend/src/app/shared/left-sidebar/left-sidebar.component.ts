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
      { separator: true },
      {
        label: 'Documents',
        items: [
          { label: 'New', icon: 'pi pi-plus', shortcut: '⌘+N' },
          { label: 'Search', icon: 'pi pi-search', shortcut: '⌘+S' }
        ]
      },
      {
        label: 'Profile',
        items: [
          { label: 'Settings', icon: 'pi pi-cog', shortcut: '⌘+O' },
          { label: 'Messages', icon: 'pi pi-inbox', badge: '2' },
          { label: 'Logout', icon: 'pi pi-sign-out', shortcut: '⌘+Q' }
        ]
      },
      { separator: true }
    ];
  }
}