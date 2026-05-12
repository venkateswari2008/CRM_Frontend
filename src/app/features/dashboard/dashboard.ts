import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';

import { DashboardOverview } from './dashboard.models';
import { DashboardService } from './dashboard.service';

Chart.register(...registerables);

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly service = inject(DashboardService);

  readonly currentYear = new Date().getFullYear();
  readonly yearControl = new FormControl<number>(this.currentYear, { nonNullable: true });
  readonly yearOptions = Array.from({ length: 5 }, (_, i) => this.currentYear - i);
  readonly loading = signal(false);
  readonly data = signal<DashboardOverview | null>(null);

  readonly chartData = computed<ChartData<'line'>>(() => {
    const overview = this.data();
    const totals = new Array(12).fill(0);
    if (overview) {
      for (const m of overview.monthlySales) {
        totals[m.month - 1] = m.total;
      }
    }
    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          data: totals,
          label: 'Closed-won sales',
          fill: true,
          tension: 0.3,
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26, 115, 232, 0.15)',
          pointBackgroundColor: '#1a73e8',
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => '$' + Number(val).toLocaleString(),
        },
      },
    },
  };

  readonly topCustomerColumns = ['name', 'company', 'dealCount', 'total'];
  readonly stageColumns = ['stage', 'count', 'total'];

  constructor() {
    this.yearControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((year) => this.load(year));
    this.load(this.yearControl.value);
  }

  private load(year: number): void {
    this.loading.set(true);
    this.service.overview(year).subscribe({
      next: (overview) => {
        this.data.set(overview);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
