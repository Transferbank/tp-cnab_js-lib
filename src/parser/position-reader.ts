import { extractPosition } from './cnab-positions'

const CNAB400_RECORD_TYPE_POS = { start: 0, end: 1 } as const
const CNAB240_RECORD_TYPE_POS = { start: 7, end: 8 } as const
const CNAB240_SEGMENT_CODE_POS = { start: 13, end: 14 } as const

export function getCnab400RecordType(line: string): string {
  return extractPosition(line, CNAB400_RECORD_TYPE_POS)
}

export function getCnab240RecordType(line: string): string {
  return extractPosition(line, CNAB240_RECORD_TYPE_POS)
}

export function getCnab240SegmentCode(line: string): string {
  return extractPosition(line, CNAB240_SEGMENT_CODE_POS)
}
