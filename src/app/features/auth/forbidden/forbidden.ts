import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="forbidden">
      <mat-icon class="icon">block</mat-icon>
      <h1>403 - Access denied</h1>
      <p class="muted">You don't have permission to view this page.</p>
      <a mat-flat-button color="primary" routerLink="/dashboard">Back to dashboard</a>
    </div>
  `,
  styles: [
    `.forbidden { min-height: 70vh; display: grid; place-items: center; text-align: center; gap: 8px; }
     .icon { font-size: 64px; width: 64px; height: 64px; color: #b3261e; }`,
  ],
})
export class Forbidden {}
