import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class SignInDto {
  @ApiProperty({ example: 'maria@cin.ufpe.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  @MinLength(6)
  password: string
}
