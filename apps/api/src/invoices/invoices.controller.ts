import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices for a project' })
  findAll(@Param('projectId') projectId: string, @Request() req: any) {
    return this.invoicesService.findByProject(projectId, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an invoice (contractor)' })
  create(@Param('projectId') projectId: string, @Body() dto: any, @Request() req: any) {
    return this.invoicesService.create(projectId, dto, req.user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve invoice for payment (homeowner)' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.invoicesService.approve(id, req.user.id);
  }
}
