import { Cnab240BoletoCelularField } from '@cnab/field/cnab240/boleto-celular-field'

// Na Caixa CNAB240, o segmento Y-04 usa o código de registro opcional '04',
// e não o '03' do padrão FEBRABAN.
export class Cnab240CaixaBoletoCelularField extends Cnab240BoletoCelularField {
  protected readonly optionalRecordCode: string = '04'
}
