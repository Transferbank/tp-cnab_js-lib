import { CnabField } from '@/types/fields/cnab-field'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400CodigoOcorrenciaField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [108, 110]
  protected readonly description = 'Código de Ocorrência'
  protected readonly key = 'codigoOcorrencia'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
