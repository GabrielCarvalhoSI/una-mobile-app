import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ProfilesService } from './profiles.service'
import { AuthGuard } from '../auth/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil da usuária autenticada' })
  getMe(@CurrentUser() user: any) {
    return this.profilesService.getMe(user.id)
  }
}
