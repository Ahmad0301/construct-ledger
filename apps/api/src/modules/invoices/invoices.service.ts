import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class InvoicesService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async findAllForUser(userId: string) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*, project:projects(title, homeowner_id, financier_id), milestone:milestones(title)')
      .or(`contractor_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async create(dto: any, userId: string) {
    const invoiceNumber = `INV-${Date.now()}`;
    const { data, error } = await this.supabase
      .from('invoices')
      .insert({ ...dto, contractor_id: userId, invoice_number: invoiceNumber, status: 'draft' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(id: string, status: string, userId: string) {
    const { data: invoice } = await this.supabase
      .from('invoices')
      .select('*, project:projects(homeowner_id, financier_id)')
      .eq('id', id)
      .single();
    if (!invoice) throw new NotFoundException('Invoice not found');

    const canUpdate =
      invoice.contractor_id === userId ||
      invoice.project.homeowner_id === userId ||
      invoice.project.financier_id === userId;
    if (!canUpdate) throw new ForbiddenException('Access denied');

    const { data, error } = await this.supabase
      .from('invoices')
      .update({ status, ...(status === 'submitted' ? { submitted_at: new Date().toISOString() } : {}), ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {}) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
