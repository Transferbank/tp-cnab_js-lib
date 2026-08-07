import { CnabBoleto } from './cnab-boleto'

export abstract class CnabBoleto240 extends CnabBoleto {
  protected get lineLength(): number {
    return 240
  }

  protected validateStructure(rawContent: string[]): void {
    super.validateStructure(rawContent)

    if (rawContent.length < 2) {
      this.throwStructureError('boleto CNAB 240 deve conter pelo menos 2 linhas (Segmento P + Segmento Q)', 0)
      return
    }

    const firstLine = rawContent[0]
    const secondLine = rawContent[1]

    if (firstLine.length === 240) {
      const recordType = firstLine.charAt(7)
      const segmentCode = firstLine.charAt(13)

      if (recordType !== '3' || segmentCode !== 'P') {
        this.throwStructureError(
          `primeira linha deve ser Segmento P (tipo '3', segmento 'P'), encontrado tipo '${recordType}' segmento '${segmentCode}'`,
          0
        )
      }
    }

    if (secondLine.length === 240) {
      const recordType = secondLine.charAt(7)
      const segmentCode = secondLine.charAt(13)

      if (recordType !== '3' || segmentCode !== 'Q') {
        this.throwStructureError(
          `segunda linha deve ser Segmento Q (tipo '3', segmento 'Q'), encontrado tipo '${recordType}' segmento '${segmentCode}'`,
          1
        )
      }
    }
  }
}
