import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { JurosBoletoField as Cnab400JurosBoletoField } from '@cnab/field/cnab400/juros-boleto-field'

// O layout 400 não tem código nem data de juros: o valor é sempre por dia de atraso,
// cobrado a partir do dia seguinte ao vencimento, sem carência.
// Sem valor informado, o banco aplica a taxa de juros cadastrada para o beneficiário.
export class JurosBoletoField extends Cnab400JurosBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
}
