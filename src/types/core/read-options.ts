import type { ReadMode } from '@/types/core/read-mode'

export interface ReadPageOptions {
  start: number
  size: number
}

export interface ReadOptions {
  mode?: ReadMode
  lazy?: boolean
  page?: ReadPageOptions
}

export interface ReadProgressCallback {
  (progress: { current: number; total: number }): void
}

export interface ReadAsyncOptions extends ReadOptions {
  onProgress?: ReadProgressCallback
  batchSize?: number
}
