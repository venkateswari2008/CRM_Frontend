import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';

import { UserRole } from '../models/auth.models';
import { AuthService } from './auth.service';

/**
 * Structural directive that renders its content only when the current user's
 * role matches the supplied role (or any role in the supplied array).
 *
 * Usage:
 *   <button *appHasRole="'Admin'">Delete</button>
 *   <a *appHasRole="['Admin']">Admin tools</a>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vc = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);
  private readonly allowedRoles = signal<UserRole[]>([]);

  @Input({ required: true }) set appHasRole(role: UserRole | UserRole[]) {
    this.allowedRoles.set(Array.isArray(role) ? role : [role]);
  }

  constructor() {
    // React to both input changes and role changes (e.g. after logout).
    effect(() => {
      const roles = this.allowedRoles();
      const current = this.auth.role();
      const allowed = current !== null && roles.includes(current);
      this.vc.clear();
      if (allowed) {
        this.vc.createEmbeddedView(this.tpl);
      }
    });
  }
}
