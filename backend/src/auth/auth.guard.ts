import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) throw new UnauthorizedException('Token de autenticação não fornecido')

    const { data: { user }, error } = await this.supabase.admin.auth.getUser(token)

    if (error || !user) throw new UnauthorizedException('Token inválido ou expirado')

    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('id, full_name, username, role')
      .eq('id', user.id)
      .single()

    request.user = { id: user.id, email: user.email, profile }
    return true
  }

  private extractToken(request: any): string | null {
    const auth: string = request.headers?.authorization
    if (!auth?.startsWith('Bearer ')) return null
    return auth.slice(7)
  }
}
