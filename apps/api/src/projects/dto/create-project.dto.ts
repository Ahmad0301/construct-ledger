import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateProjectDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsString() @IsNotEmpty() address: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() budget?: number;
  @ApiPropertyOptional() @IsDateString() @IsOptional() start_date?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() estimated_end_date?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() contractor_id?: string;
}
