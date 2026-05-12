export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  company?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CustomerWrite {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  company?: string | null;
  notes?: string | null;
}
