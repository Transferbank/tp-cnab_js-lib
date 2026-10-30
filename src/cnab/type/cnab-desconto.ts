export interface CnabDesconto {
  codigo: string | null
  data: Date | null
  valor: number | null
}

export interface CnabDescontoRanges {
  codigo?: [number, number]
  data: [number, number]
  valor: [number, number]
}
