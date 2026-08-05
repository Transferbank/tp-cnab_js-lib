import { CnabField400 } from '@/types/fields/cnab-field-400'
import { DateDDMMAAValidator } from '@/types/fields/validators'
import { DateDDMMAAParser } from '@/types/fields/parsers'

export class Bradesco400DataEmissaoField extends CnabField400<Date> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [150, 156]
  protected readonly description = 'Data de Emissão'
  protected readonly validator = new DateDDMMAAValidator()
  protected readonly parser = new DateDDMMAAParser()
}
