import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator'
import { MenstrualItemType } from '../../types/database'

export class DonationDto {
  @ApiProperty({ example: 'uuid-do-ponto' })
  @IsUUID()
  point_id: string

  @ApiProperty({ enum: ['pad', 'tampon', 'panty_liner'], example: 'pad' })
  @IsEnum(['pad', 'tampon', 'panty_liner'], { message: 'item_type deve ser pad, tampon ou panty_liner' })
  item_type: MenstrualItemType

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt()
  @Min(1, { message: 'A quantidade doada deve ser maior que zero' })
  quantity: number

  @ApiPropertyOptional({ example: 'Doação da turma de CC 2024.1' })
  @IsOptional()
  @IsString()
  notes?: string
}
