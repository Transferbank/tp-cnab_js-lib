import { CnabField } from '@/types/fields/cnab-field'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoCepField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [326, 334]
  protected readonly description = 'CEP do Sacado'
  protected readonly key = 'sacadoCep'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
