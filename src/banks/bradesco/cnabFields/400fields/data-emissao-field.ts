import { CnabField } from '@/types/fields/cnab-field'
import { DateDDMMAAValidator } from '@/types/fields/validators'
import { DateDDMMAAParser } from '@/types/fields/parsers'

export class Bradesco400DataEmissaoField extends CnabField<Date> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [150, 156]
  protected readonly description = 'Data de Emissão'
  protected readonly validator = new DateDDMMAAValidator()
  protected readonly parser = new DateDDMMAAParser()
}
