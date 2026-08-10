import { CnabBoleto } from './cnab-boleto'
import { getGroupingRule } from '@/grouping/grouping-rules'
import { CNABFormatCode } from '@/types/core/cnab'
import { getCnab400RecordType } from '@/parser/position-reader'

export abstract class CnabBoleto400 extends CnabBoleto {
  protected get lineLength(): number {
    return 400
  }

  protected validateStructure(rawContent: string[]): void {
    if (rawContent.length === 0) {
      this.throwStructureError('boleto deve conter pelo menos uma linha', 0)
    }

    for (let i = 0; i < rawContent.length; i++) {
      const line = rawContent[i]
      
      if (line == null) {
        this.throwStructureError(`linha ${i} não encontrada`, i)
      }
      
      if (line.length !== 400) {
        this.throwStructureError(`linha deve ter 400 caracteres, tem ${line.length}`, i)
      }
    }

    const rule = getGroupingRule(this.bankCode, CNABFormatCode.CNAB400)
    const coreType = rule.mandatoryCore[0]

    const firstRecordType = getCnab400RecordType(rawContent[0])
    if (firstRecordType !== coreType) {
      this.throwStructureError(
        `primeira linha deve ser registro detalhe (tipo '${coreType}'), encontrado tipo '${firstRecordType}'`,
        0
      )
    }

    for (let i = 1; i < rawContent.length; i++) {
      const satelliteType = getCnab400RecordType(rawContent[i])
      if (!rule.optionalSatellites.includes(satelliteType)) {
        this.throwStructureError(
          `linha ${i}: tipo '${satelliteType}' não é satélite reconhecido para este banco (tipos válidos: ${rule.optionalSatellites.join(', ')})`,
          i
        )
      }
    }
  }
}
