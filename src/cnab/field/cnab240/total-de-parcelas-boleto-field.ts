import { Parcela } from '@cnab/utils/parcela-parser'
import { Cnab240BoletoParcelaField } from '@cnab/field/cnab240/parcela-boleto-field'

export class Cnab240BoletoTotalDeParcelasField extends Cnab240BoletoParcelaField {
  readonly fieldKey: string = 'total_de_parcelas'

  protected pick(found: Parcela): number | null {
    return found.total
  }
}
