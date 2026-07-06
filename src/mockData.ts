import { Bed, Product, Reservation, ServiceMenu, Therapist } from './types'

export const beds: Bed[] = [
  { id: 'bed-1', name: 'ベッド1', is_active: true },
  { id: 'bed-2', name: 'ベッド2', is_active: true },
  { id: 'bed-3', name: 'ベッド3', is_active: true },
]

export const therapists: Therapist[] = [
  { id: 'owner', name: 'カツコさん', email: 'owner@example.com', role: 'admin', commission_rate: 0, is_active: true },
  { id: 'therapist-a', name: '施術師A', email: 'a@example.com', role: 'therapist', commission_rate: 40, is_active: true },
  { id: 'therapist-b', name: '施術師B', email: 'b@example.com', role: 'therapist', commission_rate: 40, is_active: true },
]

export const serviceMenus: ServiceMenu[] = [
  { id: 'onnetu-60', name: '温熱ケア 60分', duration_minutes: 60, price: 5000, description: '体を温め、リラックスと美容・健康維持をサポートします。', is_active: true },
  { id: 'consultation', name: '施術内容はご相談ください', duration_minutes: 0, price: 0, description: '90分コースや組み合わせメニューは、内容と料金が決まり次第こちらに掲載します。', is_active: true },
]

export const products: Product[] = []

export const reservations: Reservation[] = []
