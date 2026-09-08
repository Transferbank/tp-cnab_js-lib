import { CnabFile } from '@cnab/type/cnab-file'

/**
 * Abre um arquivo CNAB a partir de um objeto `File` (browser ou runtime com Web File API).
 * O banco e o formato (240/400) são detectados pela primeira linha.
 */
export async function openCnabFile(file: File): Promise<CnabFile> {
  return CnabFile.open(file)
}

/**
 * Abre um arquivo CNAB a partir das linhas já lidas (útil em Node).
 * Cada item do array deve ser uma linha do arquivo, sem o terminador de linha.
 */
export function openCnabFileFromLines(lines: string[]): CnabFile {
  return CnabFile.fromLines(lines)
}

export { CnabFile } from '@cnab/type/cnab-file'
export { CnabBank } from '@cnab/type/cnab-bank'
export { CnabFormat } from '@cnab/type/cnab-format'
export { CnabFieldType } from '@cnab/type/cnab-field-type'
export { CnabField } from '@cnab/type/cnab-field'
export type { CnabFieldClass } from '@cnab/type/cnab-field'
export type { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export {
  CnabValidationError,
  CnabValidationErrorType,
  CnabLineValidationError,
  CnabFieldValidationError,
  CnabInvalidLineSizeError,
  CnabInvalidLineStartError,
  CnabFieldMinLengthError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

export {
  CnabException,
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException
} from '@cnab/exception/cnab-exception'

export {
  isValidCPF,
  isValidCNPJ,
  isValidCpfCnpj,
  validateDocument
} from '@cnab/utils/document-parser'

export {
  parseDateDDMMAA,
  parseDateDDMMAAAA,
  parseDateAAAAMMDD,
  formatDateBR
} from '@cnab/utils/date-parser'
