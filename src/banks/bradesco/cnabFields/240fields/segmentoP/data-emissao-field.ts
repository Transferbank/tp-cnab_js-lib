import { CnabField } from '@/types/fields/cnab-field'
import { DateDDMMAAAAValidator } from '@/types/fields/validators'
import { DateDDMMAAAAParser } from '@/types/fields/parsers'

export class Bradesco240DataEmissaoField extends CnabField<Date> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [109, 117]
  protected readonly description = 'Data de Emissão do Título'
  protected readonly key = 'dataEmissao'
  protected readonly validator = new DateDDMMAAAAValidator()
  protected readonly parser = new DateDDMMAAAAParser()
}
