import { CnabField400 } from '@/types/fields/cnab-field-400'

export class Bradesco400NossoNumeroField extends CnabField400<string> {
  protected readonly lineIndex = 1 // linha de detalhe
  protected readonly pos: [number, number] = [70, 81]
  protected readonly description = 'Nosso Número'

  validate(raw: string): void {
    if (raw.trim().length === 0) {
      this.throwError(raw, 'nosso número não pode estar vazio')
    }

    if (!/^\d+$/.test(raw.trim())) {
      this.throwError(raw, 'nosso número deve conter apenas dígitos')
    }
  }

  parse(raw: string): string {
    return raw.trim()
  }
}
