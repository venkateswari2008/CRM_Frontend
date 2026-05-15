import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { CustomerForm } from '../customer-form/customer-form';
import { Customer } from '../customers.models';
import { CustomersService } from '../customers.service';

@Component({
  selector: 'app-customer-list',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    HasRoleDirective,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
})
export class CustomerList {
  private readonly customers = inject(CustomersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly items = signal<Customer[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly loading = signal(false);

  readonly search = new FormControl('', { nonNullable: true });

  readonly displayedColumns = ['name', 'email', 'phone', 'company', 'city', 'actions'];

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customers
      .list({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search.value || undefined,
        sort: '-created',
      })
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.total.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  create(): void {
    const ref = this.dialog.open<CustomerForm, unknown, Customer>(CustomerForm, {
      width: '720px',
      data: {},
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackbar.open(`Customer "${saved.fullName}" created`, 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  edit(customer: Customer): void {
    const ref = this.dialog.open<CustomerForm, unknown, Customer>(CustomerForm, {
      width: '720px',
      data: { customer },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackbar.open(`Customer "${saved.fullName}" updated`, 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  remove(customer: Customer): void {
    const ref = this.dialog.open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete customer?',
        message: `This will remove "${customer.fullName}". You can restore from soft-deleted records server-side.`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.customers.delete(customer.id).subscribe(() => {
        this.snackbar.open(`Customer "${customer.fullName}" deleted`, 'OK', { duration: 3000 });
        this.load();
      });
    });
  }
}
