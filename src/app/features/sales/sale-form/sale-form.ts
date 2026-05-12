import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { Customer } from '../../customers/customers.models';
import { CustomersService } from '../../customers/customers.service';
import { Sale, SALE_STAGES, SaleStage } from '../sales.models';
import { SalesService } from '../sales.service';

export interface SaleFormData {
  sale?: Sale;
}

@Component({
  selector: 'app-sale-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './sale-form.html',
  styleUrl: '../../customers/customer-form/customer-form.scss',
})
export class SaleForm {
  private readonly fb = inject(FormBuilder);
  private readonly sales = inject(SalesService);
  private readonly customers = inject(CustomersService);
  private readonly dialogRef = inject(MatDialogRef<SaleForm, Sale | undefined>);
  protected readonly data = inject<SaleFormData>(MAT_DIALOG_DATA);

  readonly editing = !!this.data?.sale;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly stages = SALE_STAGES;
  readonly customerOptions = signal<Customer[]>([]);

  readonly form = this.fb.nonNullable.group({
    customerId: [this.data?.sale?.customerId ?? 0, [Validators.required, Validators.min(1)]],
    pipelineName: [
      this.data?.sale?.pipelineName ?? '',
      [Validators.required, Validators.maxLength(100)],
    ],
    stage: [(this.data?.sale?.stage ?? 'Qualification') as SaleStage, Validators.required],
    amount: [this.data?.sale?.amount ?? 0, [Validators.required, Validators.min(0)]],
    saleDate: [
      this.data?.sale?.saleDate ? new Date(this.data.sale.saleDate) : new Date(),
      Validators.required,
    ],
    expectedCloseDate: [
      this.data?.sale?.expectedCloseDate ? new Date(this.data.sale.expectedCloseDate) : null,
    ],
    notes: [this.data?.sale?.notes ?? ''],
  });

  constructor() {
    // Load customers for the dropdown — pull a generous first page; in production
    // this would switch to a typeahead-search.
    this.customers.list({ pageSize: 100, sort: 'name' }).subscribe((page) => {
      this.customerOptions.set(page.items);
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      customerId: raw.customerId,
      pipelineName: raw.pipelineName,
      stage: raw.stage,
      amount: raw.amount,
      saleDate: this.toIsoDate(raw.saleDate),
      expectedCloseDate: raw.expectedCloseDate ? this.toIsoDate(raw.expectedCloseDate) : null,
      notes: raw.notes,
    };

    const op$ = this.editing
      ? this.sales.update(this.data.sale!.id, payload)
      : this.sales.create(payload);

    op$.subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Save failed.');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private toIsoDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
