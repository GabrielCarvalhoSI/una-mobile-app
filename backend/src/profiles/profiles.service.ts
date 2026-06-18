import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class ProfilesService {
  constructor(private supabase: SupabaseService) {}

  async getMe(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('id, full_name, username, pronouns, role, age, cycle_duration_days, menstruation_duration_days, avatar_url, created_at')
      .eq('id', userId)
      .single()

    if (error || !data) throw new NotFoundException('Perfil não encontrado')
    return data
  }
}
