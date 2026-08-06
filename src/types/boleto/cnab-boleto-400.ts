import { CnabBoleto } from './cnab-boleto'
import { BoletoCnabData } from '@/types/read/boleto-cnab-data'

export abstract class CnabBoleto400<T extends BoletoCnabData = BoletoCnabData> extends CnabBoleto<T> {
  protected get lineLength(): number {
    return 400
  }

  protected validateStructure(rawContent: string[]): void {
    super.validateStructure(rawContent)

    if (rawContent.length < 1) {
      this.throwStructureError('boleto CNAB 400 deve conter pelo menos 1 linha (detalhe tipo 1)', 0)
      return
    }

    const firstLine = rawContent[0]
    if (firstLine.length === 400) {
      const recordType = firstLine.charAt(0)
      
      if (recordType !== '1' && recordType !== '7') {
        this.throwStructureError(
          `primeira linha deve ser registro detalhe (tipo '1' ou '7'), encontrado tipo '${recordType}'`,
          0
        )
      }
    }
  }
}
