import type { CNABHeader, CNABTrailer, CNABData } from '@/types/read/read-types'

export interface CNABReadResult<T = CNABData> {
  header: CNABHeader
  trailer: CNABTrailer
  bills: T[]
}
