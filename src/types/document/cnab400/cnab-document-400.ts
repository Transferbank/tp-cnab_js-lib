import { CnabDocument, BoletoRange } from '../cnab-document'
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import { getGroupingRule } from '@/grouping/grouping-rules'
import { getCnab400RecordType } from '@/parser/position-reader'

export abstract class CnabDocument400<
  TBoleto extends CnabBoleto = CnabBoleto
> extends CnabDocument<TBoleto> {
  get type(): CNABFormatCode {
    return CNABFormatCode.CNAB400
  }

  protected abstract get bankCode(): string

  private validateStructuralLine(
    line: string,
    lineNumber: number,
    expectedType: string,
    label: string
  ): void {
    if (line.length !== 400) {
      this.throwDocError(
        `${label} deve ter 400 caracteres, tem ${line.length}`,
        lineNumber
      )
    }

    const recordType = getCnab400RecordType(line)
    if (recordType !== expectedType) {
      this.throwDocError(
        `${label} deve ser tipo '${expectedType}', encontrado '${recordType}'`,
        lineNumber
      )
    }
  }

  protected validateHeader(): void {
    if (this.rawLines.length < 2) {
      this.throwDocError('arquivo deve ter pelo menos header e trailer')
    }

    this.validateStructuralLine(this.rawLines[0], 0, '0', 'header')
  }

  protected validateTrailer(): void {
    const lastIndex = this.rawLines.length - 1
    this.validateStructuralLine(this.rawLines[lastIndex], lastIndex, '9', 'trailer')
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
          this.throwDocError(
            `satélite tipo '${recordType}' sem núcleo precedente`,
            i
          )
        }
        currentRange.endLine = i + 1
      } else if (rule.structural.includes(recordType)) {
        this.throwDocError(
          `tipo estrutural '${recordType}' não deve aparecer no corpo do arquivo`,
          i
        )
      } else {
        this.throwDocError(
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
