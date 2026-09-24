import { CnabFile } from '@cnab/type/cnab-file'

export async function openCnabFile(file: File): Promise<CnabFile> {
  return CnabFile.open(file)
}

export function openCnabFileFromLines(lines: string[]): CnabFile {
  return CnabFile.fromLines(lines)
}

export { CnabFile }
export { CnabValidationResult, CnabBoletoValidationResult } from '@cnab/type/cnab-validation-result'
export {
  CnabException,
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException
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