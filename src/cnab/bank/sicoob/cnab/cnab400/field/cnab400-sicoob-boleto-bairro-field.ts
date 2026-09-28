import { Cnab400BoletoBairroField } from '@cnab/field/cnab400/boleto-bairro-field'

// Layout do Sicoob desloca esse campo pra 312 (em vez de 315) pra compensar o
// endereço de 37 posições (não 40 como os demais bancos).
export class Cnab400SicoobBoletoBairroField extends Cnab400BoletoBairroField {
  readonly range: [number, number] = [312, 326]
}
