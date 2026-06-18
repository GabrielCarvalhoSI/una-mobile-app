import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FeedbacksService } from './feedbacks.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { AuthGuard } from '../auth/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('feedbacks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private service: FeedbacksService) {}

  @Post()
  @ApiOperation({ summary: 'Registra relato de problema em um ponto' })
  create(@CurrentUser() user: any, @Body() dto: CreateFeedbackDto) {
    return this.service.create(user.id, dto)
  }

  @Get('mine')
  @ApiOperation({ summary: 'Lista relatos enviados pela usuária autenticada' })
  findMine(@CurrentUser() user: any) {
    return this.service.findMine(user.id)
  }
}
