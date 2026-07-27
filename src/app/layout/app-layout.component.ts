import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, TagModule],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {
  constructor(
    protected authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}