import { Cnab240BoletoDddField } from '@cnab/field/cnab240/boleto-ddd-field'

// Na Caixa CNAB240, o segmento Y-04 usa o código de registro opcional '04',
// e não o '03' do padrão FEBRABAN.
export class Cnab240CaixaBoletoDddField extends Cnab240BoletoDddField {
  protected readonly optionalRecordCode: string = '04'
}
