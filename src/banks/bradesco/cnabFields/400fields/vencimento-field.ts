import { CnabField400 } from '@/types/fields/cnab-field-400'
import { parseDateDDMMAA } from '@utils/date-parser'

export class Bradesco400VencimentoField extends CnabField400<Date> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [120, 126]
  protected readonly description = 'Data de Vencimento'

  validate(raw: string): void {
    if (raw.trim().length === 0) {
      this.throwError(raw, 'data de vencimento não pode estar vazia')
    }

    if (!/^\d{6}$/.test(raw)) {
      this.throwError(raw, 'data deve ter 6 dígitos no formato DDMMAA')
    }

    const parsed = parseDateDDMMAA(raw)
    if (parsed == null) {
      this.throwError(raw, 'data inválida')
    }
  }

  parse(raw: string): Date {
    const parsed = parseDateDDMMAA(raw)
    if (parsed == null) {
      this.throwError(raw, 'data inválida')
    }
    return parsed
  }
}
