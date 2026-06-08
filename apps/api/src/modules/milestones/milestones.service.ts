import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MilestonesService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async findByProject(projectId: string, userId: string) {
    await this.assertParticipant(projectId, userId);
    const { data, error } = await this.supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  }

  async create(projectId: string, dto: any, userId: string) {
    const project = await this.assertParticipant(projectId, userId);
    if (project.contractor_id !== userId) throw new ForbiddenException('Only the contractor can create milestones');

    const { data, error } = await this.supabase
      .from('milestones')
      .insert({ ...dto, project_id: projectId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async approve(milestoneId: string, userId: string) {
    const { data: milestone } = await this.supabase
      .from('milestones')
      .select('*, project:projects(homeowner_id)')
      .eq('id', milestoneId)
      .single();

    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.project.homeowner_id !== userId) throw new ForbiddenException('Only the homeowner can approve milestones');
    if (milestone.status !== 'submitted') throw new BadRequestException('Milestone must be in "submitted" status to approve');

    const { data, error } = await this.supabase
      .from('milestones')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: userId })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  private async assertParticipant(projectId: string, userId: string) {
    const { data } = await this.supabase
      .from('projects')
      .select('homeowner_id, contractor_id, financier_id')
      .eq('id', projectId)
      .single();
    if (!data) throw new NotFoundException('Project not found');
    const isParticipant = [data.homeowner_id, data.contractor_id, data.financier_id].includes(userId);
    if (!isParticipant) throw new ForbiddenException('Access denied');
    return data;
  }
}
