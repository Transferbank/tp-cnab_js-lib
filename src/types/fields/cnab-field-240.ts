import { CnabField } from './cnab-field'

export abstract class CnabField240<T = string | number> extends CnabField<T> {
  protected validateStructure(lines: string[]): void {
    const line = lines[this.lineIndex]
    
    if (line == null) {
      this.throwStructureError(
        `linha ${this.lineIndex} não encontrada`,
        this.lineIndex
      )
    }
    
    if (line.length !== 240) {
      this.throwStructureError(
        `linha deve ter 240 caracteres, tem ${line.length}`,
        this.lineIndex
      )
    }
  }
}
