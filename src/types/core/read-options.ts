import type { ReadModeValue } from './read-mode'

export interface ReadPageOptions {
  start: number
  size: number
}

export interface ReadOptions {
  mode?: ReadModeValue
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
