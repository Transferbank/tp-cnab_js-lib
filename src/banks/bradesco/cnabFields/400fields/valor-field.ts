import { CnabField400 } from '@/types/fields/cnab-field-400'

export class Bradesco400ValorField extends CnabField400<number> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [126, 139]
  protected readonly description = 'Valor do Título'

  validate(raw: string): void {
    if (!/^\d+$/.test(raw)) {
      this.throwError(raw, 'valor deve conter apenas dígitos')
    }
  }

  parse(raw: string): number {
    return parseInt(raw, 10) / 100
  }
}
