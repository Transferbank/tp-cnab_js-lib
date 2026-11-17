import { IdentificacaoBoletoField } from '@cnab/field/cnab400/retorno/identificacao-boleto-field'

export class NossoNumeroBoletoField extends IdentificacaoBoletoField {
  readonly fieldKey = 'nosso_numero'
  readonly range: [number, number] = [63, 70]
}
