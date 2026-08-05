import { CnabField400 } from '@/types/fields/cnab-field-400'
import { MoneyValidator } from '@/types/fields/validators'
import { MoneyParser } from '@/types/fields/parsers'

export class Bradesco400ValorField extends CnabField400<number> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [126, 139]
  protected readonly description = 'Valor do Título'
  protected readonly validator = new MoneyValidator(2)
  protected readonly parser = new MoneyParser(2)
}
