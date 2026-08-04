import { CnabField } from './cnab-field'

export abstract class CnabField400<T = string | number> extends CnabField<T> {
  protected validateStructure(lines: string[]): void {
    const line = lines[this.lineIndex]
    
    if (line == null) {
      this.throwStructureError(
        `linha ${this.lineIndex} não encontrada`,
        this.lineIndex
      )
    }
    
    if (line.length !== 400) {
      this.throwStructureError(
        `linha deve ter 400 caracteres, tem ${line.length}`,
        this.lineIndex
      )
    }
  }
}
