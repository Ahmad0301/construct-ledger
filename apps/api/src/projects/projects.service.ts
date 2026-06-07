import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../common/supabase.module';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        homeowner:profiles!homeowner_id(id, full_name, avatar_url),
        contractor:profiles!contractor_id(id, full_name, company_name)
      `)
      .or(`homeowner_id.eq.${userId},contractor_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        homeowner:profiles!homeowner_id(*),
        contractor:profiles!contractor_id(*),
        project_members(*, user:profiles(*)),
        milestones(* order by sort_order asc)
      `)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Project not found');

    // Verify access
    const hasAccess =
      data.homeowner_id === userId ||
      data.contractor_id === userId ||
      data.project_members?.some((m: any) => m.user_id === userId);

    if (!hasAccess) throw new ForbiddenException('Access denied');
    return data;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...dto, homeowner_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Log to ledger
    await this.supabase.from('ledger_entries').insert({
      project_id: data.id,
      entry_type: 'project_created',
      description: `Project "${data.name}" created`,
      actor_id: userId,
      reference_id: data.id,
      reference_type: 'project',
    });

    return data;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    // Verify ownership
    const { data: project } = await this.supabase
      .from('projects')
      .select('homeowner_id, contractor_id')
      .eq('id', id)
      .single();

    if (!project) throw new NotFoundException('Project not found');
    if (project.homeowner_id !== userId && project.contractor_id !== userId) {
      throw new ForbiddenException('Not authorized to update this project');
    }

    const { data, error } = await this.supabase
      .from('projects')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getLedger(projectId: string, userId: string) {
    await this.findOne(projectId, userId); // Access check
    const { data, error } = await this.supabase
      .from('ledger_entries')
      .select('*, actor:profiles!actor_id(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}
