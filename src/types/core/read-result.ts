import type { CNABHeader, CNABTrailer, CNABData } from '@tp-types/read'

export interface CNABReadResult<T = CNABData> {
  header: CNABHeader
  trailer: CNABTrailer
  bills: T[]
}
