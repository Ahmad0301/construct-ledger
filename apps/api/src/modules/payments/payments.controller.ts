import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.paymentsService.findByProject(projectId);
  }

  @Post('from-invoice/:invoiceId')
  createFromInvoice(@Param('invoiceId') invoiceId: string, @CurrentUser() user: any) {
    return this.paymentsService.createFromInvoice(invoiceId, user.id);
  }
}
