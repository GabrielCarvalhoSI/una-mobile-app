import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { SignUpDto } from './dto/signup.dto'
import { SignInDto } from './dto/signin.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Cadastro de nova usuária' })
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto)
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — retorna access_token JWT' })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto)
  }
}
