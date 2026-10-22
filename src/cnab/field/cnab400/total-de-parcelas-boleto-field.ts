import { Parcela } from '@cnab/utils/parcela-parser'
import { Cnab400BoletoParcelaField } from '@cnab/field/cnab400/parcela-boleto-field'

export class Cnab400BoletoTotalDeParcelasField extends Cnab400BoletoParcelaField {
  readonly fieldKey: string = 'total_de_parcelas'

  protected pick(found: Parcela): number | null {
    return found.total
  }
}
