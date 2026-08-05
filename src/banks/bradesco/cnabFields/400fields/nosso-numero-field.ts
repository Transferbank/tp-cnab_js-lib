import { CnabField400 } from '@/types/fields/cnab-field-400'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400NossoNumeroField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [70, 81]
  protected readonly description = 'Nosso Número'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
