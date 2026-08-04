import { CnabField400 } from '@/types/fields/cnab-field-400'

export class Bradesco400SacadoCepField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [326, 334]
  protected readonly description = 'CEP do Sacado'

  validate(raw: string): void {
    if (raw.trim().length > 0 && !/^\d+$/.test(raw.trim())) {
      this.throwError(raw, 'CEP deve conter apenas dígitos')
    }
  }

  parse(raw: string): string {
    const cep = raw.trim()
    if (cep.length === 0) return ''
    return cep
  }
}
