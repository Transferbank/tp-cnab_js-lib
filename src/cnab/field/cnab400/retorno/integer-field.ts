import { ValorField } from '@cnab/field/cnab400/retorno/valor-field'

export abstract class IntegerField extends ValorField {
  protected readonly decimals: number = 0
}
