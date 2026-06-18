import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { SupabaseService } from '../supabase/supabase.service'

// Fábrica que cria uma chain de query Supabase mockada
function makeChain(resolvedValue: any) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
  }
  return chain
}

const POINT_ID   = 'aaaaaaaa-0000-0000-0000-000000000001'
const USER_ID    = 'bbbbbbbb-0000-0000-0000-000000000002'
const ITEM_TYPE  = 'pad' as const

describe('TransactionsService — retirada', () => {
  let service: TransactionsService
  let supabase: any

  beforeEach(async () => {
    supabase = { admin: { from: jest.fn(), rpc: jest.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile()

    service = module.get<TransactionsService>(TransactionsService)
  })

  afterEach(() => jest.clearAllMocks())

  it('lança NotFoundException quando o ponto não existe', async () => {
    supabase.admin.from.mockReturnValueOnce(makeChain({ data: null, error: null }))

    await expect(
      service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE }),
    ).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException quando o ponto está inativo', async () => {
    supabase.admin.from.mockReturnValueOnce(
      makeChain({ data: { id: POINT_ID, status: 'inactive' }, error: null }),
    )

    await expect(
      service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE }),
    ).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException quando o ponto está em manutenção', async () => {
    supabase.admin.from.mockReturnValueOnce(
      makeChain({ data: { id: POINT_ID, status: 'maintenance' }, error: null }),
    )

    await expect(
      service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE }),
    ).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException quando a usuária já retirou hoje', async () => {
    supabase.admin.from.mockReturnValueOnce(
      makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }),
    )
    supabase.admin.rpc.mockResolvedValueOnce({ data: true, error: null }) // já retirou

    await expect(
      service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE }),
    ).rejects.toThrow(BadRequestException)

    const call = supabase.admin.rpc.mock.calls[0]
    expect(call[0]).toBe('has_user_withdrawn_today')
    expect(call[1]).toEqual({ p_user_id: USER_ID })
  })

  it('lança BadRequestException quando estoque é zero', async () => {
    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: { quantity: 0 }, error: null }))

    supabase.admin.rpc.mockResolvedValueOnce({ data: false, error: null }) // não retirou hoje

    await expect(
      service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE }),
    ).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException quando o produto não está cadastrado no ponto', async () => {
    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null })) // sem inventory

    supabase.admin.rpc.mockResolvedValueOnce({ data: false, error: null })

    await expect(
      service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE }),
    ).rejects.toThrow(BadRequestException)
  })

  it('retorna transaction e estoque atualizado em retirada bem-sucedida', async () => {
    const mockTransaction = { id: 'tx-1', type: 'withdrawal', item_type: ITEM_TYPE, quantity: 1, created_at: new Date().toISOString() }
    const mockUpdatedInventory = { item_type: ITEM_TYPE, quantity: 9 }

    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: { quantity: 10 }, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockTransaction, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockUpdatedInventory, error: null }))

    supabase.admin.rpc
      .mockResolvedValueOnce({ data: false, error: null }) // has_user_withdrawn_today
      .mockResolvedValueOnce({ data: false, error: null }) // is_stock_low

    const result = await service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE })

    expect(result.transaction).toEqual(mockTransaction)
    expect(result.inventory).toEqual(mockUpdatedInventory)
    expect(result.stock_alert).toBeNull()
    expect(result.message).toBeDefined()
  })

  it('inclui stock_alert quando estoque fica abaixo do mínimo após retirada', async () => {
    const mockTransaction = { id: 'tx-2', type: 'withdrawal', item_type: ITEM_TYPE, quantity: 1, created_at: new Date().toISOString() }
    const mockUpdatedInventory = { item_type: ITEM_TYPE, quantity: 2 }

    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: { quantity: 3 }, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockTransaction, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockUpdatedInventory, error: null }))

    supabase.admin.rpc
      .mockResolvedValueOnce({ data: false, error: null }) // has_user_withdrawn_today
      .mockResolvedValueOnce({ data: true, error: null })  // is_stock_low = true

    const result = await service.withdraw(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE })

    expect(result.stock_alert).toBeTruthy()
  })
})

describe('TransactionsService — doação', () => {
  let service: TransactionsService
  let supabase: any

  beforeEach(async () => {
    supabase = { admin: { from: jest.fn(), rpc: jest.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile()

    service = module.get<TransactionsService>(TransactionsService)
  })

  afterEach(() => jest.clearAllMocks())

  it('lança NotFoundException quando o ponto não existe', async () => {
    supabase.admin.from.mockReturnValueOnce(makeChain({ data: null, error: null }))

    await expect(
      service.donate(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE, quantity: 5 }),
    ).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException quando o produto não está cadastrado no ponto', async () => {
    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }))

    await expect(
      service.donate(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE, quantity: 5 }),
    ).rejects.toThrow(BadRequestException)
  })

  it('retorna transaction e estoque atualizado em doação bem-sucedida', async () => {
    const mockTransaction = { id: 'tx-3', type: 'donation', item_type: ITEM_TYPE, quantity: 5, created_at: new Date().toISOString() }
    const mockUpdatedInventory = { item_type: ITEM_TYPE, quantity: 15 }

    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'active' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: { quantity: 10 }, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockTransaction, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockUpdatedInventory, error: null }))

    const result = await service.donate(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE, quantity: 5 })

    expect(result.transaction).toEqual(mockTransaction)
    expect(result.inventory?.quantity).toBe(15)
    expect(result.message).toBeDefined()
  })

  it('aceita doação mesmo com ponto em manutenção (doação não requer ponto ativo)', async () => {
    const mockTransaction = { id: 'tx-4', type: 'donation', item_type: ITEM_TYPE, quantity: 2, created_at: new Date().toISOString() }

    supabase.admin.from
      .mockReturnValueOnce(makeChain({ data: { id: POINT_ID, status: 'maintenance' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: { quantity: 0 }, error: null }))
      .mockReturnValueOnce(makeChain({ data: mockTransaction, error: null }))
      .mockReturnValueOnce(makeChain({ data: { item_type: ITEM_TYPE, quantity: 2 }, error: null }))

    const result = await service.donate(USER_ID, { point_id: POINT_ID, item_type: ITEM_TYPE, quantity: 2 })

    expect(result.transaction).toBeDefined()
  })
})
