import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { DonationDto } from './dto/donation.dto'

@Injectable()
export class TransactionsService {
  constructor(private supabase: SupabaseService) {}

  async withdraw(userId: string, dto: WithdrawalDto) {
    // Verifica se ponto existe e está ativo
    const { data: point } = await this.supabase.admin
      .from('collection_points')
      .select('id, status')
      .eq('id', dto.point_id)
      .single()

    if (!point) throw new NotFoundException('Ponto de coleta não encontrado')
    if (point.status !== 'active') {
      throw new BadRequestException('Este ponto não está disponível para retirada')
    }

    // Verifica limite diário — 1 retirada por usuária por dia
    const { data: alreadyWithdrawn } = await this.supabase.admin.rpc(
      'has_user_withdrawn_today',
      { p_user_id: userId },
    )

    if (alreadyWithdrawn) {
      throw new BadRequestException(
        'Você já realizou uma retirada hoje. Limite: 1 item por dia.',
      )
    }

    // Verifica estoque disponível
    const { data: inventory } = await this.supabase.admin
      .from('inventory')
      .select('quantity')
      .eq('point_id', dto.point_id)
      .eq('item_type', dto.item_type)
      .single()

    if (!inventory) {
      throw new BadRequestException('Produto não cadastrado neste ponto')
    }
    if (inventory.quantity < 1) {
      throw new BadRequestException('Estoque esgotado neste ponto para o produto selecionado')
    }

    // Insere a transação — o trigger adjust_inventory_on_transaction atualiza o estoque
    // com SELECT FOR UPDATE (seguro para acessos simultâneos)
    const { data: transaction, error } = await this.supabase.admin
      .from('transactions')
      .insert({
        type: 'withdrawal',
        user_id: userId,
        point_id: dto.point_id,
        item_type: dto.item_type,
        quantity: 1,
      })
      .select('id, type, item_type, quantity, created_at')
      .single()

    if (error) throw new BadRequestException(error.message)

    // Busca estoque atualizado para retornar ao app
    const { data: updatedInventory } = await this.supabase.admin
      .from('inventory')
      .select('item_type, quantity')
      .eq('point_id', dto.point_id)
      .eq('item_type', dto.item_type)
      .single()

    // Verifica se estoque ficou baixo
    const { data: isLow } = await this.supabase.admin.rpc('is_stock_low', {
      p_point_id: dto.point_id,
      p_item_type: dto.item_type,
    })

    return {
      message: 'Retirada realizada com sucesso',
      transaction,
      inventory: updatedInventory,
      stock_alert: isLow ? 'Estoque baixo neste ponto' : null,
    }
  }

  async donate(userId: string, dto: DonationDto) {
    // Verifica se ponto existe
    const { data: point } = await this.supabase.admin
      .from('collection_points')
      .select('id, status')
      .eq('id', dto.point_id)
      .single()

    if (!point) throw new NotFoundException('Ponto de coleta não encontrado')

    // Verifica se produto está cadastrado no ponto (inventory row deve existir)
    const { data: inventory } = await this.supabase.admin
      .from('inventory')
      .select('quantity')
      .eq('point_id', dto.point_id)
      .eq('item_type', dto.item_type)
      .single()

    if (!inventory) {
      throw new BadRequestException('Produto não cadastrado neste ponto')
    }

    // Insere doação — trigger soma ao estoque
    const { data: transaction, error } = await this.supabase.admin
      .from('transactions')
      .insert({
        type: 'donation',
        user_id: userId,
        point_id: dto.point_id,
        item_type: dto.item_type,
        quantity: dto.quantity,
        notes: dto.notes ?? null,
      })
      .select('id, type, item_type, quantity, created_at')
      .single()

    if (error) throw new BadRequestException(error.message)

    const { data: updatedInventory } = await this.supabase.admin
      .from('inventory')
      .select('item_type, quantity')
      .eq('point_id', dto.point_id)
      .eq('item_type', dto.item_type)
      .single()

    return {
      message: 'Doação registrada com sucesso',
      transaction,
      inventory: updatedInventory,
    }
  }
}
