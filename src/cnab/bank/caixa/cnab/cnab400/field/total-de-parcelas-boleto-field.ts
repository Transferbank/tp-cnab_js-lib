import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { TotalDeParcelasBoletoField as Cnab400TotalDeParcelasBoletoField } from '@cnab/field/cnab400/total-de-parcelas-boleto-field'

export class TotalDeParcelasBoletoField extends Cnab400TotalDeParcelasBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
  protected readonly usoDaEmpresaRange: [number, number] | null = [32, 56]
  protected readonly seuNumeroRange: [number, number] = [117, 126]
}
