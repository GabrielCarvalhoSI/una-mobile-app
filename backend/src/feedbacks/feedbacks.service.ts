import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'

@Injectable()
export class FeedbacksService {
  constructor(private supabase: SupabaseService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    // Valida que o ponto existe
    const { data: point } = await this.supabase.admin
      .from('collection_points')
      .select('id')
      .eq('id', dto.point_id)
      .single()

    if (!point) throw new NotFoundException('Ponto de coleta não encontrado')

    if (dto.is_specific && !dto.description) {
      throw new BadRequestException('Descrição é obrigatória para problemas específicos')
    }

    const { data, error } = await this.supabase.admin
      .from('feedbacks')
      .insert({
        point_id: dto.point_id,
        submitted_by: userId,
        category: dto.category,
        is_specific: dto.is_specific ?? false,
        description: dto.description ?? null,
        status: 'pending',
      })
      .select('id, category, is_specific, description, status, created_at')
      .single()

    if (error) throw new BadRequestException(error.message)

    return {
      message: 'Relato registrado com sucesso. Administradoras serão notificadas.',
      feedback: data,
    }
  }

  async findMine(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('feedbacks')
      .select('id, point_id, category, is_specific, description, status, created_at')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false })

    if (error) throw new BadRequestException(error.message)
    return data ?? []
  }
}
