import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TransactionsService } from './transactions.service'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { DonationDto } from './dto/donation.dto'
import { AuthGuard } from '../auth/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Post('withdrawal')
  @ApiOperation({ summary: 'Retirada de 1 absorvente — verifica limite diário e estoque' })
  withdraw(@CurrentUser() user: any, @Body() dto: WithdrawalDto) {
    return this.service.withdraw(user.id, dto)
  }

  @Post('donation')
  @ApiOperation({ summary: 'Doação de absorventes — soma ao estoque do ponto' })
  donate(@CurrentUser() user: any, @Body() dto: DonationDto) {
    return this.service.donate(user.id, dto)
  }
}
