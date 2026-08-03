export interface CNABData {
  valor?: number
  vencimento?: string 
  dataEmissao?: string 
  nossoNumero?: string
  numeroDocumento?: string
  
  sacado?: {
    nome?: string
    documento?: string
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
    vigenciaAPartirDe?: string
  }
  
  juros?: {
    tipo?: 'valor' | 'percentual' | 'dispensado'
    valor?: number
    vigenciaAPartirDe?: string
  }
  
  desconto?: {
    valor?: number
    dataLimite?: string
  }
  
  abatimento?: {
    valor?: number
  }
}
