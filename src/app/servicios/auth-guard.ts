import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../servicios/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const roles = route.data['roles'] as string[];
    if (roles && roles.length > 0 && !this.auth.hasRole(roles)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
