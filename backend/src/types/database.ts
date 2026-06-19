export type UserRole = 'student' | 'admin'
export type CollectionPointStatus = 'active' | 'inactive' | 'maintenance'
export type MenstrualItemType = 'pad' | 'tampon' | 'panty_liner'
export type TransactionType = 'withdrawal' | 'donation'
export type FeedbackCategory = 'empty_stock' | 'damaged' | 'inaccessible' | 'other'
export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved'

export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [longitude: number, latitude: number]
}

export interface ProfileRow {
  id: string
  full_name: string
  username: string
  pronouns: string | null
  role: UserRole
  age: number | null
  cycle_duration_days: number | null
  menstruation_duration_days: number | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface CollectionPointRow {
  id: string
  name: string
  building: string
  campus: string
  floor: string | null
  room: string | null
  location: GeoJSONPoint
  status: CollectionPointStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InventoryRow {
  id: string
  point_id: string
  item_type: MenstrualItemType
  quantity: number
  min_quantity: number
  last_updated_at: string
}

export interface TransactionRow {
  id: string
  type: TransactionType
  user_id: string
  point_id: string
  item_type: MenstrualItemType
  quantity: number
  notes: string | null
  created_at: string
}

export interface FeedbackRow {
  id: string
  point_id: string
  submitted_by: string
  category: FeedbackCategory
  is_specific: boolean
  description: string | null
  status: FeedbackStatus
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface NearestCollectionPoint {
  id: string
  name: string
  building: string
  campus: string
  floor: string | null
  room: string | null
  status: CollectionPointStatus
  distance_meters: number
  latitude: number
  longitude: number
  total_stock: number
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>
      }
      collection_points: {
        Row: CollectionPointRow
        Insert: Omit<CollectionPointRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CollectionPointRow, 'id' | 'created_at' | 'updated_at'>>
      }
      inventory: {
        Row: InventoryRow
        Insert: Omit<InventoryRow, 'id' | 'last_updated_at'>
        Update: Partial<Pick<InventoryRow, 'quantity' | 'min_quantity'>>
      }
      transactions: {
        Row: TransactionRow
        Insert: Omit<TransactionRow, 'id' | 'created_at'>
        Update: never
      }
      feedbacks: {
        Row: FeedbackRow
        Insert: Omit<FeedbackRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<FeedbackRow, 'status' | 'resolved_by' | 'resolved_at'>>
      }
    }
    Functions: {
      get_nearest_collection_points: {
        Args: { p_lat: number; p_lng: number; p_radius_m?: number; p_limit?: number }
        Returns: NearestCollectionPoint[]
      }
      has_user_withdrawn_today: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_stock_low: {
        Args: { p_point_id: string; p_item_type: MenstrualItemType }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      collection_point_status: CollectionPointStatus
      menstrual_item_type: MenstrualItemType
      transaction_type: TransactionType
      feedback_category: FeedbackCategory
      feedback_status: FeedbackStatus
    }
  }
}
