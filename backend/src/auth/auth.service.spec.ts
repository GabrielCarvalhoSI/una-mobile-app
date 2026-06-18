import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SupabaseService } from '../supabase/supabase.service'

const MOCK_USER = {
  id: 'user-uuid-123',
  email: 'maria@cin.ufpe.br',
}

const MOCK_PROFILE = {
  id: 'user-uuid-123',
  full_name: 'Maria Oliveira',
  username: 'mariaoli',
  role: 'student',
}

const MOCK_SESSION = {
  access_token: 'jwt.token.aqui',
}

function makeProfileChain(profile: any) {
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq:     jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: profile, error: null }),
    }),
  }
}

describe('AuthService', () => {
  let service: AuthService
  let supabase: any

  beforeEach(async () => {
    supabase = {
      admin: {
        auth: {
          admin: { createUser: jest.fn() },
          signInWithPassword: jest.fn(),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
        }),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── signup ───────────────────────────────────────────────────────────────

  describe('signUp', () => {
    const dto = {
      email: 'maria@cin.ufpe.br',
      password: 'senha123',
      full_name: 'Maria Oliveira',
      username: 'mariaoli',
    }

    it('retorna access_token e dados do usuário no cadastro bem-sucedido', async () => {
      supabase.admin.auth.admin.createUser.mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      })
      supabase.admin.auth.signInWithPassword.mockResolvedValue({
        data: { session: MOCK_SESSION },
        error: null,
      })

      const result = await service.signUp(dto)

      expect(result.access_token).toBe(MOCK_SESSION.access_token)
      expect(result.user.id).toBe(MOCK_USER.id)
      expect(result.user.email).toBe(MOCK_USER.email)
    })

    it('passa full_name, username e pronouns para raw_user_meta_data', async () => {
      const dtoComPronomes = { ...dto, pronouns: 'ela/dela', age: 20 }

      supabase.admin.auth.admin.createUser.mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      })
      supabase.admin.auth.signInWithPassword.mockResolvedValue({
        data: { session: MOCK_SESSION },
        error: null,
      })

      await service.signUp(dtoComPronomes)

      const createUserCall = supabase.admin.auth.admin.createUser.mock.calls[0][0]
      expect(createUserCall.user_metadata.full_name).toBe('Maria Oliveira')
      expect(createUserCall.user_metadata.username).toBe('mariaoli')
      expect(createUserCall.user_metadata.pronouns).toBe('ela/dela')
      expect(createUserCall.user_metadata.age).toBe(20)
    })

    it('lança ConflictException quando e-mail já está cadastrado', async () => {
      supabase.admin.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      await expect(service.signUp(dto)).rejects.toThrow(ConflictException)
    })

    it('lança InternalServerErrorException em erro desconhecido do Supabase', async () => {
      supabase.admin.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unexpected database error' },
      })

      await expect(service.signUp(dto)).rejects.toThrow(InternalServerErrorException)
    })
  })

  // ─── signin ───────────────────────────────────────────────────────────────

  describe('signIn', () => {
    const dto = { email: 'maria@cin.ufpe.br', password: 'senha123' }

    it('retorna access_token e dados do usuário no login bem-sucedido', async () => {
      supabase.admin.auth.signInWithPassword.mockResolvedValue({
        data: { user: MOCK_USER, session: MOCK_SESSION },
        error: null,
      })

      const result = await service.signIn(dto)

      expect(result.access_token).toBe(MOCK_SESSION.access_token)
      expect(result.user.id).toBe(MOCK_USER.id)
      expect(result.user.role).toBe('student')
    })

    it('lança UnauthorizedException com credenciais inválidas', async () => {
      supabase.admin.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      await expect(service.signIn(dto)).rejects.toThrow(UnauthorizedException)
    })

    it('não retorna a senha ou dados sensíveis do Supabase Auth', async () => {
      supabase.admin.auth.signInWithPassword.mockResolvedValue({
        data: { user: { ...MOCK_USER, encrypted_password: 'hash_secreto' }, session: MOCK_SESSION },
        error: null,
      })

      const result = await service.signIn(dto)

      expect(result.user).not.toHaveProperty('encrypted_password')
      expect(result.user).not.toHaveProperty('password')
    })
  })
})
