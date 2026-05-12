import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DashboardOverview } from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  overview(year?: number): Observable<DashboardOverview> {
    let params = new HttpParams();
    if (year !== undefined) {
      params = params.set('year', String(year));
    }
    return this.http.get<DashboardOverview>(`${environment.apiBaseUrl}/dashboard`, { params });
  }
}
