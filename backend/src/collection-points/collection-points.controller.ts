import { Controller, Get, Param, ParseFloatPipe, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CollectionPointsService } from './collection-points.service'
import { AuthGuard } from '../auth/auth.guard'

@ApiTags('collection-points')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('collection-points')
export class CollectionPointsController {
  constructor(private service: CollectionPointsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista pontos ativos mais próximos da localização fornecida' })
  @ApiQuery({ name: 'lat', type: Number, example: -8.0536 })
  @ApiQuery({ name: 'lng', type: Number, example: -34.9524 })
  @ApiQuery({ name: 'radius', type: Number, required: false, example: 2000 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  findNearest(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findNearest(
      lat,
      lng,
      radius ? parseFloat(radius) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um ponto com estoque por tipo de produto' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id)
  }
}
