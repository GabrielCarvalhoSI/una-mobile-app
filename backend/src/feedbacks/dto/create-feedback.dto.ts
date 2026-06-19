import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator'
import { FeedbackCategory } from '../../types/database'

export class CreateFeedbackDto {
  @ApiProperty({ example: 'uuid-do-ponto' })
  @IsUUID()
  point_id: string

  @ApiProperty({ enum: ['empty_stock', 'damaged', 'inaccessible', 'other'] })
  @IsEnum(['empty_stock', 'damaged', 'inaccessible', 'other'], {
    message: 'category deve ser: empty_stock, damaged, inaccessible ou other',
  })
  category: FeedbackCategory

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_specific?: boolean

  @ApiPropertyOptional({ example: 'A torneira está com vazamento' })
  @ValidateIf((o) => o.is_specific === true)
  @IsString({ message: 'description é obrigatória quando is_specific é true' })
  description?: string
}
