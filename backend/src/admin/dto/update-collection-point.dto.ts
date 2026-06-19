import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { CollectionPointStatus } from '../../types/database'

export class UpdateCollectionPointDto {
  @ApiPropertyOptional({ example: 'Ponto CIn — Bloco B' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'maintenance'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: CollectionPointStatus

  @ApiPropertyOptional({ example: '2º andar' })
  @IsOptional()
  @IsString()
  floor?: string

  @ApiPropertyOptional({ example: 'Banheiro feminino ala leste' })
  @IsOptional()
  @IsString()
  room?: string
}
