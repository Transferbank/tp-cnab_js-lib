import { CnabBoleto } from './cnab-boleto'
import { BoletoCnabData } from '@/types/read/boleto-cnab-data'

export abstract class CnabBoleto400<T extends BoletoCnabData = BoletoCnabData> extends CnabBoleto<T> {
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
  }
}
