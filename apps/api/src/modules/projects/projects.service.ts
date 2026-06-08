import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async findAllForUser(userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        homeowner:profiles!homeowner_id(id, full_name, email),
        contractor:profiles!contractor_id(id, full_name, email),
        milestones(id, title, status, amount),
        invoices(id, invoice_number, status, amount)
      `)
      .or(`homeowner_id.eq.${userId},contractor_id.eq.${userId},financier_id.eq.${userId}`)
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
        financier:profiles!financier_id(*),
        milestones(*, approved_by_profile:profiles!approved_by(full_name)),
        invoices(*),
        activity_log(*, actor:profiles!actor_id(full_name))
      `)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Project not found');

    // Verify the requesting user is a participant
    const isParticipant = [data.homeowner_id, data.contractor_id, data.financier_id].includes(userId);
    if (!isParticipant) throw new ForbiddenException('Access denied');

    return data;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...dto, homeowner_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Log the creation event
    await this.logActivity(data.id, userId, 'project.created', 'project', data.id);

    return data;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    // Only the homeowner can update project details
    const { data: project } = await this.supabase
      .from('projects')
      .select('homeowner_id')
      .eq('id', id)
      .single();

    if (!project) throw new NotFoundException('Project not found');
    if (project.homeowner_id !== userId) throw new ForbiddenException('Only the homeowner can update this project');

    const { data, error } = await this.supabase
      .from('projects')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    await this.logActivity(id, userId, 'project.updated', 'project', id);
    return data;
  }

  private async logActivity(
    projectId: string,
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.supabase.from('activity_log').insert({
      project_id: projectId,
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  }
}
