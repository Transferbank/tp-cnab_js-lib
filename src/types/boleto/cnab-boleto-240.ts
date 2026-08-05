import { CnabBoleto } from './cnab-boleto'
import { BoletoCnabData } from '@/types/read/boleto-cnab-data'

export abstract class CnabBoleto240<T extends BoletoCnabData = BoletoCnabData> extends CnabBoleto<T> {
  protected validateStructure(rawContent: string[]): void {
    for (let i = 0; i < rawContent.length; i++) {
      const line = rawContent[i]
      
      if (line == null) {
        this.throwStructureError(`linha ${i} não encontrada`, i)
      }
      
      if (line.length !== 240) {
        this.throwStructureError(`linha deve ter 240 caracteres, tem ${line.length}`, i)
      }
    }
  }
}
