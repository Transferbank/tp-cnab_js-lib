import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { SeuNumeroBoletoField as Cnab400SeuNumeroBoletoField } from '@cnab/field/cnab400/seu-numero-boleto-field'

// Registro 5 vem depois do 7: quando existe, 
// sobrescreve o seu_numero do registro 7 com esta aqui.
// Isto é uma determinação explícita no próprio manual do banco
export class SeuNumeroRegistro5BoletoField extends Cnab400SeuNumeroBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '503'
  readonly range: [number, number] = [4, 18]
}
