import { CnabField } from '@/types/fields/cnab-field'
import { DateDDMMAAAAValidator } from '@/types/fields/validators'
import { DateDDMMAAAAParser } from '@/types/fields/parsers'

export class Bradesco240VencimentoField extends CnabField<Date> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [77, 85]
  protected readonly description = 'Data de Vencimento'
  protected readonly key = 'vencimento'
  protected readonly validator = new DateDDMMAAAAValidator()
  protected readonly parser = new DateDDMMAAAAParser()
}
