export type Cnab240MandatoryRecordKey =
  | 'headerArquivo'
  | 'headerLote'
  | 'segmentoP'
  | 'segmentoQ'
  | 'trailerLote'
  | 'trailerArquivo'

export type Cnab240RecordKind =
  | Cnab240MandatoryRecordKey
  | { kind: 'optional'; identifier: string }

export enum Cnab240SegmentCode {
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  Y = 'Y',
}
