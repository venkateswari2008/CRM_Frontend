import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SaleForm } from '../sale-form/sale-form';
import { Sale, SALE_STAGES, SaleStage } from '../sales.models';
import { SalesService } from '../sales.service';

@Component({
  selector: 'app-sale-list',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    HasRoleDirective,
  ],
  templateUrl: './sale-list.html',
  styleUrl: '../../customers/customer-list/customer-list.scss',
})
export class SaleList {
  private readonly sales = inject(SalesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly items = signal<Sale[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly loading = signal(false);
  readonly stages = SALE_STAGES;

  readonly search = new FormControl('', { nonNullable: true });
  readonly stageFilter = new FormControl<SaleStage | ''>('', { nonNullable: true });

  readonly displayedColumns = [
    'name',
    'company',
    'pipeline',
    'amount',
    'stage',
    'saleDate',
    'closeDate',
    'actions',
  ];

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });
    this.stageFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.page.set(1);
      this.load();
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.sales
      .list({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search.value || undefined,
        stage: (this.stageFilter.value as SaleStage) || undefined,
        sort: '-date',
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

  stageClass(stage: SaleStage): string {
    return `stage stage--${stage.toLowerCase()}`;
  }

  create(): void {
    const ref = this.dialog.open<SaleForm, unknown, Sale>(SaleForm, { width: '720px', data: {} });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackbar.open(`Sale "${saved.pipelineName}" created`, 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  edit(sale: Sale): void {
    const ref = this.dialog.open<SaleForm, unknown, Sale>(SaleForm, {
      width: '720px',
      data: { sale },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackbar.open(`Sale "${saved.pipelineName}" updated`, 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  remove(sale: Sale): void {
    const ref = this.dialog.open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete sale?',
        message: `Remove "${sale.pipelineName}" (${sale.customerName})?`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.sales.delete(sale.id).subscribe(() => {
        this.snackbar.open(`Sale "${sale.pipelineName}" deleted`, 'OK', { duration: 3000 });
        this.load();
      });
    });
  }

  exportCsv(): void {
    this.sales
      .exportCsv({
        search: this.search.value || undefined,
        stage: (this.stageFilter.value as SaleStage) || undefined,
      })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
  }
}
