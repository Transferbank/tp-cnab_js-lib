import { IdentificacaoBoletoField } from '@cnab/field/cnab240/retorno/identificacao-boleto-field'

export class SeuNumeroBoletoField extends IdentificacaoBoletoField {
  readonly fieldKey = 'seu_numero'
  readonly range: [number, number] = [59, 73]
}
