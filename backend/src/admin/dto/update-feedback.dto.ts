import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { FeedbackStatus } from '../../types/database'

export class UpdateFeedbackDto {
  @ApiProperty({ enum: ['pending', 'in_progress', 'resolved'] })
  @IsEnum(['pending', 'in_progress', 'resolved'], {
    message: 'status deve ser: pending, in_progress ou resolved',
  })
  status: FeedbackStatus
}
