import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsUUID } from 'class-validator'
import { MenstrualItemType } from '../../types/database'

export class WithdrawalDto {
  @ApiProperty({ example: 'uuid-do-ponto' })
  @IsUUID()
  point_id: string

  @ApiProperty({ enum: ['pad', 'tampon', 'panty_liner'], example: 'pad' })
  @IsEnum(['pad', 'tampon', 'panty_liner'], { message: 'item_type deve ser pad, tampon ou panty_liner' })
  item_type: MenstrualItemType
}
