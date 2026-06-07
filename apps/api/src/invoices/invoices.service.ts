import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../common/supabase.module';

@Injectable()
export class InvoicesService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async findByProject(projectId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*, issued_by_profile:profiles!issued_by(full_name), milestone:milestones(title)')
      .eq('project_id', projectId)
      .or(`issued_by.eq.${userId},issued_to.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async create(projectId: string, dto: any, userId: string) {
    // Generate invoice number: INV-YYYYMM-XXXX
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { count } = await this.supabase
      .from('invoices').select('*', { count: 'exact', head: true })
      .like('invoice_number', `${prefix}%`);
    const invoiceNumber = `${prefix}-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await this.supabase
      .from('invoices')
      .insert({ ...dto, project_id: projectId, issued_by: userId, invoice_number: invoiceNumber })
      .select().single();
    if (error) throw new Error(error.message);

    await this.supabase.from('ledger_entries').insert({
      project_id: projectId, entry_type: 'invoice_created',
      description: `Invoice ${invoiceNumber} created for $${data.amount}`,
      amount: data.amount, actor_id: userId, reference_id: data.id, reference_type: 'invoice',
    });
    return data;
  }

  async approve(id: string, userId: string) {
    const { data: inv } = await this.supabase
      .from('invoices').select('*, project:projects(homeowner_id)').eq('id', id).single();
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.project.homeowner_id !== userId) throw new ForbiddenException('Only homeowner can approve invoices');
    const { data, error } = await this.supabase
      .from('invoices').update({ status: 'approved' }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    await this.supabase.from('ledger_entries').insert({
      project_id: inv.project_id, entry_type: 'invoice_approved',
      description: `Invoice ${inv.invoice_number} approved for payment`,
      amount: inv.amount, actor_id: userId, reference_id: id, reference_type: 'invoice',
    });
    return data;
  }
}
