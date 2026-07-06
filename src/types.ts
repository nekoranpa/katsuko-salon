export type UserRole = 'admin' | 'therapist'

export type Therapist = {
  id: string
  name: string
  email?: string
  role: UserRole
  commission_rate: number
  is_active: boolean
}

export type Bed = {
  id: string
  name: string
  is_active: boolean
}

export type ServiceMenu = {
  id: string
  name: string
  duration_minutes: number
  price: number
  description: string
  is_active: boolean
}

export type ReservationStatus = 'reserved' | 'visited' | 'cancelled' | 'no_show'

export type Reservation = {
  id: string
  customer_name: string
  customer_phone: string
  reservation_date: string
  start_time: string
  end_time: string
  menu_id: string
  therapist_id: string
  bed_id: string
  status: ReservationStatus
  memo?: string
  amount: number
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  cost: number
  stock: number
  image_url?: string
  stripe_payment_link?: string
  is_public: boolean
}
