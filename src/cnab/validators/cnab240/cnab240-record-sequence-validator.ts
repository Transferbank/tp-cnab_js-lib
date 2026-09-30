import { CnabFileValidator } from '@cnab/type/cnab-file-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabInvalidRecordSequenceError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// Posições 9-13 das linhas de detalhe: número sequencial do registro no lote.
// Confere só a continuidade (anterior + 1): o valor inicial varia entre bancos
// e a numeração reinicia a cada lote.
export class Cnab240RecordSequenceValidator implements CnabFileValidator {
  validate(rawLines: string[]): CnabValidationResult {
    const errors: CnabInvalidRecordSequenceError[] = []
    let previousSequence: number | null = null

    rawLines.forEach((rawLine: string, lineNumber: number) => {
      if (!Cnab240LineTypeChecker.isDetalhe(rawLine)) {
        previousSequence = null
        return
      }

      const expectedSequence = previousSequence == null ? null : previousSequence + 1
      const rawSequence = rawLine.substring(8, 13)

      if (!/^\d{5}$/.test(rawSequence)) {
        errors.push(new CnabInvalidRecordSequenceError({ lineNumber, expectedSequence, actualSequence: rawSequence }))
        previousSequence = null
        return
      }

      const sequence = parseInt(rawSequence, 10)
      if (expectedSequence != null && sequence != expectedSequence) {
        errors.push(new CnabInvalidRecordSequenceError({ lineNumber, expectedSequence, actualSequence: rawSequence }))
      }
      previousSequence = sequence
    })

    return { isValid: errors.length == 0, errors }
  }
}
