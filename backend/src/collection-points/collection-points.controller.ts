import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CollectionPointsService } from './collection-points.service'
import { AuthGuard } from '../auth/auth.guard'

@ApiTags('collection-points')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('collection-points')
export class CollectionPointsController {
  constructor(private service: CollectionPointsService) {}

  // Centro do campus UFPE (Recife) — fallback quando o app não envia GPS
  private static readonly CAMPUS_LAT = -8.0522
  private static readonly CAMPUS_LNG = -34.9511

  @Get()
  @ApiOperation({ summary: 'Lista pontos ativos mais próximos da localização fornecida (cai no centro do campus se lat/lng forem omitidos)' })
  @ApiQuery({ name: 'lat', type: Number, required: false, example: -8.0536 })
  @ApiQuery({ name: 'lng', type: Number, required: false, example: -34.9524 })
  @ApiQuery({ name: 'radius', type: Number, required: false, example: 2000 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  findNearest(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findNearest(
      lat ? parseFloat(lat) : CollectionPointsController.CAMPUS_LAT,
      lng ? parseFloat(lng) : CollectionPointsController.CAMPUS_LNG,
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
