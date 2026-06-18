import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { CollectionPointsService } from './collection-points.service'
import { SupabaseService } from '../supabase/supabase.service'

const POINT_ID = 'aaaaaaaa-0000-0000-0000-000000000001'

// Pontos retornados pela RPC get_nearest_collection_points
const MOCK_RPC_POINTS = [
  {
    id: POINT_ID,
    name: 'Ponto CIn',
    building: 'CIn',
    campus: 'Recife',
    floor: 'Térreo',
    room: 'Banheiro feminino',
    status: 'active',
    distance_meters: 0,
    latitude: -8.0536,
    longitude: -34.9524,
    total_stock: 35,
  },
  {
    id: 'bbbbbbbb-0000-0000-0000-000000000002',
    name: 'Ponto CAC',
    building: 'CAC',
    campus: 'Recife',
    floor: '1º andar',
    room: 'Banheiro feminino',
    status: 'active',
    distance_meters: 230,
    latitude: -8.0509,
    longitude: -34.9545,
    total_stock: 20,
  },
]

describe('CollectionPointsService', () => {
  let service: CollectionPointsService
  let supabase: any

  beforeEach(async () => {
    supabase = { admin: { from: jest.fn(), rpc: jest.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionPointsService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile()

    service = module.get<CollectionPointsService>(CollectionPointsService)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── findNearest ──────────────────────────────────────────────────────────

  describe('findNearest', () => {
    it('chama get_nearest_collection_points com lat, lng, radius e limit corretos', async () => {
      supabase.admin.rpc.mockResolvedValue({ data: MOCK_RPC_POINTS, error: null })

      await service.findNearest(-8.0536, -34.9524, 1000, 5)

      expect(supabase.admin.rpc).toHaveBeenCalledWith('get_nearest_collection_points', {
        p_lat: -8.0536,
        p_lng: -34.9524,
        p_radius_m: 1000,
        p_limit: 5,
      })
    })

    it('mapeia os campos do banco para o formato do app mobile (sigla, qtd, latitude, longitude)', async () => {
      supabase.admin.rpc.mockResolvedValue({ data: MOCK_RPC_POINTS, error: null })

      const result = await service.findNearest(-8.0536, -34.9524)

      expect(result[0]).toMatchObject({
        sigla: 'CIn',
        nome: 'Ponto CIn',
        latitude: -8.0536,
        longitude: -34.9524,
        qtd: 35,
        status: 'active',
      })
    })

    it('retorna pontos ordenados por distância (mais próximo primeiro)', async () => {
      supabase.admin.rpc.mockResolvedValue({ data: MOCK_RPC_POINTS, error: null })

      const result = await service.findNearest(-8.0536, -34.9524)

      expect(result[0].distance_meters).toBeLessThan(result[1].distance_meters)
    })

    it('usa raio padrão de 2000m e limite de 20 quando não fornecidos', async () => {
      supabase.admin.rpc.mockResolvedValue({ data: [], error: null })

      await service.findNearest(-8.0536, -34.9524)

      expect(supabase.admin.rpc).toHaveBeenCalledWith(
        'get_nearest_collection_points',
        expect.objectContaining({ p_radius_m: 2000, p_limit: 20 }),
      )
    })

    it('retorna array vazio quando nenhum ponto está no raio', async () => {
      supabase.admin.rpc.mockResolvedValue({ data: [], error: null })

      const result = await service.findNearest(-8.0536, -34.9524, 100)

      expect(result).toEqual([])
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('lança NotFoundException quando o ponto não existe', async () => {
      supabase.admin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })

      await expect(service.findOne(POINT_ID)).rejects.toThrow(NotFoundException)
    })

    it('retorna ponto com estoque por tipo de produto', async () => {
      const mockPoint = {
        id: POINT_ID, name: 'Ponto CIn', building: 'CIn', campus: 'Recife',
        floor: 'Térreo', room: 'Banheiro feminino', status: 'active',
        location: { type: 'Point', coordinates: [-34.9524, -8.0536] },
      }
      const mockInventory = [
        { item_type: 'pad', quantity: 20, min_quantity: 5 },
        { item_type: 'tampon', quantity: 10, min_quantity: 3 },
      ]

      supabase.admin.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockPoint, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockResolvedValue({ data: mockInventory, error: null }),
        })

      const result = await service.findOne(POINT_ID)

      expect(result.sigla).toBe('CIn')
      expect(result.latitude).toBe(-8.0536)
      expect(result.longitude).toBe(-34.9524)
      expect(result.inventory).toHaveLength(2)
      expect(result.qtd).toBe(30) // 20 + 10
    })

    it('calcula qtd total somando todos os tipos de produto', async () => {
      const mockPoint = {
        id: POINT_ID, name: 'Ponto CIn', building: 'CIn', campus: 'Recife',
        floor: null, room: null, status: 'active',
        location: { type: 'Point', coordinates: [-34.9524, -8.0536] },
      }
      const mockInventory = [
        { item_type: 'pad', quantity: 5, min_quantity: 5 },
        { item_type: 'tampon', quantity: 3, min_quantity: 3 },
        { item_type: 'panty_liner', quantity: 8, min_quantity: 3 },
      ]

      supabase.admin.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockPoint, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockResolvedValue({ data: mockInventory, error: null }),
        })

      const result = await service.findOne(POINT_ID)

      expect(result.qtd).toBe(16) // 5 + 3 + 8
    })
  })
})
