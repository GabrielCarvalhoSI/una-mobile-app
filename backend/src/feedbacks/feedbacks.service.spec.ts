import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { FeedbacksService } from './feedbacks.service'
import { SupabaseService } from '../supabase/supabase.service'

const POINT_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
const USER_ID  = 'bbbbbbbb-0000-0000-0000-000000000002'

function makeChain(resolvedValue: any) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    order:  jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
  }
  return chain
}

describe('FeedbacksService', () => {
  let service: FeedbacksService
  let supabase: any

  beforeEach(async () => {
    supabase = { admin: { from: jest.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbacksService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile()

    service = module.get<FeedbacksService>(FeedbacksService)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('lança NotFoundException quando o ponto não existe', async () => {
      supabase.admin.from.mockReturnValueOnce(makeChain({ data: null, error: null }))

      await expect(
        service.create(USER_ID, { point_id: POINT_ID, category: 'empty_stock' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('lança BadRequestException quando is_specific=true mas description está vazio', async () => {
      supabase.admin.from.mockReturnValueOnce(
        makeChain({ data: { id: POINT_ID }, error: null }),
      )

      await expect(
        service.create(USER_ID, { point_id: POINT_ID, category: 'other', is_specific: true }),
      ).rejects.toThrow(BadRequestException)
    })

    it('cria feedback COMUM (is_specific=false) sem description', async () => {
      const mockFeedback = {
        id: 'fb-1', category: 'empty_stock', is_specific: false,
        description: null, status: 'pending', created_at: new Date().toISOString(),
      }
      supabase.admin.from
        .mockReturnValueOnce(makeChain({ data: { id: POINT_ID }, error: null }))
        .mockReturnValueOnce(makeChain({ data: mockFeedback, error: null }))

      const result = await service.create(USER_ID, { point_id: POINT_ID, category: 'empty_stock' })

      expect(result.feedback.category).toBe('empty_stock')
      expect(result.feedback.is_specific).toBe(false)
      expect(result.message).toBeDefined()
    })

    it('cria feedback ESPECÍFICO com description preenchida', async () => {
      const mockFeedback = {
        id: 'fb-2', category: 'other', is_specific: true,
        description: 'Torneira com vazamento', status: 'pending', created_at: new Date().toISOString(),
      }
      supabase.admin.from
        .mockReturnValueOnce(makeChain({ data: { id: POINT_ID }, error: null }))
        .mockReturnValueOnce(makeChain({ data: mockFeedback, error: null }))

      const result = await service.create(USER_ID, {
        point_id: POINT_ID,
        category: 'other',
        is_specific: true,
        description: 'Torneira com vazamento',
      })

      expect(result.feedback.is_specific).toBe(true)
      expect(result.feedback.description).toBe('Torneira com vazamento')
    })

    it('novo feedback é criado com status "pending"', async () => {
      const mockFeedback = { id: 'fb-3', category: 'damaged', status: 'pending', is_specific: false, description: null, created_at: new Date().toISOString() }
      supabase.admin.from
        .mockReturnValueOnce(makeChain({ data: { id: POINT_ID }, error: null }))
        .mockReturnValueOnce(makeChain({ data: mockFeedback, error: null }))

      const result = await service.create(USER_ID, { point_id: POINT_ID, category: 'damaged' })

      expect(result.feedback.status).toBe('pending')
    })
  })

  // ─── findMine ─────────────────────────────────────────────────────────────

  describe('findMine', () => {
    it('retorna lista de feedbacks da usuária autenticada', async () => {
      const mockFeedbacks = [
        { id: 'fb-1', category: 'empty_stock', status: 'pending' },
        { id: 'fb-2', category: 'inaccessible', status: 'resolved' },
      ]

      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockReturnThis(),
        order:  jest.fn().mockResolvedValue({ data: mockFeedbacks, error: null }),
      }
      supabase.admin.from.mockReturnValueOnce(chain)

      const result = await service.findMine(USER_ID)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('fb-1')
    })

    it('retorna array vazio quando usuária não tem feedbacks', async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockReturnThis(),
        order:  jest.fn().mockResolvedValue({ data: null, error: null }),
      }
      supabase.admin.from.mockReturnValueOnce(chain)

      const result = await service.findMine(USER_ID)

      expect(result).toEqual([])
    })
  })
})
