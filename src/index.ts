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
  CnabGroupValidationError,
  CnabGroupMissingSegmentError,
  CnabGroupDuplicateSegmentError,
  CnabInvalidLineSizeError,
  CnabInvalidLineStartError,
  CnabFieldMinLengthError,
  CnabGenericFieldError,
  CnabFieldParseError,
  CnabFieldInvalidNumberError,
  CnabFieldInvalidDateError
} from '@cnab/type/cnab-validation-error'