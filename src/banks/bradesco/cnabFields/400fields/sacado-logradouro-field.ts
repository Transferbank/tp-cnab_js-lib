import { CnabField400 } from '@/types/fields/cnab-field-400'

export class Bradesco400SacadoLogradouroField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [274, 314]
  protected readonly description = 'Endereço do Sacado'

  validate(raw: string): void {
    // Campo opcional, apenas valida que não excede o tamanho
  }

  parse(raw: string): string {
    return raw.trim()
  }
}
