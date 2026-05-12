import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageRequest, PagedResult } from '../../core/models/paging.models';
import { Customer, CustomerWrite } from './customers.models';

export interface CustomerListQuery extends PageRequest {
  city?: string;
  country?: string;
  company?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/customers`;

  list(query: CustomerListQuery = {}): Observable<PagedResult<Customer>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PagedResult<Customer>>(this.base, { params });
  }

  get(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/${id}`);
  }

  create(body: CustomerWrite): Observable<Customer> {
    return this.http.post<Customer>(this.base, body);
  }

  update(id: number, body: CustomerWrite): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
