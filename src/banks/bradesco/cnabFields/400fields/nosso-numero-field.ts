import { CnabField } from '@/types/fields/cnab-field'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400NossoNumeroField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [70, 81]
  protected readonly description = 'Nosso Número'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
