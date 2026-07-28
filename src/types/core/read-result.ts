import type { CNABHeader, CNABTrailer, CNABData } from '../read'

export interface CNABReadResult<T = CNABData> {
  header: CNABHeader
  trailer: CNABTrailer
  bills: T[]
}
