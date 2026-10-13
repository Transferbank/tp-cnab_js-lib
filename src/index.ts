import { CnabFile } from '@cnab/type/cnab-file'

export async function openCnabFile(file: File): Promise<CnabFile> {
  return CnabFile.open(file)
}

export function openCnabFileFromLines(lines: string[]): CnabFile {
  return CnabFile.fromLines(lines)
}

export { CnabFile }
export { Cnab, CnabBoleto } from '@cnab/type/cnab'
export { CnabValidationResult } from '@cnab/type/cnab-validation-result'
export { CnabField, CnabFieldClass, optional } from '@cnab/type/cnab-field'
export { CnabFieldType } from '@cnab/type/cnab-field-type'
export { CnabBank } from '@cnab/type/cnab-bank'
export { CnabFormat } from '@cnab/type/cnab-format'
export { Cnab240LineTypeChecker, Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
export { CNAB_EMAIL_FIELDS } from '@cnab/bank/cnab-email-fields'
export { CNAB_TELEFONE_FIELDS } from '@cnab/bank/cnab-telefone-fields'
export {
  CnabException,
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException,
  CnabInvalidFileException
} from '@cnab/exception/cnab-exception'
export {
  CnabValidationError,
  CnabValidationErrorType,
  CnabLineValidationError,
  CnabFieldValidationError,
  CnabInvalidLineSizeError,
  CnabInvalidLineStartError,
  CnabFieldMinLengthError,
  CnabGenericFieldError,
  CnabFieldParseError,
  CnabFieldInvalidNumberError,
  CnabFieldInvalidDateError
} from '@cnab/type/cnab-validation-error'