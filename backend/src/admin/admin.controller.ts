import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'
import { AuthGuard } from '../auth/auth.guard'
import { AdminGuard } from '../auth/admin.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('feedbacks')
  @ApiOperation({ summary: '[Admin] Lista todos os relatos com dados do ponto e da usuária' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'resolved'] })
  listFeedbacks(@Query('status') status?: string) {
    return this.service.listFeedbacks(status)
  }

  @Patch('feedbacks/:id')
  @ApiOperation({ summary: '[Admin] Atualiza status de um relato' })
  updateFeedback(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.service.updateFeedback(user.id, id, dto)
  }

  @Get('collection-points')
  @ApiOperation({ summary: '[Admin] Lista todos os pontos incluindo inativos e em manutenção' })
  listCollectionPoints() {
    return this.service.listCollectionPoints()
  }

  @Patch('collection-points/:id')
  @ApiOperation({ summary: '[Admin] Atualiza dados ou status de um ponto' })
  updateCollectionPoint(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionPointDto,
  ) {
    return this.service.updateCollectionPoint(id, dto)
  }
}
