import { CnabDocument, BoletoRange } from './cnab-document'
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import { getGroupingRule } from '@/grouping/grouping-rules'
import { getCnab400RecordType } from '@/parser/position-reader'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'

export abstract class CnabDocument400<
  TBoleto extends CnabBoleto = CnabBoleto
> extends CnabDocument<TBoleto> {
  get type(): CNABFormatCode {
    return CNABFormatCode.CNAB400
  }

  protected abstract get bankCode(): string

  protected validateHeader(): void {
    if (this.rawLines.length < 2) {
      throw new CNABDocumentValidationError(
        'arquivo deve ter pelo menos header e trailer'
      )
    }

    const headerLine = this.rawLines[0]

    if (headerLine.length !== 400) {
      throw new CNABDocumentValidationError(
        `header deve ter 400 caracteres, tem ${headerLine.length}`,
        0
      )
    }

    const recordType = getCnab400RecordType(headerLine)
    if (recordType !== '0') {
      throw new CNABDocumentValidationError(
        `header deve ser tipo '0', encontrado '${recordType}'`,
        0
      )
    }
  }

  protected validateTrailer(): void {
    const trailerLine = this.rawLines[this.rawLines.length - 1]
    const trailerLineNumber = this.rawLines.length - 1

    if (trailerLine.length !== 400) {
      throw new CNABDocumentValidationError(
        `trailer deve ter 400 caracteres, tem ${trailerLine.length}`,
        trailerLineNumber
      )
    }

    const recordType = getCnab400RecordType(trailerLine)
    if (recordType !== '9') {
      throw new CNABDocumentValidationError(
        `trailer deve ser tipo '9', encontrado '${recordType}'`,
        trailerLineNumber
      )
    }
  }

  protected groupBoletos(): BoletoRange[] {
    const rule = getGroupingRule(this.bankCode, CNABFormatCode.CNAB400)
    const coreType = rule.mandatoryCore[0]
    const ranges: BoletoRange[] = []
    let currentRange: BoletoRange | null = null

    for (let i = 1; i < this.rawLines.length - 1; i++) {
      const line = this.rawLines[i]
      const recordType = getCnab400RecordType(line)

      if (recordType === coreType) {
        if (currentRange != null) {
          currentRange.endLine = i
          ranges.push(currentRange)
        }
        currentRange = { startLine: i, endLine: i + 1 }
      } else if (rule.optionalSatellites.includes(recordType)) {
        if (currentRange == null) {
          throw new CNABDocumentValidationError(
            `satélite tipo '${recordType}' sem núcleo precedente`,
            i
          )
        }
        currentRange.endLine = i + 1
      } else if (rule.structural.includes(recordType)) {
        throw new CNABDocumentValidationError(
          `tipo estrutural '${recordType}' não deve aparecer no corpo do arquivo`,
          i
        )
      } else {
        throw new CNABDocumentValidationError(
          `tipo de registro '${recordType}' não reconhecido para este banco`,
          i
        )
      }
    }

    if (currentRange != null) {
      ranges.push(currentRange)
    }

    return ranges
  }
}
