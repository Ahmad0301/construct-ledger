import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Riverside Kitchen Renovation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Main St, Austin, TX 78701' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 45000.00 })
  @IsNumber()
  @IsOptional()
  total_budget?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contractor_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  financier_id?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end_date?: string;
}
