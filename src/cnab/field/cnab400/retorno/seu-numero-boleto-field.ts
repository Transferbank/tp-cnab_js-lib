import { IdentificacaoBoletoField } from '@cnab/field/cnab400/retorno/identificacao-boleto-field'

export class SeuNumeroBoletoField extends IdentificacaoBoletoField {
  readonly fieldKey = 'seu_numero'
  readonly range: [number, number] = [117, 126]
}
