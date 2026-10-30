import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'

export interface CnabDesconto {
  codigo: string | null
  tipo: CnabTipoDeDesconto | null
  data: Date | null
  valor: number | null
}

export interface CnabDescontoRanges {
  codigo?: [number, number]
  data: [number, number]
  valor: [number, number]
}
