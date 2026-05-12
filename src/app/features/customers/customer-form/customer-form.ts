import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CustomersService } from '../customers.service';
import { Customer } from '../customers.models';

export interface CustomerFormData {
  customer?: Customer;
}

@Component({
  selector: 'app-customer-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss',
})
export class CustomerForm {
  private readonly fb = inject(FormBuilder);
  private readonly customers = inject(CustomersService);
  private readonly dialogRef = inject(MatDialogRef<CustomerForm, Customer | undefined>);
  protected readonly data = inject<CustomerFormData>(MAT_DIALOG_DATA);

  readonly editing = !!this.data?.customer;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: [this.data?.customer?.firstName ?? '', [Validators.required, Validators.maxLength(50)]],
    lastName: [this.data?.customer?.lastName ?? '', [Validators.required, Validators.maxLength(50)]],
    email: [this.data?.customer?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.data?.customer?.phone ?? ''],
    company: [this.data?.customer?.company ?? ''],
    addressLine: [this.data?.customer?.addressLine ?? ''],
    city: [this.data?.customer?.city ?? ''],
    state: [this.data?.customer?.state ?? ''],
    zipCode: [this.data?.customer?.zipCode ?? ''],
    country: [this.data?.customer?.country ?? ''],
    notes: [this.data?.customer?.notes ?? ''],
  });

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();
    const op$ = this.editing
      ? this.customers.update(this.data.customer!.id, payload)
      : this.customers.create(payload);

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
}
