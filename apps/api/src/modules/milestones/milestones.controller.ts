import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Get('projects/:projectId/milestones')
  findByProject(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.milestonesService.findByProject(projectId, user.id);
  }

  @Post('projects/:projectId/milestones')
  create(@Param('projectId') projectId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.milestonesService.create(projectId, dto, user.id);
  }

  @Patch('milestones/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.milestonesService.approve(id, user.id);
  }
}
