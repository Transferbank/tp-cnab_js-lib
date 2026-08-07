export type CnabFieldValue = string | number | Date

export interface BoletoCnabData {
  nossoNumero: string
  numeroDocumento: string
  vencimento: Date
  valor: number
  dataEmissao: Date
  desconto: {
    valor: number
  }
  abatimento: {
    valor: number
  }
  sacado: {
    documento: string
    nome: string
    endereco: {
      logradouro: string
      cep: string
    }
  }
  extra?: Record<string, CnabFieldValue>
}

export interface PartialBoletoCnabData {
  nossoNumero?: string
  numeroDocumento?: string
  vencimento?: Date
  valor?: number
  dataEmissao?: Date
  desconto?: {
    valor?: number
  }
  abatimento?: {
    valor?: number
  }
  sacado?: {
    documento?: string
    nome?: string
    endereco?: {
      logradouro?: string
      cep?: string
    }
  }
  extra?: Record<string, CnabFieldValue>
}
