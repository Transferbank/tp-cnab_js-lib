import { Cnab400BoletoEnderecoField } from '@cnab/field/cnab400/boleto-endereco-field'

// Layout do Sicoob usa 37 posições aqui (não 40 como os demais bancos) - o Bairro
// que vem a seguir começa em 312 pra compensar, mas o CEP em diante já bate igual.
export class Cnab400SicoobBoletoEnderecoField extends Cnab400BoletoEnderecoField {
  readonly range: [number, number] = [275, 311]
}
