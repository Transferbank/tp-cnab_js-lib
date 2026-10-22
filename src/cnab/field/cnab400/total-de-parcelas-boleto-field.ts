import { Parcela } from '@cnab/utils/parcela-parser'
import { ParcelaBoletoField } from '@cnab/field/cnab400/parcela-boleto-field'

export class TotalDeParcelasBoletoField extends ParcelaBoletoField {
  readonly fieldKey: string = 'total_de_parcelas'

  protected pick(found: Parcela): number | null {
    return found.total
  }
}
