import { IdentificacaoBoletoField } from '@cnab/field/cnab240/retorno/identificacao-boleto-field'

export class NossoNumeroBoletoField extends IdentificacaoBoletoField {
  readonly fieldKey = 'nosso_numero'
  readonly range: [number, number] = [38, 57]
}
