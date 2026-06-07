import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects for current user' })
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with milestones and members' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project (homeowner only)' })
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req: any) {
    return this.projectsService.update(id, dto, req.user.id);
  }

  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get immutable project ledger/audit log' })
  getLedger(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.getLedger(id, req.user.id);
  }
}
