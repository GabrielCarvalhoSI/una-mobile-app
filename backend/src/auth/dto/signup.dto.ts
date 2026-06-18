import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail, IsString, MinLength, MaxLength,
  IsOptional, IsInt, Min, Max,
} from 'class-validator'

export class SignUpDto {
  @ApiProperty({ example: 'maria@cin.ufpe.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @ApiProperty({ example: 'senhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string

  @ApiProperty({ example: 'Maria Oliveira' })
  @IsString()
  @MaxLength(120)
  full_name: string

  @ApiProperty({ example: 'mariaoli' })
  @IsString()
  @MaxLength(30)
  username: string

  @ApiPropertyOptional({ example: 'ela/dela' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  pronouns?: string

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number

  @ApiPropertyOptional({ example: 28 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  cycle_duration_days?: number

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  menstruation_duration_days?: number
}
