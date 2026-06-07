import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MilestonesService } from './milestones.service';

@ApiTags('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/milestones')
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  @Get()
  @ApiOperation({ summary: 'List milestones for a project' })
  findAll(@Param('projectId') projectId: string, @Request() req: any) {
    return this.milestonesService.findByProject(projectId, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a milestone' })
  create(@Param('projectId') projectId: string, @Body() dto: any, @Request() req: any) {
    return this.milestonesService.create(projectId, dto, req.user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a milestone (homeowner only)' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.milestonesService.approve(id, req.user.id);
  }
}
