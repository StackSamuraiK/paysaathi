import { Router, type Request, type Response } from 'express';
import pool from '../db/index.js';

const router = Router();

// GET /api/insights/receivables - Total outstanding balances
router.get('/receivables', async (req: Request, res: Response) => {
  try {
    const queryResult = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_outstanding 
      FROM invoices 
      WHERE status IN ('PENDING', 'OVERDUE')
    `);
    res.json(queryResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/insights/overdue - List of overdue invoices
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const queryResult = await pool.query(`
      SELECT 
        i.*, 
        c.name as customer_name 
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.status = 'OVERDUE'
      ORDER BY i.due_date ASC
    `);
    res.json(queryResult.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/customers/:id/summary - Customer-specific financial health
router.get('/customers/:id/summary', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const summary = await pool.query(`
      SELECT 
        c.name,
        COALESCE(SUM(CASE WHEN i.status = 'PAID' THEN i.amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN i.status != 'PAID' THEN i.amount ELSE 0 END), 0) as total_outstanding,
        COUNT(CASE WHEN i.status = 'OVERDUE' THEN 1 END) as overdue_count
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (summary.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(summary.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
