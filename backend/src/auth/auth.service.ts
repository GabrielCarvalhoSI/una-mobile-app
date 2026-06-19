import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { SignUpDto } from './dto/signup.dto'
import { SignInDto } from './dto/signin.dto'

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async signUp(dto: SignUpDto) {
    const { data, error } = await this.supabase.admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        full_name: dto.full_name,
        username: dto.username,
        pronouns: dto.pronouns ?? null,
        age: dto.age ?? null,
        cycle_duration_days: dto.cycle_duration_days ?? null,
        menstruation_duration_days: dto.menstruation_duration_days ?? null,
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new ConflictException('E-mail já cadastrado')
      }
      throw new InternalServerErrorException(error.message)
    }

    // Aguarda trigger handle_new_user criar o profile e busca para confirmar
    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('id, full_name, username, role')
      .eq('id', data.user.id)
      .single()

    // Gera token de sessão para a usuária recém-criada via sign-in
    const { data: session, error: sessionError } = await this.supabase.admin.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })

    if (sessionError) throw new InternalServerErrorException(sessionError.message)

    return {
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name ?? null,
        username: profile?.username ?? null,
        role: profile?.role ?? 'student',
      },
    }
  }

  async signIn(dto: SignInDto) {
    const { data, error } = await this.supabase.admin.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })

    if (error) throw new UnauthorizedException('E-mail ou senha incorretos')

    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('id, full_name, username, role')
      .eq('id', data.user.id)
      .single()

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name ?? null,
        username: profile?.username ?? null,
        role: profile?.role ?? 'student',
      },
    }
  }
}
