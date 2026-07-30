export type Cnab400MandatoryRecordKey =
  | 'header'
  | 'detail'
  | 'trailer'

export type Cnab400RecordKind =
  | Cnab400MandatoryRecordKey
  | { kind: 'optional'; identifier: string }

export enum Cnab400RecordType {
  HEADER = '0',
  DETAIL_STANDARD = '1',
  DETAIL_BB = '7',
  TRAILER = '9',
}
