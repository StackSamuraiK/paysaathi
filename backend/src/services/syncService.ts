import pool from '../db/index.js';
import { ExternalApiService } from './externalApi.js';

export class SyncService {
  private externalApi = new ExternalApiService();

  async sync() {
    console.log('Starting sync...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Sync Customers
      const externalCustomers = await this.externalApi.getCustomers();
      for (const cust of externalCustomers) {
        await client.query(
          `INSERT INTO customers (external_id, name, email) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (external_id) DO UPDATE 
           SET name = EXCLUDED.name, email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP`,
          [cust.id, cust.name, cust.email]
        );
      }

      // 2. Sync Invoices
      const externalInvoices = await this.externalApi.getInvoices();
      for (const inv of externalInvoices) {
        // Get local customer id
        const custRes = await client.query('SELECT id FROM customers WHERE external_id = $1', [inv.customer_id]);
        if (custRes.rows.length === 0) continue;
        
        const customerId = custRes.rows[0].id;

        await client.query(
          `INSERT INTO invoices (external_id, customer_id, amount, due_date, status) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (external_id) DO UPDATE 
           SET amount = EXCLUDED.amount, due_date = EXCLUDED.due_date, status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP`,
          [inv.id, customerId, inv.amount, inv.due_date, inv.status]
        );
      }

      // 3. Sync Payments
      const externalPayments = await this.externalApi.getPayments();
      for (const pay of externalPayments) {
        // Get local invoice id
        const invRes = await client.query('SELECT id FROM invoices WHERE external_id = $1', [pay.invoice_id]);
        if (invRes.rows.length === 0) continue;
        
        const invoiceId = invRes.rows[0].id;

        await client.query(
          `INSERT INTO payments (external_id, invoice_id, amount, payment_date) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (external_id) DO UPDATE 
           SET amount = EXCLUDED.amount, payment_date = EXCLUDED.payment_date, updated_at = CURRENT_TIMESTAMP`,
          [pay.id, invoiceId, pay.amount, pay.payment_date]
        );
      }

      await client.query('COMMIT');
      console.log('Sync completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Sync failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
