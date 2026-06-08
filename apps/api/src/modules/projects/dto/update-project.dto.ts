import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsEnum(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;
}
