import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle = 'Kern Corp.';
  private sub?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Update title on navigation end
    this.sub = this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => {
          let r: ActivatedRoute | null = this.route;
          while (r?.firstChild) r = r.firstChild;
          return r;
        }),
        map((r) => r?.snapshot.data?.['title'] as string | undefined)
      )
      .subscribe((title) => {
        this.pageTitle = title || 'Kern Corp.';
      });

    // Also set initial title
    const initial = this.getDeepestTitle(this.route);
    if (initial) this.pageTitle = initial;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private getDeepestTitle(route: ActivatedRoute): string | undefined {
    let r: ActivatedRoute | null = route;
    while (r?.firstChild) r = r.firstChild;
    return r?.snapshot.data?.['title'] as string | undefined;
  }
}
