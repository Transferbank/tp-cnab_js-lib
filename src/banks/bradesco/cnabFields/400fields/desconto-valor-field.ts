import { CnabField } from '@/types/fields/cnab-field'
import { MoneyValidator } from '@/types/fields/validators'
import { MoneyParser } from '@/types/fields/parsers'

export class Bradesco400DescontoValorField extends CnabField<number> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [179, 192]
  protected readonly description = 'Valor do Desconto'
  protected readonly key = 'descontoValor'
  protected readonly validator = new MoneyValidator(2)
  protected readonly parser = new MoneyParser(2)
}
