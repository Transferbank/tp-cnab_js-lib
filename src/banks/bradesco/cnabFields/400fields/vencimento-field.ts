import { CnabField } from '@/types/fields/cnab-field'
import { DateDDMMAAValidator } from '@/types/fields/validators'
import { DateDDMMAAParser } from '@/types/fields/parsers'

export class Bradesco400VencimentoField extends CnabField<Date> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [120, 126]
  protected readonly description = 'Data de Vencimento'
  protected readonly key = 'vencimento'
  protected readonly validator = new DateDDMMAAValidator()
  protected readonly parser = new DateDDMMAAParser()
}
