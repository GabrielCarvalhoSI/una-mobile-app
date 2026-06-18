import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class CollectionPointsService {
  constructor(private supabase: SupabaseService) {}

  async findNearest(lat: number, lng: number, radiusM = 2000, limit = 20) {
    const { data, error } = await this.supabase.admin.rpc('get_nearest_collection_points', {
      p_lat: lat,
      p_lng: lng,
      p_radius_m: radiusM,
      p_limit: limit,
    })

    if (error) throw new Error(error.message)

    // Mapeia para o formato esperado pelo app mobile
    return (data ?? []).map((p) => ({
      id: p.id,
      sigla: p.building,
      nome: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      qtd: p.total_stock,
      status: p.status,
      floor: p.floor,
      room: p.room,
      campus: p.campus,
      distance_meters: p.distance_meters,
    }))
  }

  async findOne(id: string) {
    const { data: point, error } = await this.supabase.admin
      .from('collection_points')
      .select('id, name, building, campus, floor, room, status, location')
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error || !point) throw new NotFoundException('Ponto de coleta não encontrado')

    const { data: inventory } = await this.supabase.admin
      .from('inventory')
      .select('item_type, quantity, min_quantity')
      .eq('point_id', id)

    const location = point.location as any
    return {
      id: point.id,
      sigla: point.building,
      nome: point.name,
      campus: point.campus,
      floor: point.floor,
      room: point.room,
      status: point.status,
      latitude: location?.coordinates?.[1] ?? null,
      longitude: location?.coordinates?.[0] ?? null,
      inventory: inventory ?? [],
      qtd: (inventory ?? []).reduce((sum, i) => sum + i.quantity, 0),
    }
  }
}
