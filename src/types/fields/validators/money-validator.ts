import { FieldValidator } from './field-validator'

export class MoneyValidator implements FieldValidator {
  readonly errorMessage: string

  constructor(private readonly decimalPlaces: number = 2) {
    if (decimalPlaces < 0) {
      throw new Error('decimalPlaces deve ser >= 0')
    }
    this.errorMessage = `valor monetário inválido (esperado dígitos com ${decimalPlaces} casas decimais implícitas)`
  }
  
  validate(raw: string): boolean {
    const trimmed = raw.trim()
    
    if (trimmed.length === 0) return false
    if (!/^\d+$/.test(trimmed)) return false
    if (trimmed.length <= this.decimalPlaces) return false
    
    return true
  }
}
