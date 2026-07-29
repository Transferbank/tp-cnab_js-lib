import type { CanonicalField } from '@tp-types/read'
import type { ParsedLine } from '@tp-types/core'

export enum FieldType {
  NUM = 'num',
  ALFA = 'alfa',
  DATA = 'data'
}

export enum DateFormat {
  DDMMAA = 'DDMMAA',
  DDMMAAAA = 'DDMMAAAA',
  AAAAMMDD = 'AAAAMMDD'
}

export interface FieldDefinition {
  pos: [number, number]
  type: FieldType
  size: number
  decimals: number
  required: boolean
  dateFormat: DateFormat | null
  pattern: string | number | null
  description: string
  canonical:
    | CanonicalField
    | {
        field: CanonicalField
        interpret: (rawValue: unknown, line: ParsedLine) => unknown
      }
    | null
}

export interface RecordSchema {
  [fieldName: string]: FieldDefinition
}

export interface OptionalRecordSchema {
  identifier: string
  schema: RecordSchema
}

export interface BankSchema {
  bankCode: string
  bankName: string
  header?: RecordSchema          // CNAB 400
  detail?: RecordSchema          // CNAB 400
  trailer?: RecordSchema         // CNAB 400
  headerArquivo?: RecordSchema   // CNAB 240
  headerLote?: RecordSchema      // CNAB 240
  segmentoP?: RecordSchema       // CNAB 240
  segmentoQ?: RecordSchema       // CNAB 240
  trailerLote?: RecordSchema     // CNAB 240
  trailerArquivo?: RecordSchema  // CNAB 240
  optionalRecords?: OptionalRecordSchema[]
}

export interface BankSchemaRegistry {
  [bankCode: string]: BankSchema
}
