export { openCnabDocument } from './document-entry-point'

export { CnabDocument } from '@/types/document/cnab-document'
export type { BoletoRange, BoletoResult } from '@/types/document/cnab-document'

export { CnabBoleto } from '@/types/boleto/cnab-boleto'
export type { BoletoFieldName, BoletoReadResult } from '@/types/boleto/cnab-boleto'

export type {
  BoletoCnabData,
  PartialBoletoCnabData,
  CnabFieldValue,
} from '@/types/read/boleto-cnab-data'

export { CNABFormatCode } from '@/types/core/cnab'
export { ReadMode } from '@/types/core/read-mode'

export {
  CNABFieldValidationError,
  CNABFieldNotFoundError,
  CNABBoletoValidationError,
  CNABBoletoNotFoundError,
  CNABDocumentValidationError,
} from '@/types/errors/field-errors'

export {
  CNABNoLinesProvidedError,
  CNABInvalidHeaderError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
} from '@/types/errors/error-types'
