/**
 * Dados do header do arquivo CNAB.
 * Foca no que é exclusivo do header - banco já está em CNABFile.
 */
export interface CNABHeader {
  cedente: {
    nome?: string
    documento?: string // CPF/CNPJ sem formatação
  }
  dataGeracao?: string // DD/MM/AAAA
}
