import { Cnab240BoletoCelularField } from '@cnab/field/cnab240/boleto-celular-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// No Banco do Brasil CNAB240, o segmento Y-04 usa o tipo de registro '4' na posição 8,
//  e não o '3' do padrão FEBRABAN.
//  O celular do BB tem 8 posições (72 a 79), e não 9.
export class Cnab240BancoDoBrasilBoletoCelularField extends Cnab240BoletoCelularField {
  readonly range: [number, number] = [72, 79]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, this.optionalRecordCode, '4')
  }
}
