export type SaleStage = 'Qualification' | 'Proposal' | 'Negotiation' | 'ClosedWon' | 'ClosedLost';

export const SALE_STAGES: SaleStage[] = [
  'Qualification',
  'Proposal',
  'Negotiation',
  'ClosedWon',
  'ClosedLost',
];

export interface Sale {
  id: number;
  customerId: number;
  customerName: string;
  company?: string | null;
  userId: number;
  userName: string;
  pipelineName: string;
  stage: SaleStage;
  amount: number;
  saleDate: string;
  expectedCloseDate?: string | null;
  actualCloseDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SaleWrite {
  customerId: number;
  pipelineName: string;
  stage: SaleStage;
  amount: number;
  saleDate: string;
  expectedCloseDate?: string | null;
  notes?: string | null;
}
