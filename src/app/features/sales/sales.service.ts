import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageRequest, PagedResult } from '../../core/models/paging.models';
import { Sale, SaleStage, SaleWrite } from './sales.models';

export interface SaleListQuery extends PageRequest {
  customerId?: number;
  userId?: number;
  stage?: SaleStage;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/sales`;

  list(query: SaleListQuery = {}): Observable<PagedResult<Sale>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PagedResult<Sale>>(this.base, { params });
  }

  get(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.base}/${id}`);
  }

  create(body: SaleWrite): Observable<Sale> {
    return this.http.post<Sale>(this.base, body);
  }

  update(id: number, body: SaleWrite): Observable<Sale> {
    return this.http.put<Sale>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  exportCsv(query: SaleListQuery = {}): Observable<Blob> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get(`${this.base}/export`, { params, responseType: 'blob' });
  }
}
