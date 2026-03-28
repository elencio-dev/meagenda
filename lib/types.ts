// Shared types for the booking flow

export type BookingData = {
  business: {
    name: string
    address: string
    phone: string
    description: string
    image: string | null
  }
  servicos: {
    id: number
    name: string
    price: number
    duration: number
    category: string
    popular: boolean
  }[]
  profissionais: {
    id: number
    name: string
    role: string
  }[]
}

export type BookingResult = {
  id: number
  date: Date
  time: string
  serviceName: string
  servicePrice: number
  professionalName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string
}
