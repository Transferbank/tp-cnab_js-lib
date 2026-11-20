import { NossoNumeroBoletoField as Cnab400NossoNumeroBoletoField } from '@cnab/field/cnab400/retorno/nosso-numero-boleto-field'

// Sem confirmação do banco: o manual (2026, p.38) descreve 48–62 como "Nosso número Sicredi sem edição", Numérico.
// A escrita alinha à esquerda com espaços, como foi observado em retornos do Sicredi, e não com zeros à esquerda.
// Fica assim até haver confirmação, para o arquivo escrito seguir o que o banco de fato manda.
export class NossoNumeroBoletoField extends Cnab400NossoNumeroBoletoField {
  readonly range: [number, number] = [48, 62]
  protected readonly numeric: boolean = false
}
