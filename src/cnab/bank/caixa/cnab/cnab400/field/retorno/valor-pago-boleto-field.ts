import { ValorPagoBoletoField as Cnab400ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { JurosPagoBoletoField } from '@cnab/field/cnab400/retorno/juros-pago-boleto-field'
import { MultaPagaBoletoField } from '@cnab/field/cnab400/retorno/multa-paga-boleto-field'
import { CnabFieldClass } from '@cnab/type/cnab-field'

export class ValorPagoBoletoField extends Cnab400ValorPagoBoletoField {
  protected readonly addedFields: Array<CnabFieldClass<number>> = [JurosPagoBoletoField, MultaPagaBoletoField]
}
