export interface ExternalCustomer {
  id: string;
  name: string;
  email: string;
}

export interface ExternalInvoice {
  id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface ExternalPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
}

export class ExternalApiService {
  async getCustomers(): Promise<ExternalCustomer[]> {
    return [
      { id: 'ext_cust_1', name: 'Acme Corp', email: 'billing@acme.com' },
      { id: 'ext_cust_2', name: 'Globex Corp', email: 'finance@globex.com' },
    ];
  }

  async getInvoices(): Promise<ExternalInvoice[]> {
    return [
      { id: 'ext_inv_1', customer_id: 'ext_cust_1', amount: 1000.00, due_date: '2026-03-01', status: 'OVERDUE' },
      { id: 'ext_inv_2', customer_id: 'ext_cust_1', amount: 500.00, due_date: '2026-04-01', status: 'PENDING' },
      { id: 'ext_inv_3', customer_id: 'ext_cust_2', amount: 2500.00, due_date: '2026-02-15', status: 'PAID' },
    ];
  }

  async getPayments(): Promise<ExternalPayment[]> {
    return [
      { id: 'ext_pay_1', invoice_id: 'ext_inv_3', amount: 2500.00, payment_date: '2026-02-14' },
    ];
  }
}
