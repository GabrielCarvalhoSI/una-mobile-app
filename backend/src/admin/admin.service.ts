import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto'
import { UpdateFeedbackDto } from './dto/update-feedback.dto'

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  async listFeedbacks(status?: string) {
    let query = this.supabase.admin
      .from('feedbacks')
      .select(`
        id, category, is_specific, description, status, created_at, updated_at,
        point_id,
        collection_points ( id, name, building ),
        profiles!feedbacks_submitted_by_fkey ( id, full_name, username )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status as any)
    }

    const { data, error } = await query
    if (error) throw new BadRequestException(error.message)
    return data ?? []
  }

  async updateFeedback(adminId: string, feedbackId: string, dto: UpdateFeedbackDto) {
    const { data: existing } = await this.supabase.admin
      .from('feedbacks')
      .select('id, status')
      .eq('id', feedbackId)
      .single()

    if (!existing) throw new NotFoundException('Relato não encontrado')

    const update: any = { status: dto.status }
    if (dto.status === 'resolved') {
      update.resolved_by = adminId
      update.resolved_at = new Date().toISOString()
    }

    const { data, error } = await this.supabase.admin
      .from('feedbacks')
      .update(update)
      .eq('id', feedbackId)
      .select('id, status, resolved_by, resolved_at, updated_at')
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async listCollectionPoints() {
    const { data, error } = await this.supabase.admin
      .from('collection_points')
      .select(`
        id, name, building, campus, floor, room, status, created_at,
        inventory ( item_type, quantity, min_quantity )
      `)
      .order('name')

    if (error) throw new BadRequestException(error.message)
    return data ?? []
  }

  async updateCollectionPoint(id: string, dto: UpdateCollectionPointDto) {
    const { data: existing } = await this.supabase.admin
      .from('collection_points')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) throw new NotFoundException('Ponto de coleta não encontrado')

    const { data, error } = await this.supabase.admin
      .from('collection_points')
      .update(dto)
      .eq('id', id)
      .select('id, name, building, status, floor, room, updated_at')
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }
}
