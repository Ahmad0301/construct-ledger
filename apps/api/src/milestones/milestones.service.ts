import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../common/supabase.module';

@Injectable()
export class MilestonesService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  private async verifyAccess(projectId: string, userId: string) {
    const { data: project } = await this.supabase
      .from('projects').select('homeowner_id, contractor_id').eq('id', projectId).single();
    if (!project) throw new NotFoundException('Project not found');
    if (project.homeowner_id !== userId && project.contractor_id !== userId)
      throw new ForbiddenException('Access denied');
    return project;
  }

  async findByProject(projectId: string, userId: string) {
    await this.verifyAccess(projectId, userId);
    const { data, error } = await this.supabase
      .from('milestones').select('*').eq('project_id', projectId).order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  }

  async create(projectId: string, dto: any, userId: string) {
    await this.verifyAccess(projectId, userId);
    const { data, error } = await this.supabase
      .from('milestones').insert({ ...dto, project_id: projectId, submitted_by: userId }).select().single();
    if (error) throw new Error(error.message);
    await this.supabase.from('ledger_entries').insert({
      project_id: projectId, entry_type: 'milestone_created',
      description: `Milestone "${data.title}" created`, amount: data.amount,
      actor_id: userId, reference_id: data.id, reference_type: 'milestone',
    });
    return data;
  }

  async approve(milestoneId: string, userId: string) {
    const { data: m } = await this.supabase
      .from('milestones').select('*, project:projects(homeowner_id, id)').eq('id', milestoneId).single();
    if (!m) throw new NotFoundException('Milestone not found');
    if (m.project.homeowner_id !== userId) throw new ForbiddenException('Only homeowner can approve');
    if (m.status !== 'submitted') throw new BadRequestException('Milestone must be submitted first');
    const { data, error } = await this.supabase
      .from('milestones').update({ status: 'approved', approved_by: userId, approved_at: new Date().toISOString() })
      .eq('id', milestoneId).select().single();
    if (error) throw new Error(error.message);
    await this.supabase.from('ledger_entries').insert({
      project_id: m.project.id, entry_type: 'milestone_approved',
      description: `Milestone "${m.title}" approved`, amount: m.amount,
      actor_id: userId, reference_id: milestoneId, reference_type: 'milestone',
    });
    return data;
  }
}
