import { IdentificacaoBoletoField } from '@cnab/field/cnab400/retorno/identificacao-boleto-field'

export class UsoDaEmpresaBoletoField extends IdentificacaoBoletoField {
  readonly fieldKey = 'uso_da_empresa'
  readonly range: [number, number] = [38, 62]
}
