export interface MonthlySales {
  year: number;
  month: number;
  total: number;
  count: number;
}

export interface StageBreakdown {
  stage: string;
  total: number;
  count: number;
}

export interface TopCustomer {
  customerId: number;
  customerName: string;
  company?: string | null;
  total: number;
  dealCount: number;
}

export interface DashboardOverview {
  totalSales: number;
  newLeads: number;
  openOpportunities: number;
  wonDeals: number;
  lostDeals: number;
  monthlySales: MonthlySales[];
  stageBreakdown: StageBreakdown[];
  topCustomers: TopCustomer[];
}
