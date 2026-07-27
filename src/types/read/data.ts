/**
 * Dados canônicos de um título/boleto.
 * Abstrai diferenças entre CNAB 240/400 e entre bancos.
 */
export interface CNABData {
  valor?: number
  vencimento?: string // DD/MM/AAAA
  dataEmissao?: string // DD/MM/AAAA
  nossoNumero?: string
  numeroDocumento?: string
  
  sacado?: {
    nome?: string
    documento?: string // CPF/CNPJ sem formatação
    endereco?: {
      logradouro?: string
      bairro?: string
      cep?: string
      cidade?: string
      estado?: string
    }
  }
  
  multa?: {
    tipo?: 'valor' | 'percentual' | 'dispensado'
    valor?: number
    vigenciaAPartirDe?: string // DD/MM/AAAA
  }
  
  juros?: {
    tipo?: 'valor' | 'percentual' | 'dispensado'
    valor?: number
    vigenciaAPartirDe?: string // DD/MM/AAAA
  }
  
  desconto?: {
    valor?: number
    dataLimite?: string // DD/MM/AAAA
  }
  
  abatimento?: {
    valor?: number
  }
}
