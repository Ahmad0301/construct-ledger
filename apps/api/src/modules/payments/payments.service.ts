import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * PaymentsService — currently handles manual payment status tracking.
 * Stripe integration will be wired here in Phase 2:
 *   - stripe.paymentIntents.create() before insert
 *   - Webhook handler to confirm payment and mark paid_at
 */
@Injectable()
export class PaymentsService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async findByProject(projectId: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*, invoice:invoices(invoice_number, amount, contractor_id)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async createFromInvoice(invoiceId: string, userId: string) {
    const { data: invoice } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    if (!invoice) throw new NotFoundException('Invoice not found');

    const { data, error } = await this.supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        project_id: invoice.project_id,
        amount: invoice.amount,
        status: 'pending',
        // stripe_payment_id will be populated after Stripe integration
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
