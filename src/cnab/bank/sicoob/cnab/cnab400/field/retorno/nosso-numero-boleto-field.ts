import { NossoNumeroBoletoField as Cnab400NossoNumeroBoletoField } from '@cnab/field/cnab400/retorno/nosso-numero-boleto-field'

// A aba de retorno da planilha marca o DV (posição 74) como X(01) (alfanumérico de 1 posição), mas a aba de remessa
// descreve 63–74 como 9(12), numérico, com o DV calculado pelo módulo 11. A escrita segue a remessa.
export class NossoNumeroBoletoField extends Cnab400NossoNumeroBoletoField {
  readonly range: [number, number] = [63, 74]
}
