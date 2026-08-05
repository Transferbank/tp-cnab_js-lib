import { CnabField400 } from '@/types/fields/cnab-field-400'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoCepField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [326, 334]
  protected readonly description = 'CEP do Sacado'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
