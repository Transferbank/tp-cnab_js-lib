import { BairroBoletoField } from '@cnab/field/cnab240/bairro-boleto-field'

// Nota do manual: o layout declara 114 a 128 (15 posições), mas "são tratadas somente
// 12 posições, da posição 114 a 125" - usamos o range realmente tratado pelo banco.
export class Cnab240BancoDoBrasilBoletoBairroField extends BairroBoletoField {
  readonly range: [number, number] = [114, 125]
}
